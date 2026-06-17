"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  PencilEdit01Icon,
  Tick02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format/money";
import type { CurveIntradayDay, JournalMessage, JournalTrade } from "../types";
import { annotateTrade } from "../lib/journal-trade-tags";
import { useActiveAccountCurrency } from "../hooks/use-active-account-currency";
import { useExpandedDay } from "../hooks/use-expanded-day";
import { JournalCoachsRead } from "./journal-coachs-read";
import { JournalDayStatStrip, type DayStat } from "./journal-day-stat-strip";
import { JournalTradesTable, type TradeLineData } from "./journal-trades-table";
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

function money(value: number, currency: string, withSign = true): string {
  const formatted = formatMoney(Math.abs(value), {
    currency,
    fractionDigits: 2,
  });
  if (!withSign) return formatted;
  return value < 0 ? `-${formatted}` : formatted;
}

// Profit factor is unbounded; a single day with few/small losses produces huge
// values (140, etc.). Cap the shown number at 4.0 ("4.0+"); null = no losses (∞).
const PF_SCALE_MAX = 4;
function formatProfitFactor(pf: number | null, hasDay: boolean): string {
  if (!hasDay) return "--";
  if (pf === null) return "∞";
  return pf > PF_SCALE_MAX ? `${PF_SCALE_MAX.toFixed(1)}+` : pf.toFixed(2);
}

/** Returns ["FRI", "June 28"] — weekday eyebrow + month/day. */
function formatDateParts(iso: string): [string, string] {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
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
  const currency = useActiveAccountCurrency();
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
    saveNote,
    prefetch,
  } = useExpandedDay(accountId, date, expanded);

  const tradeLines = useMemo(
    () => buildTradeLines(tradeList, messagesByTradeId),
    [tradeList, messagesByTradeId],
  );

  const statStrip = useMemo<DayStat[]>(() => {
    return [
      { label: "Winners / losers", value: `${wins} / ${losses}` },
      {
        label: "Profit factor",
        value: formatProfitFactor(day?.profit_factor ?? null, day != null),
      },
      {
        label: "Commissions",
        value: day ? money(day.commissions, currency, false) : "--",
      },
      {
        label: "Volume",
        value: day ? day.volume.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "--",
      },
    ];
  }, [wins, losses, day, currency]);

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

        {/* Net P&L — label + value, fixed width */}
        <span className="flex w-44 shrink-0 items-baseline gap-1.5">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-tertiary">
            Net P&amp;L
          </span>
          <span
            className={cn(
              "text-base font-bold tabular-nums",
              hasTrades ? pnlColor : "text-text-tertiary",
            )}
          >
            {hasTrades ? money(net, currency) : "—"}
          </span>
        </span>

        {/* W/L pills + trades — hidden on no-trade days */}
        {hasTrades ? (
          <span className="hidden items-center gap-1.5 text-sm text-text-secondary sm:inline-flex">
            <CountPill tone="win" value={wins} suffix="W" />
            <CountPill tone="loss" value={losses} suffix="L" />
            <span className="mx-0.5 text-text-tertiary/60">·</span>
            {trades} {trades === 1 ? "trade" : "trades"}
          </span>
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

      {/* Expanded detail — Coach's Read and Day Note stay as cards; the stats +
          trades flow inline between them as one continuous page section. */}
      {expanded && (
        <div className="space-y-6 border-t border-hairline px-4 pb-6 pt-5 md:px-5">
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

              {/* Stats + trades flow together — no card chrome, no dividers, so
                  they read as one continuous page, not nested boxes. */}
              <div className="space-y-5">
                <JournalDayStatStrip stats={statStrip} />

                {tradeLines.length > 0 ? (
                  <JournalTradesTable trades={tradeLines} accountId={accountId} />
                ) : (
                  <p className="text-sm text-text-secondary">
                    No trades for this day.
                  </p>
                )}
              </div>

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

/** Coloured count pill — green for wins, red for losses. */
function CountPill({
  tone,
  value,
  suffix,
}: {
  tone: "win" | "loss";
  value: number;
  suffix: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        tone === "win"
          ? "bg-success-light/70 text-kpi-metric-positive"
          : "bg-danger-light/70 text-danger",
      )}
    >
      {value}
      {suffix}
    </span>
  );
}
