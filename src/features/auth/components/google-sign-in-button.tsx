"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { googleAuth } from "../api/auth.api";
import { ApiException } from "@/lib/api/types";

const GSI_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Minimal shape of the Google Identity Services global we use.
interface GoogleCredentialResponse {
  credential?: string;
}
interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (resp: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}
declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

/**
 * "Continue with Google" — renders Google Identity Services' button, exchanges
 * the returned ID token with our backend (/auth/google), then seeds the NextAuth
 * session via the existing pre-issued-session path. No auth logic lives here
 * beyond wiring; the backend remains the token authority.
 */
export function GoogleSignInButton({ referralCode }: { referralCode?: string }) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredential = useCallback(
    async (resp: GoogleCredentialResponse) => {
      if (!resp.credential) return;
      setPending(true);
      setError(null);
      try {
        const data = await googleAuth(resp.credential, referralCode ? {
          referral_code: referralCode,
          referral_source_detail: "affiliate_link",
        } : undefined);
        const result = await signIn("credentials", {
          prelogin: JSON.stringify({
            accessToken: data.access_token,
            refreshToken: "",
            accessTokenExpiryMinutes: data.access_token_expiry_minutes ?? 30,
            user: data.user,
          }),
          redirect: false,
        });
        if (result?.ok) {
          router.replace("/dashboard");
          router.refresh();
          return;
        }
        setError("Could not start your session. Please try again.");
      } catch (err) {
        setError(
          err instanceof ApiException
            ? err.message
            : "Google sign-in failed. Please try again."
        );
      } finally {
        setPending(false);
      }
    },
    [router, referralCode]
  );

  useEffect(() => {
    if (!scriptReady || !CLIENT_ID || !buttonRef.current) return;
    const gsi = window.google?.accounts?.id;
    if (!gsi) return;

    gsi.initialize({ client_id: CLIENT_ID, callback: handleCredential });
    gsi.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: 320,
    });
  }, [scriptReady, handleCredential]);

  // Without a client ID configured there's nothing to render.
  if (!CLIENT_ID) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <Script
        src={GSI_SRC}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div className="relative w-full">
        {/* Google's rendered button */}
        <div ref={buttonRef} className="flex justify-center" />
        {pending ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-card-bg/70">
            <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
