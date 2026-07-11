"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit01Icon,
  Tick02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

type SaveStatus = "idle" | "saving" | "saved";

interface JournalSessionNoteProps {
  /** Existing note text, if any. */
  initialNote?: string;
  /**
   * Persist the note. Resolves when the save settles so the status can flip to
   * "Saved". Called debounced as the user types.
   */
  onSave: (note: string) => Promise<unknown>;
}

/** ms to wait after the last keystroke before auto-saving. */
const AUTOSAVE_DELAY = 1000;

export function JournalSessionNote({
  initialNote = "",
  onSave,
}: JournalSessionNoteProps) {
  const [note, setNote] = useState(initialNote);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(initialNote);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Grow the textarea to fit its content so the writing area never scrolls.
  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(autoGrow, [note]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleChange = (value: string) => {
    setNote(value);
    if (value === lastSaved.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      lastSaved.current = value;
      setStatus("saving");
      try {
        await onSave(value);
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, AUTOSAVE_DELAY);
  };

  return (
    <section className="group rounded-xl bg-card-bg p-5 ring-1 ring-hairline transition-shadow focus-within:ring-2 focus-within:ring-accent/40">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={PencilEdit01Icon}
            size={14}
            strokeWidth={2}
            className="text-text-secondary"
          />
          <span className="text-[0.7rem] font-semibold uppercase text-text-secondary">
            Day note
          </span>
        </div>

        <SaveStatusBadge status={status} />
      </div>

      <textarea
        ref={textareaRef}
        value={note}
        onChange={(e) => handleChange(e.target.value)}
        rows={3}
        placeholder="How did today feel? What would you repeat, and what would you change next time?"
        className="w-full resize-none rounded-md bg-transparent text-[0.95rem] leading-relaxed text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
    </section>
  );
}

function SaveStatusBadge({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
        <HugeiconsIcon
          icon={Loading03Icon}
          size={13}
          strokeWidth={2}
          className="animate-spin"
        />
        Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-kpi-metric-positive">
        <HugeiconsIcon icon={Tick02Icon} size={13} strokeWidth={2} />
        Saved
      </span>
    );
  }
  return null;
}
