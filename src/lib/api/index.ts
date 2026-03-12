/**
 * API module barrel export.
 */

export { apiClient, withAuth } from "./client";
export {
  ApiException,
  ErrorCodes,
  normalizeError,
  type ApiError,
  type ApiResponse,
  type ErrorCode,
  type FastAPIErrorResponse,
} from "./types";
export {
  handleApiError,
  shouldSilentlyHandleError,
  createErrorHandler,
} from "./error-handler";
