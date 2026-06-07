/**
 * Shared API types and error handling utilities.
 *
 * Normalizes FastAPI error responses into a consistent format for the frontend.
 */

/**
 * FastAPI error response structure.
 * `detail` can be a plain string or a structured object.
 */
export interface FastAPIErrorResponse {
  detail:
    | string
    | Array<{
        loc: Array<string | number>;
        msg: string;
        type: string;
      }>
    | {
        message: string;
        error_code?: string;
        code?: string;
        suggestion?: string;
        retry_after_seconds?: number;
      };
}

/**
 * Normalized error structure used throughout the application.
 */
export interface ApiError {
  /** HTTP status code */
  status: number;
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Optional suggestion for the user */
  suggestion?: string;
  /** Optional retry-after hint in seconds */
  retryAfterSeconds?: number;
  /** Original error response for debugging */
  raw?: unknown;
}

/**
 * Known error codes returned by the backend.
 */
export const ErrorCodes = {
  // Auth errors
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",

  // Generic errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Custom exception class for API errors.
 *
 * @example
 * ```ts
 * try {
 *   await apiClient.post("/auth/login", payload);
 * } catch (error) {
 *   if (error instanceof ApiException && error.code === ErrorCodes.EMAIL_NOT_VERIFIED) {
 *     // handle unverified email
 *   }
 * }
 * ```
 */
export class ApiException extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly suggestion?: string;
  public readonly retryAfterSeconds?: number;
  public readonly raw?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiException";
    this.status = error.status;
    this.code = error.code;
    this.suggestion = error.suggestion;
    this.retryAfterSeconds = error.retryAfterSeconds;
    this.raw = error.raw;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiException);
    }
  }

  is(code: ErrorCode): boolean {
    return this.code === code;
  }

  isSessionExpired(): boolean {
    return (
      this.code === ErrorCodes.TOKEN_EXPIRED ||
      (this.status === 401 &&
        this.message.toLowerCase().includes("session expired"))
    );
  }

  toJSON(): ApiError {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      suggestion: this.suggestion,
      retryAfterSeconds: this.retryAfterSeconds,
    };
  }
}

/**
 * Normalizes FastAPI error responses into a consistent ApiError format.
 */
export function normalizeError(
  status: number,
  data?: FastAPIErrorResponse | null
): ApiError {
  if (!data || !data.detail) {
    return {
      status,
      code: ErrorCodes.UNKNOWN_ERROR,
      message: getDefaultMessageForStatus(status),
    };
  }

  if (typeof data.detail === "string") {
    return {
      status,
      code: getErrorCodeFromStatus(status),
      message: data.detail,
      raw: data,
    };
  }

  if (Array.isArray(data.detail)) {
    return {
      status,
      code: ErrorCodes.VALIDATION_ERROR,
      message: data.detail[0]?.msg ?? getDefaultMessageForStatus(status),
      raw: data,
    };
  }

  return {
      status,
      code: data.detail.error_code || data.detail.code || ErrorCodes.UNKNOWN_ERROR,
      message: data.detail.message,
      suggestion: data.detail.suggestion,
      retryAfterSeconds: data.detail.retry_after_seconds,
      raw: data,
    };
}

export function extractValidationFieldErrors(raw?: unknown) {
  if (!raw || typeof raw !== "object" || !("detail" in raw)) {
    return {};
  }

  const detail = (raw as { detail?: unknown }).detail;
  if (!Array.isArray(detail)) {
    return {};
  }

  return detail.reduce<Record<string, string>>((fieldErrors, issue) => {
    if (!issue || typeof issue !== "object") {
      return fieldErrors;
    }

    const loc = Array.isArray((issue as { loc?: unknown }).loc)
      ? (issue as { loc: Array<string | number> }).loc
      : [];
    const message = typeof (issue as { msg?: unknown }).msg === "string"
      ? (issue as { msg: string }).msg
      : null;
    let field: string | null = null;

    for (let index = loc.length - 1; index >= 0; index -= 1) {
      const value = loc[index];
      if (typeof value === "string") {
        field = value;
        break;
      }
    }

    if (field && message) {
      fieldErrors[field] = message;
    }

    return fieldErrors;
  }, {});
}

function getErrorCodeFromStatus(status: number): string {
  switch (status) {
    case 400:
      return ErrorCodes.VALIDATION_ERROR;
    case 401:
      return ErrorCodes.INVALID_CREDENTIALS;
    case 403:
      return ErrorCodes.EMAIL_NOT_VERIFIED;
    case 429:
      return ErrorCodes.RATE_LIMITED;
    case 500:
      return ErrorCodes.SERVER_ERROR;
    default:
      return ErrorCodes.UNKNOWN_ERROR;
  }
}

function getDefaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Authentication failed. Please log in again.";
    case 403:
      return "Please verify your email before logging in.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "A conflict occurred. Please try again.";
    case 422:
      return "Validation failed. Please check your input.";
    case 429:
      return "Too many requests. Please slow down.";
    case 500:
      return "An unexpected error occurred. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * Standard API response wrapper for successful responses.
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
}
