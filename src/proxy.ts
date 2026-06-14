import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";
import { FEATURE_FLAGS } from "@/config/feature-flags";

const FLAGGED_ROUTES: Array<{ flag: keyof typeof FEATURE_FLAGS; prefix: string }> = [];

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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
