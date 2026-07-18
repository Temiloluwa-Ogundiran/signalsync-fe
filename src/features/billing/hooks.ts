import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { queryKeys } from "@/lib/api/query-keys";
import {
  cancelSubscription,
  getSubscription,
  startCheckout,
} from "./api";

export function useSubscription() {
  const { data: session, status } = useSession();
  return useQuery({
    queryKey: queryKeys.billing.subscription(),
    queryFn: () => getSubscription(session?.accessToken),
    enabled: status === "authenticated" && !!session?.accessToken,
    staleTime: 15_000,
  });
}
export function useStartCheckout() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { plan: "journal" | "copy"; copy_accounts: number }) =>
      startCheckout(payload, session?.accessToken),
    onSuccess: (result) => {
      queryClient.setQueryData(
        queryKeys.billing.subscription(),
        result.subscription,
      );
    },
  });
}

export function useCancelSubscription() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelSubscription(session?.accessToken),
    onSuccess: (result) => {
      queryClient.setQueryData(
        queryKeys.billing.subscription(),
        result.subscription,
      );
    },
  });
}
