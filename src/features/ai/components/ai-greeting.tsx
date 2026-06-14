"use client";

import { Sparkles, Zap } from "lucide-react";
import type { AiContext } from "../types";

const SUGGESTED_PROMPTS = [
  "What's hurting my performance the most right now?",
  "Summarize my recent trading and identify key patterns.",
  "Am I overtrading or revenge trading?",
];

const ACTION_CHIPS = [
  "What's my best performing setup?",
  "Which symbol am I most profitable on?",
  "What is my profit factor this month?",
];

interface AiGreetingProps {
  firstName: string;
  context: AiContext | null;
  onPromptClick: (prompt: string) => void;
}

export function AiGreeting({
  firstName,
  context,
  onPromptClick,
}: AiGreetingProps) {
  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      {/* Context chip */}
      {/* {context && (
        <div className="inline-flex self-start items-center gap-1.5 rounded-full border border-brand/25 bg-brand/8 px-3 py-1 text-xs font-medium text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Opened from: {context.source}
        </div>
      )} */}

      {/* Greeting */}
      <div>
        <h2 className="font-heading text-xl font-bold text-text-primary">
          Hey {firstName} 👋
        </h2>
        <p className="mt-1 text-sm text-text-secondary leading-relaxed">
          I analyze your trades, spot patterns, and answer your trading
          questions. What would you like to know?
        </p>
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
          Suggested
        </p>
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptClick(prompt)}
            className="flex items-start gap-2.5 rounded-xl border border-border-secondary/60 bg-card-bg px-3.5 py-2.5 text-left text-sm text-text-primary transition-all hover:border-ai-border hover:bg-ai-glow hover:shadow-[0_0_0_1px_var(--color-ai-border),0_4px_16px_-6px_var(--color-ai-glow)]"
          >
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ai-accent" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Take Action chips */}
      <div>
        <p className="mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wide flex items-center gap-1">
          <Zap className="h-3 w-3 fill-current text-ai-accent" />
          Quick Analysis
        </p>
        <div className="flex flex-wrap gap-2">
          {ACTION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onPromptClick(chip)}
              className="rounded-full border border-border-secondary/60 bg-card-bg px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-ai-border hover:text-ai-accent-bright"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
