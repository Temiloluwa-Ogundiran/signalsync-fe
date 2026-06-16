import Image from "next/image";
import { TrendingUp, NotebookPen, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Track every trade",
    desc: "Sync your accounts and see your edge in real time.",
  },
  {
    icon: NotebookPen,
    title: "Journal with intent",
    desc: "Daily notes, tags, and discipline scores that compound.",
  },
  {
    icon: Sparkles,
    title: "Coach with Partna AI",
    desc: "Get an honest read on what worked and what to fix.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Left: form column */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2 lg:px-8">
        {/* Mobile-only logo above the form */}
        <div className="mb-8 lg:hidden">
          <Image
            src="/brand/tradpartnalight.svg"
            alt="TradePartna"
            width={168}
            height={22}
            priority
            className="h-6 w-auto dark:hidden"
          />
          <Image
            src="/brand/tradepartna-logo-full.svg"
            alt="TradePartna"
            width={168}
            height={22}
            priority
            className="hidden h-6 w-auto dark:block"
          />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right: brand panel (desktop only) */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-12 text-white">
        {/* Soft glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#7c3aed]/30 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#6366f1]/20 blur-[120px]" />
        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]" />

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

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Trade with discipline.
            <br />
            Review with clarity.
          </h2>
          <p className="mt-4 text-base text-white/70">
            The journal and analytics workspace built for serious traders.
          </p>

          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
                  <Icon className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-white/65">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-sm text-white/50">
          © {new Date().getFullYear()} TradePartna. All rights reserved.
        </div>
      </div>
    </div>
  );
}
