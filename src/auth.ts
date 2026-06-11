import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { resolveAuthBackendUrl } from "./lib/auth-backend-url.ts";

class BackendCredentialsSigninError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.code = message;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // Send request as required by OAuth2PasswordRequestForm
          const formData = new URLSearchParams();
          formData.append('username', credentials.email as string);
          formData.append('password', credentials.password as string);
          
          const backendUrl = resolveAuthBackendUrl();
          
          const res = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          });

          if (!res.ok) {
            // Read backend error message to surface to frontend
            const errorData = await res.json().catch(() => null);
            let errorMessage = "Authentication failed. Please check your credentials.";
            
            if (errorData?.detail) {
              // FastAPI typically sends string details or objects
              errorMessage = typeof errorData.detail === "string" 
                ? errorData.detail 
                : (errorData.detail.message || errorMessage);
            }
            
            // Throw a credentials error so `signIn(..., { redirect: false })` returns
            // the backend message in `result.code`.
            throw new BackendCredentialsSigninError(errorMessage);
          }

          const data = await res.json();
          const { access_token, user, access_token_expiry_minutes } = data;
          
          let refreshToken = "";
          const setCookieHeader = res.headers.get("set-cookie");
          // Extract refresh_token from the set-cookie header if it exists
          if (setCookieHeader) {
            const match = setCookieHeader.match(/refresh_token=([^;]+)/);
            if (match) {
              refreshToken = match[1];
            }
          }
          
          // NextAuth expects 'id', 'email', 'name' by default in user object
          // but we can pass whatever we need defined in our types.ts
          return {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.display_name ?? null,
            avatarUrl: user.avatar_url ?? null,
            name: user.display_name || user.username,
            isEmailVerified: user.is_email_verified,
            accessToken: access_token,
            refreshToken: refreshToken,
            expiresAt: Date.now() + (access_token_expiry_minutes * 60 * 1000),
          };
        } catch (error) {
          console.error("Auth error:", error);

          // Preserve credential failures so the UI can map provider error codes consistently.
          if (error instanceof Error) {
            throw error;
          }

          throw new Error("Authentication failed. Please try again.");
        }
      },
    }),
  ],
});
