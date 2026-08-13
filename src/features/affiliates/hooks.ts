import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getAffiliateDashboard } from "./api";

export function useAffiliateDashboard() {
  const { data: session, status } = useSession();
  return useQuery({
    queryKey: ["affiliate", "dashboard"],
    queryFn: () => getAffiliateDashboard(session?.accessToken),
    enabled: status === "authenticated" && !!session?.accessToken,
    staleTime: 15_000,
  });
}
