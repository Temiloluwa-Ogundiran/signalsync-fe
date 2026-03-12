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

export async function checkUsernameAvailability(
  username: string
): Promise<UsernameCheckResponse> {
  const res: AxiosResponse<UsernameCheckResponse> = await apiClient.get(
    `/users/check-username?username=${encodeURIComponent(username)}`
  );
  return res.data;
}
