/**
 * Settings feature API functions (profile + security).
 * Uses the shared apiClient from @/lib/api.
 *
 * Each function takes the session access token and attaches it via `withAuth`,
 * matching the rest of the app. The proxy re-derives Authorization server-side,
 * but passing the token keeps the client's 401-refresh-retry path working.
 */

import apiClient, { withAuth } from "@/lib/api/client";
import type { AxiosResponse } from "axios";

// ── Types ──────────────────────────────────────────────────────────────────

export type AuthProvider = "email" | "google";

export interface CurrentUser {
  id: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_email_verified: boolean;
  auth_provider: AuthProvider;
  has_usable_password: boolean;
  display_timezone: string | null;
  created_at: string;
}

export interface UpdateProfilePayload {
  display_name?: string;
  bio?: string;
}

export interface UpdatePreferencesPayload {
  // null clears the timezone preference; omit to leave it unchanged.
  display_timezone?: string | null;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface ChangeEmailPayload {
  new_email: string;
  current_password: string;
}

export interface DeleteAccountPayload {
  current_password: string;
}

export interface SessionItem {
  id: string;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface AvatarUploadResponse {
  avatar_url: string;
}

// ── Profile ──────────────────────────────────────────────────────────────────

export async function getCurrentUser(token?: string): Promise<CurrentUser> {
  const res: AxiosResponse<CurrentUser> = await apiClient.get(
    "/users/me",
    withAuth(token)
  );
  return res.data;
}

export async function updatePreferences(
  payload: UpdatePreferencesPayload,
  token?: string
): Promise<CurrentUser> {
  const res: AxiosResponse<CurrentUser> = await apiClient.patch(
    "/users/me/preferences",
    payload,
    withAuth(token)
  );
  return res.data;
}

export async function updateProfile(
  payload: UpdateProfilePayload,
  token?: string
): Promise<CurrentUser> {
  const res: AxiosResponse<CurrentUser> = await apiClient.patch(
    "/users/me",
    payload,
    withAuth(token)
  );
  return res.data;
}

export interface CompleteOnboardingPayload {
  trading_experience?: string;
  primary_goal?: string;
  referral_source?: string;
}

export async function completeOnboarding(
  payload: CompleteOnboardingPayload,
  token?: string
): Promise<CurrentUser> {
  const res: AxiosResponse<CurrentUser> = await apiClient.patch(
    "/users/me/onboarding",
    payload,
    withAuth(token)
  );
  return res.data;
}

export async function uploadAvatar(
  file: File,
  token?: string
): Promise<AvatarUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res: AxiosResponse<AvatarUploadResponse> = await apiClient.post(
    "/users/me/avatar",
    formData,
    {
      ...withAuth(token),
      headers: {
        ...withAuth(token).headers,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}

// ── Security ─────────────────────────────────────────────────────────────────

export async function changePassword(
  payload: ChangePasswordPayload,
  token?: string
): Promise<MessageResponse> {
  const res: AxiosResponse<MessageResponse> = await apiClient.post(
    "/users/me/change-password",
    payload,
    withAuth(token)
  );
  return res.data;
}

export async function changeEmail(
  payload: ChangeEmailPayload,
  token?: string
): Promise<MessageResponse> {
  const res: AxiosResponse<MessageResponse> = await apiClient.post(
    "/users/me/change-email",
    payload,
    withAuth(token)
  );
  return res.data;
}

export async function listSessions(token?: string): Promise<SessionItem[]> {
  const res: AxiosResponse<SessionItem[]> = await apiClient.get(
    "/users/me/sessions",
    withAuth(token)
  );
  return res.data;
}

export async function revokeSession(
  sessionId: string,
  token?: string
): Promise<MessageResponse> {
  const res: AxiosResponse<MessageResponse> = await apiClient.delete(
    `/users/me/sessions/${sessionId}`,
    withAuth(token)
  );
  return res.data;
}

export async function deleteAccount(
  payload: DeleteAccountPayload,
  token?: string
): Promise<MessageResponse> {
  // DELETE with a body — axios sends it via `data`.
  const res: AxiosResponse<MessageResponse> = await apiClient.delete(
    "/users/me",
    { ...withAuth(token), data: payload }
  );
  return res.data;
}
