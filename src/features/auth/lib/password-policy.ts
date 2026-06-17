/**
 * Re-export of the shared password policy. The canonical definition lives in
 * `src/lib/validation/password-policy` so non-auth features can reuse it without
 * crossing a feature boundary; auth keeps importing from here for continuity.
 */
export {
  PASSWORD_POLICY_MESSAGE,
  isStrongPassword,
  registerPasswordSchema,
} from "../../../lib/validation/password-policy";
