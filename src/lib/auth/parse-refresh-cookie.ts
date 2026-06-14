/**
 * Extracts the refresh_token value from the Set-Cookie headers of a Response.
 * Uses the standard getSetCookie() API (Node 18.17+ / Next.js 16 runtime)
 * to handle multi-value Set-Cookie correctly, replacing the fragile regex fallback.
 */
export function extractRefreshToken(res: Response): string | null {
  const headers = res.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const cookies: string[] =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : headers.get("set-cookie")
          ? [headers.get("set-cookie") as string]
          : [];

  for (const cookie of cookies) {
    const m = /^refresh_token=([^;]+)/.exec(cookie);
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
}
