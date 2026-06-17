import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { queryKeys } from "@/lib/api/query-keys";
import {
  changeEmail,
  changePassword,
  deleteAccount,
  getCurrentUser,
  listSessions,
  revokeSession,
  updateProfile,
  uploadAvatar,
  type ChangeEmailPayload,
  type ChangePasswordPayload,
  type CurrentUser,
  type DeleteAccountPayload,
  type UpdateProfilePayload,
} from "../api/user.api";

/** The authenticated user's full account record (GET /users/me). */
export function useCurrentUser() {
  const { data: session, status } = useSession();
  const token = session?.accessToken;

  return useQuery<CurrentUser>({
    queryKey: queryKeys.settings.me(),
    queryFn: () => getCurrentUser(token),
    enabled: status === "authenticated" && !!token,
    staleTime: 30_000,
  });
}

export function useUpdateProfile() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      updateProfile(payload, session?.accessToken),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.settings.me(), user);
    },
  });
}

export function useUploadAvatar() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.me() });
    },
  });
}

export function useChangePassword() {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      changePassword(payload, session?.accessToken),
  });
}

export function useChangeEmail() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangeEmailPayload) =>
      changeEmail(payload, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.me() });
    },
  });
}

export function useSessions() {
  const { data: session, status } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: queryKeys.settings.sessions(),
    queryFn: () => listSessions(token),
    enabled: status === "authenticated" && !!token,
  });
}

export function useRevokeSession() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      revokeSession(sessionId, session?.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.sessions() });
    },
  });
}

export function useDeleteAccount() {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (payload: DeleteAccountPayload) =>
      deleteAccount(payload, session?.accessToken),
  });
}
