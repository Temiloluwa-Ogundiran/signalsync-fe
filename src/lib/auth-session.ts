type SessionLike = {
  accessToken?: string | null;
  error?: string | null;
} | null | undefined;

export function hasUsableSession(session: SessionLike): boolean {
  return !!session?.accessToken && session.error !== "RefreshAccessTokenError";
}
