"use server";

import { signIn, signOut } from "@/lib/auth/auth";
import { AuthError } from "next-auth";
import { registerUser } from "@/features/auth/api/auth.api";
import { ApiException, extractValidationFieldErrors } from "@/lib/api/types";

function getCredentialsErrorMessage(error: AuthError) {
  const cause = error.cause;
  if (
    cause &&
    typeof cause === "object" &&
    "err" in cause &&
    cause.err instanceof Error
  ) {
    return cause.err.message;
  }

  return "Invalid credentials.";
}

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: getCredentialsErrorMessage(error) };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}

export async function registerAction(data: {
  display_name: string;
  username: string;
  email: string;
  password: string;
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

export async function logoutAction() {
  await signOut();
}
