"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";
import { useJournalUiStore } from "../store/journal-ui-store";
import { useDayNote, useSaveDayNote } from "../hooks/use-day-note";
import { DayNoteEditor } from "./day-note-editor";

const AUTOSAVE_DELAY_MS = 1000;
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

function formatDateLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/** Store-wired day-note modal — opened from anywhere via openNoteModal(date). */
export function DayNoteModal() {
  const date = useJournalUiStore((s) => s.noteModalDate);
  const closeNoteModal = useJournalUiStore((s) => s.closeNoteModal);

  return (
    <Dialog
      open={!!date}
      onOpenChange={(open) => {
        if (!open) closeNoteModal();
      }}
    >
      <DialogContent className="w-[95vw] max-w-2xl overflow-hidden rounded-2xl border border-border-primary bg-card-bg p-0">
        {date ? <DayNoteModalBody date={date} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function DayNoteModalBody({ date }: { date: string }) {
  const { data: accounts = [] } = useJournalAccounts();
  const resolvedAccountId = useResolvedJournalAccountId();
  const activeAccountId = resolvedAccountId || accounts[0]?.id || "";

  const dayNoteQuery = useDayNote(
    activeAccountId,
    date,
    !!activeAccountId && !!date,
  );
  const saveDayNoteMutation = useSaveDayNote(activeAccountId, date);
  const initialNote = dayNoteQuery.data?.note_html ?? "";

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [date]);

  // TipTap only fires onUpdate on real user edits (the editor mounts with the
  // loaded note once the query resolves), so every onChange is a genuine edit.
  const handleNoteChange = useCallback(
    (html: string) => {
      const normalized = html === "<p></p>" ? "" : html;
      setSaveState("dirty");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        setSaveState("saving");
        saveDayNoteMutation.mutate(normalized || null, {
          onSuccess: () => setSaveState("saved"),
          onError: () => setSaveState("error"),
        });
      }, AUTOSAVE_DELAY_MS);
    },
    [saveDayNoteMutation],
  );

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border-primary/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-text-primary">Daily note</h2>
          <span className="text-text-tertiary/50">•</span>
          <span className="text-sm font-semibold text-text-secondary">
            {formatDateLabel(date)}
          </span>
        </div>
        <NoteSaveStatus state={saveState} />
      </div>

      <div className="p-5">
        {dayNoteQuery.isLoading ? (
          <div className="min-h-[320px] animate-pulse rounded-xl bg-bg-tertiary" />
        ) : (
          <DayNoteEditor content={initialNote} onChange={handleNoteChange} />
        )}
      </div>
    </div>
  );
}

function NoteSaveStatus({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-danger">
        <AlertCircle className="h-3.5 w-3.5" />
        Save failed
      </span>
    );
  }
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Saved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
      Unsaved changes
    </span>
  );
}
