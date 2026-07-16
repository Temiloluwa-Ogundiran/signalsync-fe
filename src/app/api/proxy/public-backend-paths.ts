// Backend paths that must remain reachable without an authenticated session.
const PUBLIC_BACKEND_PREFIXES = ["auth/"];
const PUBLIC_BACKEND_PATHS = new Set(["events"]);

export function isPublicBackendPath(path: string) {
  return (
    PUBLIC_BACKEND_PATHS.has(path) ||
    PUBLIC_BACKEND_PREFIXES.some((prefix) => path.startsWith(prefix))
  );
}
