import NextAuth from "next-auth";
import { AuthError, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { resolveAuthBackendUrl } from "./lib/auth-backend-url.ts";
import { isExpectedAuthFlowError } from "./lib/auth-error-logging.ts";
import { extractRefreshToken } from "./lib/auth/parse-refresh-cookie";

class BackendCredentialsSigninError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.code = message;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  logger: {
    error(error) {
      if (isExpectedAuthFlowError(error)) {
        return;
      }

      if (error instanceof AuthError) {
        console.error(`[auth][error] ${error.type}: ${error.message}`);

        if (
          error.cause &&
          typeof error.cause === "object" &&
          "err" in error.cause &&
          error.cause.err instanceof Error
        ) {
          const { err, ...data } = error.cause;
          console.error("[auth][cause]:", err.stack);
          if (Object.keys(data).length > 0) {
            console.error("[auth][details]:", JSON.stringify(data, null, 2));
          }
        } else if (error.stack) {
          console.error(error.stack.replace(/.*/, "").substring(1));
        }
        return;
      }

      if (error instanceof Error) {
        console.error(`[auth][error] ${error.name}: ${error.message}`);
        if (error.stack) {
          console.error(error.stack.replace(/.*/, "").substring(1));
        }
        return;
      }

      console.error("[auth][error]", error);
    },
  },
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
          
          const refreshToken = extractRefreshToken(res) ?? "";
          
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
          if (!isExpectedAuthFlowError(error)) {
            console.error("Auth error:", error);
          }

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
