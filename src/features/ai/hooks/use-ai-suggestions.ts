import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { queryKeys } from "@/lib/api/query-keys";
import { aiApi } from "../api/ai.api";

export function useAiSuggestions() {
  const { status } = useSession();
  return useQuery({
    queryKey: queryKeys.ai.suggestions(),
    queryFn: () => aiApi.getSuggestions(),
    enabled: status === "authenticated",
    staleTime: 5 * 60 * 1000,
  });
}
