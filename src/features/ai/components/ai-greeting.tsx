"use client";

import { Sparkles, ChevronRight } from "lucide-react";
import type { AiContext } from "../types";

// One curated set of starter prompts (previously split across two redundant
// "Suggested" + "Quick Analysis" sections).
// All-time framing on purpose — no "right now / this month / recent". The demo
// dataset is a fixed past stretch, so recency-scoped prompts would return
// nothing useful; these answer over the full history regardless of dates.
const STARTER_PROMPTS = [
  "What's hurting my performance the most?",
  "Summarize my trading and identify key patterns.",
  "Am I overtrading or revenge trading?",
  "What's my best performing setup?",
];

interface AiGreetingProps {
  firstName: string;
  context: AiContext | null;
  onPromptClick: (prompt: string) => void;
}

export function AiGreeting({ firstName, onPromptClick }: AiGreetingProps) {
  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Greeting */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-text-primary">
          Hey {firstName} 👋
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
          I analyze your trades, spot patterns, and answer your trading
          questions. What would you like to know?
        </p>
      </div>

      {/* Starter prompts — one clean tappable list */}
      <div className="flex flex-col gap-2">
        <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
          Try asking
        </p>
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptClick(prompt)}
            className="group flex items-center gap-3 rounded-xl border border-border-secondary/60 bg-card-bg px-3.5 py-3 text-left text-sm text-text-primary transition-all hover:border-ai-border hover:bg-ai-glow"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-ai-accent" />
            <span className="flex-1 leading-snug">{prompt}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
}
