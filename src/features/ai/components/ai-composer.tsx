"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AiComposer({
  onSend,
  disabled,
  placeholder = "Ask anything about your trading…",
}: AiComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="border-t border-border-secondary/40 bg-sidebar-chrome-bg px-3 py-3">
      <div className="flex items-end gap-2 rounded-xl border border-border-secondary/60 bg-bg-primary px-3 py-2 transition-colors focus-within:border-ai-border focus-within:ring-2 focus-within:ring-ai-glow">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-sm text-text-primary placeholder-text-tertiary focus:outline-none disabled:opacity-50 leading-relaxed min-h-[22px] max-h-[120px]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
            value.trim() && !disabled
              ? "bg-ai-accent text-white hover:bg-ai-accent-bright"
              : "bg-bg-tertiary text-text-tertiary cursor-not-allowed",
          )}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-text-tertiary">
        Partna AI uses your SyncTrades data. Not financial advice — review
        before acting.
      </p>
    </div>
  );
}
