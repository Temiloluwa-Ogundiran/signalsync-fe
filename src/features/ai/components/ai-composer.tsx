"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiComposerProps {
  onSend: (content: string) => void;
  /** Whether a response is currently streaming. Typing stays enabled; only the
   *  send action is blocked (the button becomes a stop control instead). */
  isStreaming?: boolean;
  /** Stop the in-flight response. */
  onStop?: () => void;
  /** Hard-disable the whole composer (e.g. no active session yet). */
  disabled?: boolean;
  placeholder?: string;
}

export function AiComposer({
  onSend,
  isStreaming = false,
  onStop,
  disabled = false,
  placeholder = "Message Partna AI…",
}: AiComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = !!value.trim() && !isStreaming && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
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
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  return (
    <div className="bg-sidebar-chrome-bg px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-bg-primary px-3 py-2.5 transition-colors",
          "border-border-secondary/60 focus-within:border-ai-border focus-within:ring-2 focus-within:ring-ai-glow",
        )}
      >
        {/* Typing is ALWAYS allowed — even mid-response — so users can line up
            their next question. Only sending is gated (see canSend). */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none self-center bg-transparent text-sm leading-relaxed text-text-primary placeholder-text-tertiary focus:outline-none disabled:opacity-50 min-h-[24px] max-h-[140px]"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop response"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-text-primary text-bg-primary transition-opacity hover:opacity-80"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors",
              canSend
                ? "bg-ai-accent text-white hover:bg-ai-accent-bright"
                : "bg-bg-tertiary text-text-tertiary cursor-not-allowed",
            )}
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[10px] text-text-tertiary">
        Partna AI can make mistakes. Not financial advice.
      </p>
    </div>
  );
}
