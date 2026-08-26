import Image from "next/image";
import Link from "next/link";
import { FollowSystemTheme } from "@/features/theme/follow-system-theme";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-auth-bg text-text-primary">
      <FollowSystemTheme />
      <header className="border-b border-border-primary">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/login" aria-label="SignalSync home" className="inline-flex items-center gap-2">
            <Image
              src="/brand/signalsync-mark.svg"
              alt="SignalSync"
              width={32}
              height={32}
              priority
              className="h-8 w-8 object-contain"
            />
            <span className="font-heading text-lg font-bold tracking-tight text-text-primary">SignalSync</span>
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
