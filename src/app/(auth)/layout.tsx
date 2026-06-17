import Image from "next/image";
import Link from "next/link";
import { ForceLight } from "@/features/theme/force-light";

/**
 * Auth chrome: a light canvas with the wordmark top-left, the page content
 * (a centered card) in the middle, and a Terms/Privacy line pinned to the
 * bottom. Single-column for every auth route.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-auth-bg">
      <ForceLight />

      {/* Wordmark — top-left */}
      <div className="px-6 py-6 sm:px-10">
        <Link href="/login" aria-label="TradePartna home" className="inline-flex">
          <Image
            src="/brand/tradpartnalight.svg"
            alt="TradePartna"
            width={184}
            height={24}
            priority
            className="h-7 w-auto"
          />
        </Link>
      </div>

      {/* Centered content */}
      <div className="flex flex-1 items-center justify-center px-5 py-8">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>

      {/* Legal footer */}
      <div className="px-5 pb-8 text-center text-sm text-text-tertiary">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-text-secondary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-text-secondary">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
