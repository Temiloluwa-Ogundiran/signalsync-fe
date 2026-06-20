"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, Check, Loader2, LogOut } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Notebook01Icon,
  Analytics01Icon,
  AiMagicIcon,
  TestTubeIcon,
  ChampionIcon,
  GoogleIcon,
  NewTwitterIcon,
  YoutubeIcon,
  UserMultiple02Icon,
  UserGroup02Icon,
  MoreHorizontalCircle01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { completeOnboarding } from "@/features/settings/api/user.api";

type OptionId = string;

interface Option {
  id: OptionId;
  label: string;
  hint?: string;
  icon?: IconSvgElement;
  /** Tailwind classes for the icon tile: [bg, text]. */
  tint?: string;
}

const EXPERIENCE: Option[] = [
  { id: "under_1y", label: "New", hint: "Under 1 year" },
  { id: "1_3y", label: "1–3 years" },
  { id: "3_5y", label: "3–5 years" },
  { id: "5y_plus", label: "5+ years" },
  { id: "no_answer", label: "Prefer not to say" },
];

const GOAL: Option[] = [
  { id: "journal", label: "Journal my trades", hint: "Log and review every trade", icon: Notebook01Icon, tint: "bg-blue-500/12 text-blue-600" },
  { id: "analyze", label: "Analyze my performance", hint: "Dive into stats and patterns", icon: Analytics01Icon, tint: "bg-violet-500/12 text-violet-600" },
  { id: "ai_coaching", label: "Get AI coaching", hint: "Personalised feedback from Partna AI", icon: AiMagicIcon, tint: "bg-ai-soft-bg text-ai-accent" },
  { id: "backtest", label: "Backtest strategies", hint: "Test ideas against historical data", icon: TestTubeIcon, tint: "bg-emerald-500/12 text-emerald-600" },
  { id: "funded", label: "Track a prop-firm funded challenge", hint: "Prop-firm evaluations", icon: ChampionIcon, tint: "bg-amber-500/15 text-amber-600" },
];

const REFERRAL: Option[] = [
  { id: "google", label: "Google search", icon: GoogleIcon, tint: "bg-red-500/10 text-red-500" },
  { id: "x", label: "X (Twitter)", icon: NewTwitterIcon, tint: "bg-zinc-900/8 text-zinc-900" },
  { id: "youtube", label: "YouTube", icon: YoutubeIcon, tint: "bg-red-600/10 text-red-600" },
  { id: "friend", label: "A friend or colleague", icon: UserMultiple02Icon, tint: "bg-teal-500/12 text-teal-600" },
  { id: "community", label: "A trading community", icon: UserGroup02Icon, tint: "bg-indigo-500/12 text-indigo-600" },
  { id: "other", label: "Other", icon: MoreHorizontalCircle01Icon, tint: "bg-zinc-500/10 text-zinc-500" },
];

type StepKey = "welcome" | "experience" | "goal" | "referral";
const STEP_ORDER: StepKey[] = ["welcome", "experience", "goal", "referral"];

