/**
 * Auth feature API functions.
 * Uses the shared apiClient from @/lib/api.
 */

import apiClient from "@/lib/api/client";
import type { AxiosResponse } from "axios";

// ── Types ──────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  display_name: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    username: string;
    display_name: string | null;
    is_email_verified: boolean;
  };
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface UsernameCheckResponse {
  available: boolean;
}

// ── API functions ──────────────────────────────────────────────────────────

export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const res: AxiosResponse<RegisterResponse> = await apiClient.post(
    "/auth/register",
    payload
  );
  return res.data;
}

export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  const res: AxiosResponse<VerifyEmailResponse> = await apiClient.get(
    `/auth/verify-email?token=${token}`
  );
  return res.data;
}

export async function resendVerificationEmail(
  email: string
): Promise<ResendVerificationResponse> {
  const res: AxiosResponse<ResendVerificationResponse> = await apiClient.post(
    "/auth/resend-verification",
    { email }
  );
  return res.data;
}

export async function checkUsernameAvailability(
  username: string,
  options?: { signal?: AbortSignal }
): Promise<UsernameCheckResponse> {
  const res: AxiosResponse<UsernameCheckResponse> = await apiClient.get(
    `/users/check-username?username=${encodeURIComponent(username)}`,
    { signal: options?.signal }
  );
  return res.data;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const res: AxiosResponse<ForgotPasswordResponse> = await apiClient.post(
    "/auth/forgot-password",
    { email }
  );
  return res.data;
}

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
  const res: AxiosResponse<ResetPasswordResponse> = await apiClient.post(
    "/auth/reset-password",
    { token, new_password: newPassword }
  );
  return res.data;
}
