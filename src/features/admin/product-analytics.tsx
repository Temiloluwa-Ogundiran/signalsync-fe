"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import apiClient, { withAuth } from "@/lib/api/client";

type EventName =
  | "page_view"
  | "session_engaged"
  | "login_started"
  | "login_succeeded"
  | "registration_started";

function sessionId() {
  const key = "tradepartna.product-session";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem(key, created);
  return created;
}

export function ProductAnalytics() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const engaged = useRef(false);

  useEffect(() => {
    if (!pathname) return;
    const emit = (event_name: EventName) => {
      void apiClient.post(
        "/events",
        {
          session_id: sessionId(),
          event_name,
          path: pathname,
          referrer_host: document.referrer ? new URL(document.referrer).host : null,
          metadata: { device: window.innerWidth < 768 ? "mobile" : "desktop" },
          occurred_at: new Date().toISOString(),
        },
        withAuth(session?.accessToken),
      ).catch(() => undefined);
    };

    emit("page_view");
    if (pathname.startsWith("/login")) emit("login_started");
    if (pathname.startsWith("/register")) emit("registration_started");

    const timer = window.setTimeout(() => {
      if (!engaged.current) {
        engaged.current = true;
        emit("session_engaged");
      }
    }, 10_000);
    return () => window.clearTimeout(timer);
  }, [pathname, session?.accessToken]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const key = "tradepartna.login-succeeded";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void apiClient.post(
      "/events",
      {
        session_id: sessionId(),
        event_name: "login_succeeded",
        path: pathname || "/",
        referrer_host: null,
        metadata: { result: "success" },
        occurred_at: new Date().toISOString(),
      },
      withAuth(session?.accessToken),
    ).catch(() => undefined);
  }, [pathname, session?.accessToken, status]);

  return null;
}
