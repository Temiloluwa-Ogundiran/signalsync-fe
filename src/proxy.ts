import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";
import { FEATURE_FLAGS } from "@/config/feature-flags";

const FLAGGED_ROUTES: Array<{ flag: keyof typeof FEATURE_FLAGS; prefix: string }> = [
  { flag: "HOME",     prefix: "/overview" },
  { flag: "DISCOVER", prefix: "/discover" },
  { flag: "FEED",     prefix: "/feed" },
  { flag: "SPACE",    prefix: "/spaces" },
  { flag: "PROFILE",  prefix: "/profile" },
  { flag: "TOOLS",    prefix: "/tools" },
];

const FALLBACK_ROUTE = "/journal";

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
