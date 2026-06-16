import Image from "next/image";
import { Sparkles, RefreshCw, Activity } from "lucide-react";
import { ForceLight } from "@/features/theme/force-light";

// The coach is the hero. These two rows are its MECHANISM — what feeds the
// read — not co-equal features. Order leads to the coach (rendered above).
const MECHANISM = [
  {
    icon: RefreshCw,
    title: "It syncs every trade",
    desc: "Entries, exits, lots, stops, sessions. The full record, automatically.",
  },
  {
    icon: Activity,
    title: "It reads your behavior",
    desc: "Where discipline held and where it slipped, trade by trade.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-auth-bg">
      <ForceLight />

      {/* Left: form column — vertically centered, ~400px form */}
      <div className="flex w-full flex-col items-center justify-center px-5 py-12 sm:px-6 lg:w-1/2 lg:px-8">
        {/* Mobile-only logo above the form */}
        <div className="mb-10 lg:hidden">
          <Image
            src="/brand/tradpartnalight.svg"
            alt="TradePartna"
            width={168}
            height={22}
            priority
            className="h-6 w-auto"
          />
        </div>
        <div className="w-full max-w-[400px]">{children}</div>
      </div>

      {/* Right: brand / coach panel (desktop only) — the one place purple goes big */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-auth-brand-from via-auth-brand-via to-auth-brand-to text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        {/* Soft brand glows + subtle grid (decorative; respects reduced motion by being static) */}
        <div className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-white/15 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-white/10 blur-[130px]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:34px_34px]" />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/brand/tradepartna-logo-full.svg"
            alt="TradePartna"
            width={184}
            height={24}
            priority
            className="h-7 w-auto"
          />
        </div>

        {/* Hero → subhead → coach block → mechanism */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight">
            An AI coach that reviews
            <br />
            every trade. And tells
            <br />
            you the truth.
          </h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-white/75">
            Built on your real trade history, for traders serious about fixing
            their leaks.
          </p>

          {/* The coach — emphasized block, the destination the rest leads to */}
          <div className="mt-10 rounded-2xl bg-white/10 p-5 ring-1 ring-inset ring-white/15 backdrop-blur-sm">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20">
                <Sparkles className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="text-base font-semibold">It coaches you</p>
                <p className="mt-1 text-sm leading-relaxed text-white/75">
                  An honest read on what worked, where you broke your rules, and
                  the one thing to fix next.
                </p>
              </div>
            </div>
          </div>

          {/* Supporting mechanism — what feeds the read */}
          <ul className="mt-7 space-y-5">
            {MECHANISM.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
                  <Icon className="h-[18px] w-[18px] text-white/90" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm leading-relaxed text-white/65">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer legal */}
        <div className="relative z-10 text-sm text-white/50">
          © {new Date().getFullYear()} TradePartna. All rights reserved.
        </div>
      </div>
    </div>
  );
}
