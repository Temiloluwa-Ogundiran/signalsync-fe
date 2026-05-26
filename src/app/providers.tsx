"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { SessionProvider, useSession } from "next-auth/react";

function SessionQuerySync() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    const token = session?.accessToken ?? null;
    if (!token || token === lastTokenRef.current) return;
    lastTokenRef.current = token;

    queryClient.invalidateQueries({ queryKey: ["my-streams"] });
    queryClient.invalidateQueries({ queryKey: ["discover-streams"] });
    queryClient.invalidateQueries({ queryKey: ["stream-detail"] });
    queryClient.invalidateQueries({ queryKey: ["my-posts"] });
  }, [status, session?.accessToken, queryClient]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <SessionQuerySync />
          {children}
          <Toaster richColors position="bottom-right" />
        </NuqsAdapter>
      </QueryClientProvider>
    </SessionProvider>
  );
}
