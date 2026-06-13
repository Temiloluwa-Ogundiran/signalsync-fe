import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { aiApi } from "../api/ai.api";

export function useAiSuggestions() {
  const { data: session, status } = useSession();
  return useQuery({
    queryKey: ["ai-suggestions"],
    queryFn: () => aiApi.getSuggestions(session?.accessToken),
    enabled: status === "authenticated",
    staleTime: 5 * 60 * 1000,
  });
}
