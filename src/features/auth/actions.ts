"use server";

import { auth, signIn, signOut } from "../../auth";
import { AuthError } from "next-auth";
import { registerUser } from "@/features/auth/api/auth.api";
import { ApiException } from "@/lib/api/types";
import apiClient from "@/lib/api/client";

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          // NextAuth wraps our custom thrown Error in `error.cause?.err?.message`
          // We can surface exactly what the backend returned:
          const backendMessage = (error.cause as any)?.err?.message || "Invalid credentials.";
          return { error: backendMessage };
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
      return { error: error.message };
    }
    return { error: "An unexpected error occurred" };
  }
}

export async function logoutAction() {
  const session = await auth();
  
  if (session?.refreshToken) {
    try {
      await apiClient.post("/auth/logout", null, {
        headers: { Cookie: `refresh_token=${session.refreshToken}` },
      });
    } catch (e) {
      console.error("Failed to revoke refresh token:", e);
    }
  }

  await signOut();
}
