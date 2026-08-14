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

  // The static policy from next.config.ts must own CSP. This proxy also runs for
  // prerendered routes, whose inline Next.js hydration scripts cannot receive a
  // request-specific nonce. A nonce policy here leaves those pages permanently
  // suspended in the browser.
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|map)$).*)",
  ],
};
