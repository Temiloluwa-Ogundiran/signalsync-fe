import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";
import { FEATURE_FLAGS } from "@/config/feature-flags";

const FLAGGED_ROUTES: Array<{ flag: keyof typeof FEATURE_FLAGS; prefix: string }> = [
  { flag: "GUARD", prefix: "/guard" },
];

const FALLBACK_ROUTE = "/dashboard";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
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
});

export const config = {
  // Exclude API, Next internals, and ALL static assets — including files with an
  // extension (svg/png/…) such as /brand/*.svg. Without the file-extension
  // exclusion these run through the auth middleware and get 302-redirected by the
  // gate instead of being served (broken logos on /onboarding).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|map)$).*)",
  ],
};
