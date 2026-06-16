"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  AiMagicIcon,
  PencilEdit01Icon,
  Tick02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { CurveIntradayDay, JournalMessage, JournalTrade } from "../types";
import {
  disciplineForDate,
  disciplineTone,
  DISCIPLINE_MAX,
} from "../lib/journal-discipline";
import { annotateTrade } from "../lib/journal-trade-tags";
import { useExpandedDay } from "../hooks/use-expanded-day";
import { JournalCoachsRead } from "./journal-coachs-read";
import { JournalDayStatStrip, type DayStat } from "./journal-day-stat-strip";
import { JournalTradeLine, type TradeLineData } from "./journal-trade-line";
import { JournalSessionNote } from "./journal-session-note";

interface JournalDayCardProps {
  date: string; // YYYY-MM-DD
  /** Account the feed is scoped to — needed to fetch the expanded day payload. */
  accountId: string;
  /**
   * When this bumps to a new number, expand the card and focus/ring the inline
   * session note (driven by "Write", calendar select, or ?focusDate deep-link).
   * null when this day isn't the focus target.
   */
  focusNoteNonce?: number | null;
  /** Controlled expand state — only one day card is expanded at a time. */
  expanded: boolean;
  /** Request expand/collapse of this card (sets/clears the parent's open day). */
  onExpandedChange: (expanded: boolean) => void;
  /** Full per-day curve + stats from the intraday fetch (undefined if no trades). */
  day?: CurveIntradayDay;
  /** From the calendar feed: net P&L + counts when there's no intraday day. */
  netPnl: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  hasNote: boolean;
  onNote: (date: string) => void;
  /** Open the Partna AI coach scoped to this day ("Continue with coach"). */
  onContinueCoach: (date: string) => void;
}

function money(value: number, withSign = true): string {
  const abs = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!withSign) return `$${abs}`;
  return value < 0 ? `-$${abs}` : `$${abs}`;
}

/** Returns ["FRIDAY", "June 28"] — weekday eyebrow + month/day. */
function formatDateParts(iso: string): [string, string] {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  return [weekday.toUpperCase(), monthDay];
}

