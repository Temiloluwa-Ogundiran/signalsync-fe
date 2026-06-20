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

export type PasswordStrength = {
  /** 0 (empty) to 4 — number of filled meter segments. */
  score: 0 | 1 | 2 | 3 | 4;
  label: "" | "Weak" | "Fair" | "Good" | "Strong";
};

/**
 * Lightweight password strength for the signup meter. Rewards length and
 * character variety. Returns a 0–4 score + label (no external deps).
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "" };

  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;

  // Map raw points (0–5) to a 1–4 meter once there's any input.
  const score = Math.max(1, Math.min(4, points)) as 1 | 2 | 3 | 4;
  const label = (["Weak", "Weak", "Fair", "Good", "Strong"] as const)[score];
  return { score, label };
}
