import * as z from "zod";

/**
 * Shared password policy — the single source of truth for client-side strength
 * checks. Used by auth (register / reset) and account settings (change
 * password). Lives in `src/lib` so any feature can import it without crossing a
 * feature boundary.
 */

export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, and a number.";

export function isStrongPassword(password: string) {
  return (
    /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
  );
}

export const registerPasswordSchema = z
  .string()
  .min(8, { message: PASSWORD_POLICY_MESSAGE })
  .refine(isStrongPassword, {
    message: PASSWORD_POLICY_MESSAGE,
  });
