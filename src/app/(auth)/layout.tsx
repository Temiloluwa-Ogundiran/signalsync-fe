import Image from "next/image";
import Link from "next/link";
import { FollowSystemTheme } from "@/features/theme/follow-system-theme";

/**
 * Auth chrome: wordmark top-left, the page's content centered, and a
 * Terms/Privacy line at the bottom. Single column by default; a page (e.g.
 * register) may render its own fixed brand panel on the right — its content
 * wrapper then constrains to the left half via `lg:w-1/2`.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-auth-bg">
      <FollowSystemTheme />

      {/* Wordmark — top-left */}
      <div className="relative z-10 px-6 py-6 sm:px-10">
        <Link href="/login" aria-label="SignalSync home" className="inline-flex items-center gap-2">
          <Image
            src="/brand/signalsync-mark.png"
            alt="SignalSync"
            width={32}
            height={32}
            priority
            className="h-8 w-8 object-contain"
          />
          <span className="font-heading text-lg font-bold tracking-tight text-text-primary">SignalSync</span>
        </Link>
      </div>

      {/* Page content — centers itself and carries its own legal footer
          (constrained to the card column on the sign-up page). */}
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
