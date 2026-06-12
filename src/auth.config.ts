import type { NextAuthConfig } from "next-auth";
import { resolveAuthBackendUrl } from "./lib/auth-backend-url.ts";
import { extractRefreshToken } from "./lib/auth/parse-refresh-cookie";

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

  return new Error(
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
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn =
        !!auth?.user && !!auth.accessToken && auth.error !== "RefreshAccessTokenError";
      const pathname = nextUrl.pathname;

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

      if (!isPublicRoute) {
        // Protected by default — unauthenticated users are redirected to login
        return isLoggedIn;
      }

      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/journal", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      // First login
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresAt = user.expiresAt;
        token.id = user.id;
        token.username = user.username;
        token.displayName = user.displayName;
        token.avatarUrl = user.avatarUrl;
        token.email = user.email;
        token.isEmailVerified = user.isEmailVerified;
        return token;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Avoid a noisy retry loop when we already know refresh is broken.
      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      // Access token has expired, try to update it using refresh_token
      try {
        const backendUrl = resolveAuthBackendUrl();
        const res = await fetch(`${backendUrl}/auth/refresh`, {
          method: "POST",
          headers: {
            "Cookie": `refresh_token=${token.refreshToken}`,
          },
        });

        const rawBody = await res.text();
        const tokens = parseJsonObjectSafely(
          rawBody,
          res.headers.get("content-type"),
        );

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
        
        // Extract the rotated refresh token if provided
        const newRefreshToken = extractRefreshToken(res) ?? (token.refreshToken as string);

        return {
          ...token,
          accessToken: tokens.access_token,
          refreshToken: newRefreshToken,
          expiresAt: Date.now() + (tokens.access_token_expiry_minutes * 60 * 1000),
        };
      } catch (error) {
        console.error("Error refreshing access token", error);
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
          username: token.username as string,
          displayName: (token.displayName as string) ?? null,
          avatarUrl: (token.avatarUrl as string) ?? null,
          isEmailVerified: token.isEmailVerified as boolean,
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

        await fetch(`${backendUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Cookie: `refresh_token=${message.token.refreshToken}`,
          },
        });
      } catch {
        console.error("Failed to revoke backend refresh token during sign-out");
      }
    },
  },
  providers: [],
} satisfies NextAuthConfig;
