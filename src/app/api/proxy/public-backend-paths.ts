// Backend paths that must remain reachable without an authenticated session.
const PUBLIC_BACKEND_PREFIXES = ["auth/"];

export function isPublicBackendPath(path: string) {
  return PUBLIC_BACKEND_PREFIXES.some((prefix) => path.startsWith(prefix));
}
