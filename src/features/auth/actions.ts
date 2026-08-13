"use server";

import { registerUser } from "@/features/auth/api/auth.api";
import { ApiException, extractValidationFieldErrors } from "@/lib/api/types";

export async function registerAction(data: {
  display_name: string;
  email: string;
  password: string;
  referral_code?: string;
  referral_source_detail?: string;
  referral_campaign?: string;
}) {
  try {
    await registerUser(data);
    return { success: true };
  } catch (error) {
    if (error instanceof ApiException) {
      const fieldErrors = extractValidationFieldErrors(error.raw);
      if (Object.keys(fieldErrors).length > 0) {
        return { error: error.message, fieldErrors };
      }
      return { error: error.message };
    }
    return { error: "An unexpected error occurred" };
  }
}
