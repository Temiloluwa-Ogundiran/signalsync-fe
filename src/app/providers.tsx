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
import {
  refreshAuthSensitiveQueries,
  resetAuthSensitiveQueries,
} from "@/features/auth/lib/auth-query-state";
import { hasUsableSession } from "@/lib/auth-session";

function SessionQuerySync() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const lastTokenRef = useRef<string | null>(null);
  const lastAuthStateRef = useRef<"authenticated" | "anonymous">("anonymous");

  useEffect(() => {
    const isAuthenticated =
      status === "authenticated" && hasUsableSession(session);

    if (!isAuthenticated) {
      if (lastAuthStateRef.current !== "anonymous") {
        resetAuthSensitiveQueries(queryClient);
        lastAuthStateRef.current = "anonymous";
        lastTokenRef.current = null;
      }
      return;
    }

    const token = session.accessToken;
    const authStateChanged = lastAuthStateRef.current !== "authenticated";
    const tokenChanged = token !== lastTokenRef.current;

    if (!authStateChanged && !tokenChanged) {
      return;
    }

    refreshAuthSensitiveQueries(queryClient);
    lastAuthStateRef.current = "authenticated";
    lastTokenRef.current = token;
  }, [status, session?.accessToken, session?.error, queryClient]);

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
