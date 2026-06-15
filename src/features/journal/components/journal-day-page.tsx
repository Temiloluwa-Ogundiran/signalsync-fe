"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayEquityCurve } from "./day-equity-curve";
import { useJournalAccounts } from "@/features/journal/hooks/use-journal-accounts";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";
import { useJournalDayTrades } from "../hooks/use-journal-day-modal";
import { useDayNote, useSaveDayNote } from "../hooks/use-day-note";
import { asNumber } from "./journal-day-modal.utils";
import { DayNoteEditor } from "./day-note-editor";
import { AppLoader } from "@/components/app-loader";
import type { JournalTrade } from "../types";

// Constants and types
const AUTOSAVE_DELAY_MS = 1000; // Wait 1s after last edit before saving
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

function money(v: number, withSign = true) {
  const abs = Math.abs(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!withSign) return `$${abs}`;
  return v < 0 ? `-$${abs}` : `$${abs}`;
}

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

function clock(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "--"
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function computeStats(trades: JournalTrade[]) {
  const net = trades.reduce((a, t) => a + asNumber(t.net_profit), 0);
  const commissions = trades.reduce((a, t) => a + asNumber(t.commission), 0);
  const volume = trades.reduce((a, t) => a + asNumber(t.volume), 0);
  const wins = trades.filter((t) => asNumber(t.net_profit) > 0);
  const losses = trades.filter((t) => asNumber(t.net_profit) < 0);
  const grossWin = wins.reduce((a, t) => a + asNumber(t.net_profit), 0);
  const grossLoss = Math.abs(
    losses.reduce((a, t) => a + asNumber(t.net_profit), 0),
  );
  return {
    net,
    commissions,
    volume,
    winners: wins.length,
    losers: losses.length,
    winRate: trades.length ? (wins.length / trades.length) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : null,
  };
}

function buildCurve(trades: JournalTrade[]) {
  const ordered = [...trades].sort(
    (a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime(),
  );
  let running = 0;
  const pts = [{ i: 0, v: 0 }];
  ordered.forEach((t, idx) => {
    running += asNumber(t.net_profit);
    pts.push({ i: idx + 1, v: running });
  });
  return pts;
}

export function JournalDayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? "";

  const { data: accounts = [] } = useJournalAccounts();
  const resolvedAccountId = useResolvedJournalAccountId();
  const activeAccountId = resolvedAccountId || accounts[0]?.id || "";

  const tradesQuery = useJournalDayTrades(
    activeAccountId || undefined,
    date || undefined,
    !!activeAccountId && !!date,
  );
  const trades = useMemo(
    () => tradesQuery.data?.items ?? [],
    [tradesQuery.data],
  );
  const stats = useMemo(() => computeStats(trades), [trades]);
  const curve = useMemo(() => buildCurve(trades), [trades]);
  const hasCurve = curve.length > 1;

  // Day note: load once, then debounce-autosave edits.
  const dayNoteQuery = useDayNote(
    activeAccountId,
    date,
    !!activeAccountId && !!date,
  );
  const saveDayNoteMutation = useSaveDayNote(activeAccountId, date);

  // The note loaded from the server — the editor's initial content. We gate the
  // editor's render on the query so TipTap mounts with the right content (it
  // only reads `content` once, at mount).
  const initialNote = dayNoteQuery.data?.note_html ?? "";

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending autosave timer on unmount / day change.
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [date]);

  // TipTap only fires onUpdate on real user edits (not on initial content set),
  // and the editor is gated on the note query below so it mounts with the
  // loaded note — so every onChange here is a genuine edit to autosave.
  const handleNoteChange = useCallback(
    (html: string) => {
      // TipTap emits "<p></p>" for an empty doc — treat that as a blank note.
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

  if (!date) {
    return (
      <div className="p-6 text-sm text-text-secondary">No day selected.</div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-20 font-sans md:p-8 md:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push("/journal")}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Day Journal
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Day Journal
          </h1>
          <span className="text-text-tertiary/50">•</span>
          <span className="text-base font-bold text-text-primary">
            {formatDateLabel(date)}
          </span>
          <span
            className={cn(
              "text-base font-bold tabular-nums",
              stats.net < 0
                ? "text-danger"
                : stats.net > 0
                  ? "text-kpi-metric-positive"
                  : "text-text-tertiary",
            )}
          >
            Net P&amp;L {stats.net === 0 ? "$0" : money(stats.net)}
          </span>
          <NoteSaveStatus state={saveState} />
        </div>
      </div>

      {tradesQuery.isLoading ? (
        <AppLoader fullScreen={false} label="Loading day" />
      ) : (
        <>
          {/* Context: equity curve ($0-anchored, Tradezella style) + stats */}
          <section className="rounded-xl bg-card-bg p-5">
            {trades.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-secondary">
                No trade data to show for this day
              </p>
            ) : (
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                {hasCurve ? (
                  <DayEquityCurve
                    data={curve}
                    showAxis
                    className="h-40 w-full shrink-0 lg:w-1/2"
                  />
                ) : null}
                <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <StripStat
                    label="Net P&L"
                    value={stats.net === 0 ? "$0" : money(stats.net)}
                    tone={stats.net < 0 ? "loss" : stats.net > 0 ? "win" : undefined}
                  />
                  <StripStat label="Trades" value={String(trades.length)} />
                  <StripStat label="Win rate" value={`${stats.winRate.toFixed(0)}%`} />
                  <StripStat
                    label="W / L"
                    value={`${stats.winners}W / ${stats.losers}L`}
                  />
                  <StripStat
                    label="Commissions"
                    value={money(stats.commissions, false)}
                  />
                  <StripStat
                    label="Profit factor"
                    value={stats.profitFactor === null ? "--" : stats.profitFactor.toFixed(2)}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Daily note — the HERO. Journaling leads. */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-text-primary">
              Daily note
            </h2>
            {dayNoteQuery.isLoading ? (
              <div className="min-h-[320px] animate-pulse rounded-xl bg-bg-tertiary" />
            ) : (
              <DayNoteEditor 
                content={initialNote} 
                onChange={handleNoteChange}
              />
            )}
          </section>

          {/* Compact trades — supporting context, links out to the Trades tab */}
          {trades.length > 0 ? (
            <section className="overflow-hidden rounded-xl bg-card-bg">
              <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-1">
                <h2 className="text-sm font-semibold text-text-primary">
                  Trades ({trades.length})
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/trade-history")}
                  className="text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary cursor-pointer"
                >
                  View in Trades →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                      <th className="px-5 py-2">Time</th>
                      <th className="px-3 py-2">Symbol</th>
                      <th className="px-3 py-2">Side</th>
                      <th className="px-5 py-2 text-right">Net P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t) => {
                      const net = asNumber(t.net_profit);
                      return (
                        <tr
                          key={t.id}
                          className="border-t border-white/[0.04] text-text-primary"
                        >
                          <td className="px-5 py-2 tabular-nums text-text-secondary">
                            {clock(t.closed_at)}
                          </td>
                          <td className="px-3 py-2 font-semibold">{t.symbol}</td>
                          <td className="px-3 py-2 text-text-secondary">
                            {t.direction === "buy" ? "Long" : "Short"}
                          </td>
                          <td
                            className={cn(
                              "px-5 py-2 text-right font-semibold tabular-nums",
                              net < 0
                                ? "text-danger"
                                : net > 0
                                  ? "text-kpi-metric-positive"
                                  : "text-text-tertiary",
                            )}
                          >
                            {money(net)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <p className="rounded-xl bg-card-bg px-5 py-6 text-center text-sm text-text-secondary">
              No trades for this day.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** Autosave indicator next to the day header. */
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
  // dirty — unsaved edits pending the debounce
  return (
    <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
      Unsaved changes
    </span>
  );
}

/** Inline stat for the slim context strip above the note. */
function StripStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "win" | "loss";
}) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-xs text-text-secondary">{label}</span>
      <span
        className={cn(
          "text-sm font-bold tabular-nums text-text-primary",
          tone === "loss" && "text-danger",
          tone === "win" && "text-kpi-metric-positive",
        )}
      >
        {value}
      </span>
    </span>
  );
}
