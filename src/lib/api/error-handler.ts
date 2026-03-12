/**
 * Error handling utilities for API errors in components and React Query hooks.
 */

import { toast } from "sonner";
import { ApiException } from "./types";

/**
 * Handle API errors with appropriate user feedback.
 *
 * Session expiration is automatically handled by the API client
 * (shows toast + redirects to login), so this function skips those.
 *
 * @example
 * ```tsx
 * const mutation = useMutation({
 *   mutationFn: someApi.doThing,
 *   onError: (error) => handleApiError(error, "Failed to do thing"),
 * });
 * ```
 */
export function handleApiError(error: unknown, customMessage?: string): void {
  if (error instanceof ApiException && error.isSessionExpired()) {
    return; // Already handled by the API client interceptor
  }

  const message =
    customMessage ||
    (error instanceof ApiException ? error.message : "An error occurred");

  toast.error(message);
}

/**
 * Check if an error should be silently handled (no component-level toast).
 */
export function shouldSilentlyHandleError(error: unknown): boolean {
  return error instanceof ApiException && error.isSessionExpired();
}

/**
 * Convenience wrapper for React Query `onError` callbacks.
 *
 * @example
 * ```tsx
 * onError: createErrorHandler("Failed to load trades"),
 * ```
 */
export function createErrorHandler(customMessage: string) {
  return (error: unknown) => handleApiError(error, customMessage);
}
