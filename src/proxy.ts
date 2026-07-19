import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";
import { FEATURE_FLAGS } from "@/config/feature-flags";

const FLAGGED_ROUTES: Array<{ flag: keyof typeof FEATURE_FLAGS; prefix: string }> = [];
const FALLBACK_ROUTE = "/dashboard";
const { auth } = NextAuth(authConfig);

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  for (const { flag, prefix } of FLAGGED_ROUTES) {
    if (
      !FEATURE_FLAGS[flag] &&
      (pathname === prefix || pathname.startsWith(`${prefix}/`))
    ) {
      const fallback = request.nextUrl.clone();
      fallback.pathname = FALLBACK_ROUTE;
      return NextResponse.redirect(fallback);
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://accounts.google.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://lh3.googleusercontent.com https://*.amazonaws.com",
    "media-src 'self' blob: https://*.amazonaws.com",
    "font-src 'self' data:",
    "connect-src 'self' https://accounts.google.com",
    "frame-src https://accounts.google.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|map)$).*)",
  ],
};
