export function resolveAuthBackendUrl(): string {
  const backendUrl =
    process.env.AUTH_BACKEND_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL;

  if (!backendUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_BACKEND_URL or BACKEND_URL must be configured for server-side backend requests in production.",
      );
    }

    return "http://localhost:8000";
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_LOCAL_BACKEND_URL !== "true"
  ) {
    const { hostname } = new URL(backendUrl);
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(hostname)) {
      throw new Error(
        "Server-side backend URL must not point at localhost in production. Set AUTH_BACKEND_URL or BACKEND_URL to the deployed backend origin.",
      );
    }
  }

  return backendUrl;
}
