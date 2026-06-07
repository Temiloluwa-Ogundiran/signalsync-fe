import * as z from "zod";

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
