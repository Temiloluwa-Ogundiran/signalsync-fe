"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit01Icon,
  SmileIcon,
  NeutralIcon,
  EnergyIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

type Mood = "good" | "neutral" | "charged";

const MOODS: { id: Mood; icon: typeof SmileIcon; label: string }[] = [
  { id: "good", icon: SmileIcon, label: "Felt good" },
  { id: "neutral", icon: NeutralIcon, label: "Felt neutral" },
  { id: "charged", icon: EnergyIcon, label: "Felt charged" },
];

interface JournalSessionNoteProps {
  /** Existing note text, if any. */
  initialNote?: string;
  /** Previously selected mood, if any. */
  initialMood?: Mood | null;
  saving?: boolean;
  /**
   * Persist the note + mood. Mood is best-effort metadata;
   * TODO(backend): no first-class mood field yet.
   */
  onSave: (note: string, mood: Mood | null) => void;
}

export function JournalSessionNote({
  initialNote = "",
  initialMood = null,
  saving = false,
  onSave,
}: JournalSessionNoteProps) {
  const [note, setNote] = useState(initialNote);
  const [mood, setMood] = useState<Mood | null>(initialMood);

  return (
    <section className="rounded-xl bg-card-bg p-4 ring-1 ring-hairline">
      <div className="mb-3 flex items-center gap-2">
        <HugeiconsIcon
          icon={PencilEdit01Icon}
          size={14}
          strokeWidth={2}
          className="text-text-secondary"
        />
        <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-secondary">
          Day note
        </span>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="A line about today's session — how it felt, what you'd repeat or change..."
        className="w-full resize-none bg-transparent text-sm leading-relaxed text-text-primary placeholder:text-text-tertiary focus:outline-none"
      />

      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Felt:</span>
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMood((cur) => (cur === m.id ? null : m.id))}
              aria-label={m.label}
              aria-pressed={mood === m.id}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-lg border transition-colors cursor-pointer",
                mood === m.id
                  ? "border-ai-soft-border bg-ai-soft-bg text-ai-accent"
                  : "border-hairline text-text-tertiary hover:border-border-secondary hover:text-text-secondary",
              )}
            >
              <HugeiconsIcon icon={m.icon} size={16} strokeWidth={2} />
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={saving || !note.trim()}
          onClick={() => onSave(note.trim(), mood)}
          className={cn(
            "rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-foreground transition-colors",
            saving || !note.trim()
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-accent-hover cursor-pointer",
          )}
        >
          {saving ? "Saving..." : "Save note"}
        </button>
      </div>
    </section>
  );
}
