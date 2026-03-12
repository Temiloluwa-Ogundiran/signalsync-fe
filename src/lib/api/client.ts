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
 * cookie managed by Next.js—NOT in a Zustand store. To attach the token:
 *
 *  - Server Components / Server Actions: call `auth()` and pass
 *    `session.accessToken` via `apiClient.defaults.headers.common[...]`
 *    or use the `withAuth` helper exported below.
 *
 *  - Client Components: use the `useApiClient` hook (to be added) which
 *    reads the token from `useSession()` and injects it per-request.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import {
  ApiException,
  normalizeError,
  FastAPIErrorResponse,
} from "./types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

const REQUEST_TIMEOUT = 30_000; // 30 seconds

/**
 * Singleton Axios instance with base configuration.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true  ← would be needed if we relied on the
  // backend's own HTTP-only cookie instead of our NextAuth session.
  withCredentials: false,
});

// ── Request interceptor ────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ [API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError<FastAPIErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Network-level errors (CORS, connection refused, offline, etc.)
    if (!error.response) {
      const msg = error.message || "Network error";
      if (process.env.NODE_ENV === "development") {
        console.error("❌ [API] Network Error:", {
          message: msg,
          url: originalRequest?.url,
          baseURL: API_BASE_URL,
        });
      }
      throw new ApiException({
        status: 0,
        code: "NETWORK_ERROR",
        message: msg.includes("ECONNREFUSED") || msg.includes("Failed to fetch")
          ? `Cannot connect to backend at ${API_BASE_URL}. Is the server running?`
          : "Network error. Please check your internet connection.",
      });
    }

    const { status, data } = error.response;

    if (process.env.NODE_ENV === "development") {
      console.error(`❌ [API] ${status} ${originalRequest?.url}`, data);
    }

    // Session expired — interceptor shows a toast and redirects client-side
    if (status === 401 && !originalRequest._retry) {
      if (typeof window !== "undefined") {
        import("sonner").then(({ toast }) => {
          toast.error("Session expired", {
            description: "Please log in again.",
            duration: 3000,
          });
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
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
 *
 * @example
 * ```ts
 * const session = await auth();
 * const res = await apiClient.get("/trades", withAuth(session?.accessToken));
 * ```
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
