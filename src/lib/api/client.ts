/**
 * Axios HTTP client with authentication interceptors.
 *
 * Features:
 * - Automatic Bearer token attachment to requests
 * - Consistent error normalization for FastAPI responses
 * - Request/response logging in development
 *
 * Auth Strategy:
 * Since we use NextAuth v5, the access token lives in the encrypted session
 * cookie managed by Next.js, not in a Zustand store. To attach the token:
 *
 *  - Server Components / Server Actions: call `auth()` and pass
 *    `session.accessToken` via `apiClient.defaults.headers.common[...]`
 *    or use the `withAuth` helper exported below.
 *
 *  - Client Components: read the token from `useSession()` and attach it per
 *    request. When a request gets a 401, this client asks NextAuth for a fresh
 *    session once before forcing the user to sign in again.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import {
  ApiException,
  FastAPIErrorResponse,
  normalizeError,
} from "./types";
import { resolveAuthBackendUrl } from "@/lib/auth/auth-backend-url";

const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api/proxy"
    : resolveAuthBackendUrl().replace(/\/$/, "");

const REQUEST_TIMEOUT = 30_000;

let pendingSessionRefresh: Promise<{ accessToken?: string } | null> | null = null;

function getAuthorizationToken(
  config?: InternalAxiosRequestConfig
): string | null {
  const authorization = config?.headers?.Authorization;
  if (typeof authorization !== "string") {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

async function refreshBrowserSession() {
  if (!pendingSessionRefresh) {
    pendingSessionRefresh = import("next-auth/react")
      .then(({ getSession }) => getSession())
      .finally(() => {
        pendingSessionRefresh = null;
      });
  }

  return pendingSessionRefresh;
}

async function signOutBrowserSession() {
  const [{ signOut }, { toast }] = await Promise.all([
    import("next-auth/react"),
    import("sonner"),
  ]);

  await signOut({ redirect: false });
  toast.error("Session expired", {
    description: "Please log in again.",
    duration: 3000,
  });

  window.location.replace("/login");
}

/**
 * Singleton Axios instance with base configuration.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  // `withCredentials` stays off because the browser talks to the backend with
  // Bearer tokens, while the refresh token remains server-only in Auth.js.
  withCredentials: false,
});

const DEV = process.env.NODE_ENV === "development";

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    if (DEV) {
      console.log(`[API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError<FastAPIErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response) {
      const msg = error.message || "Network error";
      const isTimeout =
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        /timeout/i.test(msg);

      if (DEV) {
        console.error("[API] Network Error:", {
          message: msg,
          url: originalRequest?.url,
          baseURL: API_BASE_URL,
        });
      }

      throw new ApiException({
        status: 0,
        code: isTimeout ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
        message: isTimeout
          ? "The request is still taking longer than expected. Please check your accounts list in a moment."
          : msg.includes("ECONNREFUSED") || msg.includes("Failed to fetch")
          ? `Cannot connect to backend at ${API_BASE_URL}. Is the server running?`
          : "Network error. Please check your internet connection.",
      });
    }

    const { status, data } = error.response;

    if (DEV) {
      console.error(`[API] ${status} ${originalRequest?.url}`, data);
    }

    if (status === 401 && !originalRequest._retry) {
      if (typeof window !== "undefined") {
        originalRequest._retry = true;

        const previousToken = getAuthorizationToken(originalRequest);
        const refreshedSession = await refreshBrowserSession();
        const refreshedToken =
          refreshedSession?.accessToken &&
          refreshedSession.accessToken !== previousToken
            ? refreshedSession.accessToken
            : null;

        if (refreshedToken) {
          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
          return apiClient(originalRequest);
        }

        await signOutBrowserSession();
      }

      throw new ApiException({
        status: 401,
        code: "TOKEN_EXPIRED",
        message: "Session expired. Please log in again.",
      });
    }

    throw new ApiException(normalizeError(status, data));
  }
);

/**
 * Returns a one-off Axios request config with the Authorization header already
 * set. Use this in Server Actions / Server Components where you have access to
 * the NextAuth session.
 */
export function withAuth(accessToken?: string | null) {
  return {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  };
}

export { apiClient };
export default apiClient;
