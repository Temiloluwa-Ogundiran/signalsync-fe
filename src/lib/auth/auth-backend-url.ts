export function resolveAuthBackendUrl(): string {
  return (
    process.env.AUTH_BACKEND_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
  );
}
