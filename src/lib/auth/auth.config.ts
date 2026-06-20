import type { NextAuthConfig } from "next-auth";
import { resolveAuthBackendUrl } from "./auth-backend-url";
import { extractRefreshToken } from "./parse-refresh-cookie";

function parseJsonObjectSafely(
  rawBody: string,
  contentType: string | null,
): Record<string, unknown> | null {
  if (!rawBody) {
    return null;
  }

  const looksJson =
    contentType?.includes("application/json") ||
    rawBody.startsWith("{") ||
    rawBody.startsWith("[");

  if (!looksJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawBody);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }

  return null;
}

class RefreshFailureError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RefreshFailureError";
  }
}

type RefreshedTokenFields = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

// Single-flight: NextAuth runs the `jwt` callback per request, so concurrent
// requests on an expired access token would each fire `/auth/refresh` and race
// the backend's token rotation — the loser ends up pinned to a revoked token and
// gets force-logged-out. Dedupe by sharing one in-flight refresh per refresh
// token. Module scope persists for the life of the server instance.
const inFlightRefreshes = new Map<string, Promise<RefreshedTokenFields>>();

async function performRefresh(refreshToken: string): Promise<RefreshedTokenFields> {
  const backendUrl = resolveAuthBackendUrl();
  const res = await fetch(`${backendUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      "Cookie": `refresh_token=${refreshToken}`,
    },
  });

  const rawBody = await res.text();
  const tokens = parseJsonObjectSafely(rawBody, res.headers.get("content-type"));

  if (!res.ok) {
    throw buildRefreshFailureError(res, rawBody);
  }

  if (
    !tokens ||
    typeof tokens.access_token !== "string" ||
    typeof tokens.access_token_expiry_minutes !== "number"
  ) {
    throw new Error("Refresh endpoint returned an invalid response payload.");
  }

  // Adopt the rotated refresh token. The backend now always returns a fresh
  // cookie on a successful refresh (normal rotation AND the concurrent-rotation
  // grace path), so `rotated` should be present; the fallback only guards a
  // legacy/edge response that omits it.
  const rotated = extractRefreshToken(res);
  const newRefreshToken = rotated ?? refreshToken;

  return {
    accessToken: tokens.access_token,
    refreshToken: newRefreshToken,
    expiresAt: Date.now() + tokens.access_token_expiry_minutes * 60 * 1000,
  };
}

function refreshSession(refreshToken: string): Promise<RefreshedTokenFields> {
  const existing = inFlightRefreshes.get(refreshToken);
  if (existing) {
    return existing;
  }
  const promise = performRefresh(refreshToken).finally(() => {
    inFlightRefreshes.delete(refreshToken);
  });
  inFlightRefreshes.set(refreshToken, promise);
  return promise;
}

function buildRefreshFailureError(
  response: Response,
  rawBody: string,
): Error {
  const parsedBody = parseJsonObjectSafely(
    rawBody,
    response.headers.get("content-type"),
  );
  const detail =
    typeof parsedBody?.detail === "string"
      ? parsedBody.detail
      : rawBody.trim().slice(0, 200);

  return new RefreshFailureError(
    response.status,
    detail
      ? `Refresh request failed (${response.status}): ${detail}`
      : `Refresh request failed with status ${response.status}.`,
  );
}

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  // 30-day rolling session — matches the backend refresh-token window so an
  // active user effectively stays logged in (a trade journal should be sticky).
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn =
        !!auth?.user && !!auth.accessToken && auth.error !== "RefreshAccessTokenError";
      const pathname = nextUrl.pathname;
      const onboardingCompleted = auth?.user?.onboardingCompleted === true;
      const isOnboardingRoute = pathname.startsWith("/onboarding");

      // Public routes — everything else requires auth
      const PUBLIC_PREFIXES = [
        "/login",
        "/register",
        "/verify-email",
        "/forgot-password",
        "/reset-password",
      ];
      const isPublicRoute =
        pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
      const isAuthRoute =
        pathname.startsWith("/login") || pathname.startsWith("/register");

      // ── Onboarding gate (signed-in users only) ──────────────────────────────
      // A signed-in user who hasn't finished onboarding is funnelled to
      // /onboarding; once done they can't go back to it.
      if (isLoggedIn && !onboardingCompleted && !isOnboardingRoute && !isPublicRoute) {
        return Response.redirect(new URL("/onboarding", nextUrl));
      }
      if (isLoggedIn && onboardingCompleted && isOnboardingRoute) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (!isLoggedIn && isOnboardingRoute) {
        // Not signed in — onboarding requires auth.
        return false;
      }

      if (!isPublicRoute) {
        // Protected by default — unauthenticated users are redirected to login
        return isLoggedIn;
      }

      if (isLoggedIn && isAuthRoute) {
        // Onboarded → dashboard; mid-onboarding → onboarding.
        return Response.redirect(
          new URL(onboardingCompleted ? "/dashboard" : "/onboarding", nextUrl),
        );
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // First login
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresAt = user.expiresAt;
        token.id = user.id;
        token.displayName = user.displayName;
        token.avatarUrl = user.avatarUrl;
        token.email = user.email;
        token.isEmailVerified = user.isEmailVerified;
        token.onboardingCompleted = user.onboardingCompleted ?? false;
        return token;
      }

      // Client called session.update(...) — used to flip onboardingCompleted to
      // true after the onboarding flow finishes, without a full re-login.
      if (trigger === "update" && session?.onboardingCompleted) {
        token.onboardingCompleted = true;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Avoid a noisy retry loop when we already know refresh is broken.
      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      // Access token has expired, try to update it using refresh_token.
      // Concurrent jwt-callback invocations share a single in-flight request
      // (see refreshSession) so they don't race the backend's token rotation.
      try {
        const refreshed = await refreshSession(token.refreshToken as string);

        return {
          ...token,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          expiresAt: refreshed.expiresAt,
        };
      } catch (error) {
        if (error instanceof RefreshFailureError && error.status === 401) {
          console.warn("Session refresh token expired; user must sign in again.");
        } else {
          console.error("Error refreshing access token", error);
        }
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          displayName: (token.displayName as string) ?? null,
          avatarUrl: (token.avatarUrl as string) ?? null,
          isEmailVerified: token.isEmailVerified as boolean,
          onboardingCompleted: (token.onboardingCompleted as boolean) ?? false,
          emailVerified: null,
        };
        session.accessToken = token.accessToken as string;
        session.expiresAt = token.expiresAt as number;
        session.error = token.error as string | undefined;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      if (!("token" in message) || !message.token?.refreshToken) {
        return;
      }

      try {
        const backendUrl = resolveAuthBackendUrl();

        // Best-effort token revocation. Sign-out blocks on this event, so cap it
        // with a short timeout — a slow/cold backend must not stall logout. The
        // session is cleared locally regardless; a stale refresh token expires.
        await fetch(`${backendUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Cookie: `refresh_token=${message.token.refreshToken}`,
          },
          signal: AbortSignal.timeout(2500),
        });
      } catch {
        console.error("Failed to revoke backend refresh token during sign-out");
      }
    },
  },
  providers: [],
} satisfies NextAuthConfig;
