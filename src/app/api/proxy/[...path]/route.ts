import { NextRequest, NextResponse } from "next/server";
import { resolveAuthBackendUrl } from "@/lib/auth-backend-url";
import { auth } from "@/auth";

// Backend prefixes that must remain reachable without an authenticated session
// (registration, email verification, password reset, refresh/logout cookie flows,
// username availability checks). Everything else requires a valid NextAuth session.
const PUBLIC_BACKEND_PREFIXES = ["auth/"];

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const REQUEST_HEADERS_TO_STRIP = new Set([
  ...HOP_BY_HOP_HEADERS,
  "content-length",
]);

const RESPONSE_HEADERS_TO_STRIP = new Set([
  ...HOP_BY_HOP_HEADERS,
  "content-encoding",
  "content-length",
]);

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function resolveBackendUrl() {
  return resolveAuthBackendUrl().replace(/\/$/, "");
}

function copyRequestHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);

  for (const header of REQUEST_HEADERS_TO_STRIP) {
    headers.delete(header);
  }

  return headers;
}

function copyResponseHeaders(response: Response) {
  const headers = new Headers(response.headers);

  for (const header of RESPONSE_HEADERS_TO_STRIP) {
    headers.delete(header);
  }

  return headers;
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  let backendUrl: string;

  try {
    backendUrl = resolveBackendUrl();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Backend URL is not configured.";

    return NextResponse.json({ detail: message }, { status: 500 });
  }

  const { path = [] } = await context.params;
  const joinedPath = path.join("/");
  const targetUrl = new URL(`${backendUrl}/${joinedPath}`);
  targetUrl.search = request.nextUrl.search;

  const headers = copyRequestHeaders(request);

  // Defense in depth: for non-public routes, validate the session server-side and
  // overwrite Authorization from it. A browser can then never inject an arbitrary
  // bearer token through the proxy — the token is sourced from the encrypted
  // NextAuth cookie, not from whatever the client sent.
  const isPublic = PUBLIC_BACKEND_PREFIXES.some((prefix) =>
    joinedPath.startsWith(prefix),
  );
  if (!isPublic) {
    const session = await auth();
    if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
      return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
    }
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: copyResponseHeaders(response),
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}
