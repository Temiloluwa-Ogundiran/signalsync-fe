import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // All dashboard routes that require auth
      const isProtectedRoute =
        pathname.startsWith("/overview") ||
        pathname.startsWith("/discover") ||
        pathname.startsWith("/feed") ||
        pathname.startsWith("/copy-trading") ||
        pathname.startsWith("/journal") ||
        pathname.startsWith("/spaces") ||
        pathname.startsWith("/tools") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/stream") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/post");

      const isAuthRoute =
        pathname.startsWith("/login") || pathname.startsWith("/register");

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // NextAuth redirects to signIn page automatically
      }

      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/overview", nextUrl));
      }

      return true;
    },
    async jwt({ token, user, account }) {
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

      // Access token has expired, try to update it using refresh_token
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/auth/refresh`, {
          method: "POST",
          headers: {
            "Cookie": `refresh_token=${token.refreshToken}`,
          },
        });

        const tokens = await res.json();
        
        if (!res.ok) throw tokens;
        
        // Exract the rotated refresh token if provided
        let newRefreshToken = token.refreshToken as string;
        const setCookieHeader = res.headers.get("set-cookie");
        if (setCookieHeader) {
          const match = setCookieHeader.match(/refresh_token=([^;]+)/);
          if (match) {
            newRefreshToken = match[1];
          }
        }

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
        session.refreshToken = token.refreshToken as string;
        session.expiresAt = token.expiresAt as number;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