export function OnboardingFlow({ firstName }: { firstName: string }) {
  const router = useRouter();
  const { data: session, update } = useSession();

  const [stepIndex, setStepIndex] = useState(0);
  const [experience, setExperience] = useState<OptionId | null>(null);
  const [goals, setGoals] = useState<OptionId[]>([]); // multi-select
  const [referral, setReferral] = useState<OptionId | null>(null);

  const toggleGoal = (id: OptionId) =>
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEP_ORDER[stepIndex];
  // Progress reflects question steps (welcome doesn't count as filled progress).
  const progress = useMemo(
    () => Math.round((stepIndex / (STEP_ORDER.length - 1)) * 100),
    [stepIndex],
  );

  const canContinue =
    step === "welcome" ||
    (step === "experience" && !!experience) ||
    (step === "goal" && goals.length > 0) ||
    (step === "referral" && !!referral);

  const isLast = step === "referral";

  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const finish = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await completeOnboarding(
        {
          trading_experience: experience ?? undefined,
          primary_goal: goals.length ? goals.join(",") : undefined,
          referral_source: referral ?? undefined,
        },
        session?.accessToken,
      );
      // Flip the session flag so the auth gate lets us into the dashboard
      // without a full re-login.
      await update({ onboardingCompleted: true });
      router.replace("/dashboard");
    } catch (err) {
      console.error("Failed to complete onboarding", err);
      setError("Couldn't save that just now — please try again.");
      setSubmitting(false);
    }
  };

  const next = () => {
    if (isLast) {
      void finish();
      return;
    }
    setStepIndex((i) => Math.min(STEP_ORDER.length - 1, i + 1));
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-auth-bg">
      {/* Soft brand gradient bleeding from the top — only on the welcome screen,
          where it adds warmth without distracting from the question lists. */}
      {step === "welcome" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[55vh]"
          style={{
            background:
              "radial-gradient(120% 75% at 50% 0%, color-mix(in srgb, var(--color-ai-accent) 28%, transparent) 0%, transparent 60%)",
          }}
        />
      )}
      {/* Top bar: logo left, logout right (progress lives at the bottom). */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="flex items-center">
          {/* Dark wordmark on light, white wordmark on dark — same swap the app
              header uses. Plain <img> (SVGs don't need next/image). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/tradpartnalight.svg"
            alt="TradePartna"
            className="h-5 w-auto dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/tradepartna-logo-full.svg"
            alt="TradePartna"
            className="hidden h-5 w-auto dark:block"
          />
        </span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg hover:text-text-primary"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </header>

      {/* Body. Welcome centers vertically on every size (no footer, short
          content). Question steps stay top-aligned on mobile so long option
          lists scroll from the top; they center only at sm+. */}
      <main
        className={cn(
          "relative z-10 flex flex-1 justify-center px-5",
          step === "welcome"
            ? "items-center pb-28"
            : "items-start pt-6 pb-28 sm:items-center sm:pt-0",
        )}
      >
        <div className="w-full max-w-xl">
          {step === "welcome" && (
            <div className="flex flex-col items-center text-center">
              {/* Our logo mark — no background tile. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/tradepartna-mark.svg"
                alt="TradePartna"
                className="mb-6 h-12 w-auto"
              />
              <h1 className="font-heading text-3xl font-bold text-text-primary">
                Welcome to TradePartna{firstName ? `, ${firstName}` : ""} 👋
              </h1>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-text-secondary">
                Your AI trading partner. Journal every trade, uncover your
                patterns, and build the discipline that makes traders profitable.
              </p>
              {/* CTA lives inline on welcome (directly under the text), not in
                  the fixed footer. */}
              <button
                type="button"
                onClick={next}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-ai-accent px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-ai-accent-bright active:scale-[0.98]"
              >
                Let&apos;s go
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === "experience" && (
            <Question
              title="How long have you been trading?"
              subtitle="No wrong answer — it helps us understand our community."
              options={EXPERIENCE}
              selected={experience}
              onSelect={setExperience}
            />
          )}

          {step === "goal" && (
            <Question
              title="What do you want from TradePartna?"
              subtitle="Select all that apply."
              options={GOAL}
              selectedIds={goals}
              onToggle={toggleGoal}
              multi
            />
          )}

          {step === "referral" && (
            <Question
              title="How did you hear about us?"
              subtitle="Helps us know where our traders come from."
              options={REFERRAL}
              selected={referral}
              onSelect={setReferral}
            />
          )}
        </div>
      </main>

      {/* Footer controls — question steps only; welcome has its CTA inline. */}
      {step !== "welcome" && (
      <footer className="fixed inset-x-0 bottom-0 border-t border-border-secondary/50 bg-auth-bg/95 px-5 py-4 backdrop-blur sm:px-8">
        {/* Progress lives at the bottom now. */}
        <div className="mx-auto mb-3 max-w-xl">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-secondary/50">
            <div
              className="h-full rounded-full bg-ai-accent transition-all duration-300"
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>
        </div>
        {error && (
          <p className="mx-auto mb-2 max-w-xl text-center text-xs font-medium text-danger">
            {error}
          </p>
        )}
        {/* Question steps only: Back (left) + Continue (right). */}
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-sidebar-nav-active-bg hover:text-text-primary disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          <button
            type="button"
            onClick={next}
            disabled={!canContinue || submitting}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]",
              canContinue && !submitting
                ? "bg-ai-accent text-white hover:bg-ai-accent-bright"
                : "cursor-not-allowed bg-bg-tertiary text-text-tertiary",
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up…
              </>
            ) : isLast ? (
              <>
                Finish
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </footer>
      )}
    </div>
  );
}

type QuestionProps = {
  title: string;
  subtitle?: string;
  options: Option[];
} & (
  | { multi?: false; selected: OptionId | null; onSelect: (id: OptionId) => void }
  | { multi: true; selectedIds: OptionId[]; onToggle: (id: OptionId) => void }
);

function Question(props: QuestionProps) {
  const { title, subtitle, options } = props;
  const isOn = (id: OptionId) =>
    props.multi ? props.selectedIds.includes(id) : props.selected === id;
  const handle = (id: OptionId) =>
    props.multi ? props.onToggle(id) : props.onSelect(id);

  return (
    <div>
      <h2 className="text-center font-heading text-2xl font-bold text-text-primary">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-center text-sm text-text-secondary">{subtitle}</p>
      )}
      <div className="mt-7 flex flex-col gap-2.5">
        {options.map((opt) => {
          const isSelected = isOn(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handle(opt.id)}
              className={cn(
                "flex items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all active:scale-[0.99]",
                isSelected
                  ? "border-ai-accent bg-ai-soft-bg ring-1 ring-ai-accent"
                  : "border-border-secondary/70 bg-card-bg hover:border-ai-border hover:bg-ai-glow",
              )}
            >
              {opt.icon ? (
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    opt.tint ?? "bg-bg-tertiary text-text-tertiary",
                  )}
                >
                  <HugeiconsIcon
                    icon={opt.icon}
                    size={22}
                    strokeWidth={1.8}
                    className="text-current"
                  />
                </span>
              ) : null}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold text-text-primary">
                  {opt.label}
                </span>
                {opt.hint && (
                  <span className="text-xs text-text-secondary">{opt.hint}</span>
                )}
              </span>
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center border transition-colors",
                  props.multi ? "rounded-md" : "rounded-full",
                  isSelected
                    ? "border-ai-accent bg-ai-accent text-white"
                    : "border-border-secondary",
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
