import Image from "next/image";
import Link from "next/link";
import { FollowSystemTheme } from "@/features/theme/follow-system-theme";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-auth-bg text-text-primary">
      <FollowSystemTheme />
      <header className="border-b border-border-primary">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/login" aria-label="TradePartna home" className="inline-flex">
            <Image
              src="/brand/tradpartnalight.svg"
              alt="TradePartna"
              width={184}
              height={24}
              priority
              className="h-7 w-auto dark:hidden"
            />
            <Image
              src="/brand/tradepartna-logo-full.svg"
              alt="TradePartna"
              width={184}
              height={24}
              priority
              className="hidden h-7 w-auto dark:block"
            />
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Back to sign in
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
