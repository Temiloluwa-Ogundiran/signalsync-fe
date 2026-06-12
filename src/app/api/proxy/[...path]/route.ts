import { NextRequest, NextResponse } from "next/server";
import { resolveAuthBackendUrl } from "@/lib/auth-backend-url";

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
  const targetUrl = new URL(`${backendUrl}/${path.join("/")}`);
  targetUrl.search = request.nextUrl.search;

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: copyRequestHeaders(request),
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