function formatClock(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "--:--"
    : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** Build the per-trade line data, folding in any journal messages for that trade. */
function buildTradeLines(
  trades: JournalTrade[],
  messagesByTradeId: Map<string, JournalMessage[]>,
): TradeLineData[] {
  return [...trades]
    .sort((a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime())
    .map((t) => {
      const net = Number(t.net_profit) || 0;
      return {
        id: t.id,
        time: formatClock(t.opened_at),
        symbol: t.symbol,
        direction: t.direction,
        netProfit: net,
        outcome: net > 0 ? "win" : net < 0 ? "loss" : "be",
        annotation: annotateTrade(messagesByTradeId.get(t.id) ?? []),
      };
    });
}

export function JournalDayCard({
  date,
  accountId,
  focusNoteNonce = null,
  expanded,
  onExpandedChange,
  day,
  netPnl,
  tradeCount,
  winCount,
  lossCount,
  hasNote,
  onNote,
  onContinueCoach,
}: JournalDayCardProps) {
  const [noteHighlight, setNoteHighlight] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  // Keep the latest expand setter in a ref so the focus effect can call it
  // without depending on its (per-render) identity.
  const onExpandedChangeRef = useRef(onExpandedChange);
  useEffect(() => {
    onExpandedChangeRef.current = onExpandedChange;
  }, [onExpandedChange]);

  const net = day?.net_pnl ?? netPnl;
  const trades = day?.trades_count ?? tradeCount;
  const wins = day?.win_count ?? winCount;
  const losses = day?.loss_count ?? lossCount;
  const hasTrades = trades > 0;

  const [weekday, monthDay] = formatDateParts(date);

  const score = disciplineForDate(date);
  const tone = disciplineTone(score);

  const pnlColor =
    net < 0
      ? "text-danger"
      : net > 0
        ? "text-kpi-metric-positive"
        : "text-text-tertiary";

  // Lazy day payload (trades + per-trade notes) — only when expanded.
  // Prefetch is triggered on hover so expand feels instant.
  const {
    isLoading,
    tradeList,
    messagesByTradeId,
    initialNote,
    initialMood,
    saveNote,
    isSaving,
    prefetch,
  } = useExpandedDay(accountId, date, expanded);

  const tradeLines = useMemo(
    () => buildTradeLines(tradeList, messagesByTradeId),
    [tradeList, messagesByTradeId],
  );

  const statStrip = useMemo<DayStat[]>(() => {
    return [
      { label: "Net P&L", value: money(net), tone: net >= 0 ? "win" : "loss" },
      {
        label: "Win rate",
        value: day ? `${day.win_rate.toFixed(0)}%` : "--",
      },
      { label: "Winners / losers", value: `${wins} / ${losses}` },
      {
        label: "Profit factor",
        value: day ? (day.profit_factor === null ? "--" : day.profit_factor.toFixed(2)) : "--",
      },
      { label: "Commissions", value: day ? money(day.commissions, false) : "--" },
      {
        label: "Volume",
        value: day ? day.volume.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "--",
      },
    ];
  }, [net, wins, losses, day]);

  // A focus request (Write / calendar / deep-link) expands this card. Deferred
  // to a microtask so it reads as an external-event sync, not a synchronous
  // cascading render within the effect body.
  useEffect(() => {
    if (focusNoteNonce == null || !hasTrades) return;
    const id = requestAnimationFrame(() => onExpandedChangeRef.current(true));
    return () => cancelAnimationFrame(id);
  }, [focusNoteNonce, hasTrades]);

  // Once expanded and loaded, scroll the session note into view and flash a
  // brief ring around it. Keyed on the nonce so repeat requests re-trigger.
  useEffect(() => {
    if (focusNoteNonce == null || !expanded || isLoading) return;
    const el = noteRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setNoteHighlight(true);
    });
    const t = setTimeout(() => setNoteHighlight(false), 1600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [focusNoteNonce, expanded, isLoading]);

  return (
    <section
      className="overflow-hidden rounded-2xl bg-card-bg ring-1 ring-hairline"
      onMouseEnter={hasTrades ? prefetch : undefined}
    >
      {/* Collapsed row — click anywhere to toggle expand */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => onExpandedChange(!expanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onExpandedChange(!expanded);
          }
        }}
        className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-card-bg-hover md:px-5"
      >
        <span
          aria-hidden
          className={cn(
            "shrink-0 p-0.5 text-text-tertiary transition-transform duration-200",
            expanded && "rotate-90",
          )}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
        </span>

        {/* Date — fixed width so the columns after it line up */}
        <div className="flex w-[9.25rem] shrink-0 items-baseline gap-1.5">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-tertiary">
            {weekday}
          </span>
          <span className="text-base font-bold text-text-primary">
            {monthDay}
          </span>
        </div>

        {/* Net P&L — fixed width */}
        <span
          className={cn(
            "w-28 shrink-0 text-base font-bold tabular-nums",
            hasTrades ? pnlColor : "text-text-tertiary",
          )}
        >
          {hasTrades ? money(net) : "—"}
        </span>

        {/* Discipline + W/L/trades — hidden on no-trade days */}
        {hasTrades ? (
          <>
            <div className="w-[4.5rem] shrink-0">
              <DisciplineBadge score={score} tone={tone} />
            </div>
            <span className="hidden text-sm text-text-secondary sm:inline">
              {wins}W · {losses}L
              <span className="mx-1.5 text-text-tertiary/60">·</span>
              {trades} {trades === 1 ? "trade" : "trades"}
            </span>
          </>
        ) : (
          <span className="text-sm text-text-secondary">No trades</span>
        )}

        {/* Write / Journaled — pushed right */}
        <div className="ml-auto shrink-0">
          {hasNote ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNote(date);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-success/30 bg-success-light/60 px-3.5 py-2 text-xs font-semibold text-kpi-metric-positive transition-colors hover:bg-success-light cursor-pointer"
            >
              <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2} />
              Journaled
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNote(date);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent-hover cursor-pointer"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={14} strokeWidth={2} />
              Write
            </button>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="space-y-4 border-t border-hairline px-4 pb-5 pt-4 md:px-5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-secondary">
              <HugeiconsIcon
                icon={Loading03Icon}
                size={16}
                strokeWidth={2}
                className="animate-spin"
              />
              Loading day…
            </div>
          ) : (
            <>
              {/* Coach's Read — static shell; TODO(ai) wire the read/insight to a
                  day-AI endpoint. "Continue with coach" opens the Partna AI dock
                  scoped to this day. */}
              <JournalCoachsRead
                read="Coach's read isn't available yet — connect Partna AI to get a daily breakdown of what worked and where discipline slipped."
                onContinue={() => onContinueCoach(date)}
              />

              <JournalDayStatStrip stats={statStrip} />

              {tradeLines.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-secondary">
                    {tradeLines.length}{" "}
                    {tradeLines.length === 1 ? "trade" : "trades"}
                  </p>
                  {/* Timeline: each row draws its own dot + connector segments,
                      so the line is always centered on the dot. */}
                  <div className="space-y-2.5">
                    {tradeLines.map((t, i) => (
                      <JournalTradeLine
                        key={t.id}
                        trade={t}
                        accountId={accountId}
                        isFirst={i === 0}
                        isLast={i === tradeLines.length - 1}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="py-2 text-sm text-text-secondary">
                  No trades for this day.
                </p>
              )}

              <div
                ref={noteRef}
                className={cn(
                  "rounded-xl transition-shadow duration-500",
                  noteHighlight &&
                    "ring-2 ring-ai-accent ring-offset-2 ring-offset-card-bg",
                )}
              >
                <JournalSessionNote
                  initialNote={initialNote}
                  initialMood={initialMood}
                  saving={isSaving}
                  onSave={saveNote}
                />
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function DisciplineBadge({
  score,
  tone,
}: {
  score: number;
  tone: "high" | "mid" | "low";
}) {
  return (
    <span
      title="Discipline score"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        tone === "high" && "bg-success-light/70 text-kpi-metric-positive",
        tone === "mid" && "bg-badge-warn-bg text-badge-warn-fg",
        tone === "low" && "bg-danger-light/70 text-danger",
      )}
    >
      <HugeiconsIcon icon={AiMagicIcon} size={12} strokeWidth={2} />
      {score}/{DISCIPLINE_MAX}
    </span>
  );
}
