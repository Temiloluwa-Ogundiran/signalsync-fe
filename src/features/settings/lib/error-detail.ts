import { ApiException } from "@/lib/api/types";

/** Pull a human-readable message out of an API/axios error, with a fallback. */
export function errorDetail(err: unknown, fallback: string): string {
  if (err instanceof ApiException) return err.message;
  return (
    (err as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? fallback
  );
}
