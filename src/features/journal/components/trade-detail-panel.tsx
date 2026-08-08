"use client";

import { useState } from "react";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format/money";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { JournalTrade, Tag } from "../types";
import {
  useJournalTagsConfig,
  useTradeTags,
  useUpdateTradeTags,
  useUpdateTradeRating,
  useUpdateTradeAssessment,
} from "../hooks/use-journal-tags";
import {
  useTradeNote,
  useSaveTradeNote,
  useUpdateTradeSetup,
} from "../hooks/use-trade-detail";
import { JournalTagSelector } from "./journal-tag-selector";
import { JournalSessionNote } from "./journal-session-note";
import { TradeSetupPicker } from "./trade-setup-picker";
import { TradeAiReview } from "./trade-ai-review";
import { useActiveAccountCurrency } from "../hooks/use-active-account-currency";

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

function fmtDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-semibold tabular-nums text-text-primary">
        {value}
      </span>
    </div>
  );
}

/** Boxed group of StatRows with hairline dividers between rows. */
function StatGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {title && <SectionLabel>{title}</SectionLabel>}
      <div className="rounded-xl bg-card-bg px-4 ring-1 ring-hairline [&>*+*]:border-t [&>*+*]:border-hairline">
        {children}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[0.7rem] font-semibold uppercase text-text-tertiary">
      {children}
    </p>
  );
}

type Outcome = "win" | "loss" | "be";

function outcomeOf(net: number): Outcome {
  if (net > 0) return "win";
  if (net < 0) return "loss";
  return "be";
}

const OUTCOME_LABEL: Record<Outcome, string> = {
  win: "Win",
  loss: "Loss",
  be: "Break-even",
};

/** Hero P&L card — outcome-colored left rail, large net P&L, ROI + gross chips. */
function PnlHero({
  net,
  gross,
  roiPercent,
  currency,
}: {
  net: number;
  gross: number;
  roiPercent: number | null;
  currency: string;
}) {
  const outcome = outcomeOf(net);
  const tone =
    outcome === "win"
      ? "text-kpi-metric-positive"
      : outcome === "loss"
        ? "text-danger"
        : "text-text-primary";
  const rail =
    outcome === "win"
      ? "before:bg-kpi-metric-positive"
      : outcome === "loss"
        ? "before:bg-danger"
        : "before:bg-border-secondary";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-card-bg px-4 py-3 ring-1 ring-hairline",
        "before:absolute before:inset-y-0 before:left-0 before:w-1",
        rail,
      )}
    >
      <p className="text-[0.7rem] font-semibold uppercase text-text-tertiary">
        Net P&amp;L
      </p>
      <p className={cn("mt-0.5 text-2xl font-bold tabular-nums", tone)}>
        {formatMoney(net, { currency })}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {roiPercent != null && (
          <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5 text-xs text-text-secondary">
            ROI
            <span className={cn("font-semibold tabular-nums", tone)}>
              {roiPercent.toFixed(2)}%
            </span>
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5 text-xs text-text-secondary">
          Gross
          <span className="font-semibold tabular-nums text-text-primary">
            {formatMoney(gross, { currency })}
          </span>
        </span>
      </div>
    </div>
  );
}

function StarRating({
  value,
  onRate,
}: {
  value: number;
  onRate: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Rate ${n}`}
          onClick={() => onRate(n === value ? 0 : n)}
          className="cursor-pointer transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              n <= value
                ? "fill-star text-star"
                : "text-text-tertiary/40 hover:text-text-tertiary",
            )}
          />
        </button>
      ))}
    </div>
  );
}

const ASSESSMENTS = [
  { key: "execution_quality", label: "Execution" },
  { key: "setup_quality", label: "Setup quality" },
  { key: "discipline_score", label: "Discipline" },
] as const;

function ScoreScale({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[0, 2, 4, 6, 8, 10].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "h-6 w-6 rounded-md text-[0.7rem] font-semibold tabular-nums transition-colors",
            value === n
              ? "bg-accent text-accent-foreground"
              : "bg-surface-subtle text-text-tertiary hover:bg-surface-subtle-hover",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export function TradeDetailPanel({
  trade,
  accountId,
  open,
  onClose,
}: {
  trade: JournalTrade | null;
  accountId: string;
  open: boolean;
  onClose: () => void;
}) {
  const currency = useActiveAccountCurrency();
  const tradeId = trade?.id;

  const [tab, setTab] = useState<"details" | "ai">("details");
  // Reset to Details whenever a different trade is opened (the panel is reused
  // across trades). Adjust during render via a tracked previous id rather than
  // an effect, to avoid a cascading re-render.
  const [seenTradeId, setSeenTradeId] = useState(tradeId);
  if (tradeId !== seenTradeId) {
    setSeenTradeId(tradeId);
    setTab("details");
  }

  const { data: config = [] } = useJournalTagsConfig();
  const { data: tradeTags = [] } = useTradeTags(tradeId, open && !!tradeId);
  const { data: note } = useTradeNote(tradeId, open && !!tradeId);

  const updateTags = useUpdateTradeTags(accountId);
  const updateRating = useUpdateTradeRating(accountId);
  const updateAssessment = useUpdateTradeAssessment(accountId);
  const updateSetup = useUpdateTradeSetup(accountId);
  const saveNote = useSaveTradeNote(tradeId);

  if (!trade) return null;

  const net = num(trade.net_profit);
  const commission = num(trade.commission);
  const swap = num(trade.swap);
  // Gross is not stored — net is after costs, so add them back.
  const gross = net + commission + swap;
  const roiPercent =
    trade.net_roi_percent != null ? num(trade.net_roi_percent) : null;
  const outcome = outcomeOf(net);

  const groupColor = new Map(config.map((g) => [g.id, g.color || "#64748b"]));

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-2 pr-8">
            <SheetTitle>{trade.symbol}</SheetTitle>
            <Badge variant={trade.direction === "buy" ? "info" : "warn"}>
              {trade.direction}
            </Badge>
            <Badge variant={outcome}>{OUTCOME_LABEL[outcome]}</Badge>
          </div>
          <SheetDescription>
            {fmtDateTime(trade.opened_at)} → {fmtDateTime(trade.closed_at)}
            <span className="mx-1.5 text-text-tertiary">·</span>
            Held {fmtDuration(trade.duration_seconds)}
          </SheetDescription>
        </SheetHeader>

        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-hairline px-5">
          {(
            [
              { key: "details", label: "Details", icon: null },
              { key: "ai", label: "AI Review", icon: Sparkles },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 px-2 py-2.5 text-sm font-semibold transition-colors",
                tab === t.key
                  ? "border-ai-accent text-text-primary"
                  : "border-transparent text-text-tertiary hover:text-text-secondary",
              )}
            >
              {t.icon && (
                <t.icon
                  className={cn(
                    "size-3.5",
                    tab === t.key ? "text-ai-accent" : undefined,
                  )}
                />
              )}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "ai" ? (
          <SheetBody>
            <TradeAiReview
              trade={trade}
              accountId={accountId}
              enabled={open && tab === "ai"}
            />
          </SheetBody>
        ) : (
        <SheetBody className="space-y-6">
          {/* Hero P&L */}
          <PnlHero
            net={net}
            gross={gross}
            roiPercent={roiPercent}
            currency={currency}
          />

          {/* Execution */}
          <StatGroup title="Execution">
            <StatRow
              label="Entry → Exit"
              value={`${num(trade.open_price)} → ${num(trade.close_price)}`}
            />
            <StatRow label="Volume" value={num(trade.volume)} />
            <StatRow
              label="SL / TP"
              value={`${trade.sl ?? "—"} / ${trade.tp ?? "—"}`}
            />
            {trade.r_multiple != null && (
              <StatRow label="R-multiple" value={`${trade.r_multiple.toFixed(2)}R`} />
            )}
            {trade.session && <StatRow label="Session" value={trade.session} />}
          </StatGroup>

          {/* Excursion — only when MFE/MAE available */}
          {(trade.mfe != null || trade.mae != null) && (
            <StatGroup title="Excursion">
              {trade.mfe != null && (
                <StatRow
                  label="Max favorable (MFE)"
                  value={formatMoney(num(trade.mfe), { currency })}
                />
              )}
              {trade.mae != null && (
                <StatRow
                  label="Max adverse (MAE)"
                  value={formatMoney(num(trade.mae), { currency })}
                />
              )}
            </StatGroup>
          )}

          {/* Costs */}
          <StatGroup title="Costs">
            <StatRow
              label="Commission"
              value={formatMoney(commission, { currency })}
            />
            <StatRow label="Swap" value={formatMoney(swap, { currency })} />
            <StatRow
              label="Gross P&L"
              value={formatMoney(gross, { currency })}
            />
            <StatRow label="Net P&L" value={formatMoney(net, { currency })} />
          </StatGroup>

          {/* Rating */}
          <section>
            <SectionLabel>Rating</SectionLabel>
            <StarRating
              value={trade.rating ?? 0}
              onRate={(rating) =>
                updateRating.mutate({ tradeId: trade.id, rating })
              }
            />
          </section>

          {/* Assessment */}
          <section>
            <SectionLabel>Assessment</SectionLabel>
            <div className="space-y-2">
              {ASSESSMENTS.map((a) => (
                <div key={a.key} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{a.label}</span>
                  <ScoreScale
                    value={trade[a.key] as number | undefined}
                    onChange={(n) =>
                      updateAssessment.mutate({
                        tradeId: trade.id,
                        [a.key]: n,
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Setup */}
          <section>
            <SectionLabel>Setup</SectionLabel>
            <TradeSetupPicker
              value={trade.setup ?? null}
              onChange={(setup) =>
                updateSetup.mutate({ tradeId: trade.id, setup })
              }
            />
          </section>

          {/* Tags */}
          <section>
            <SectionLabel>Tags</SectionLabel>
            <div className="flex flex-wrap items-center gap-1.5">
              {tradeTags.map((tag: Tag) => {
                const c = groupColor.get(tag.group_id) || "#64748b";
                return (
                  <span
                    key={tag.id}
                    className="inline-flex items-center rounded px-1.5 py-0.5 text-[0.7rem] font-semibold"
                    style={{ backgroundColor: `${c}26`, color: c }}
                  >
                    {tag.name}
                  </span>
                );
              })}
              {config.length > 0 && (
                <JournalTagSelector
                  groups={config}
                  selectedTags={tradeTags}
                  onSelectChange={(tagIds) =>
                    updateTags.mutate({ tradeId: trade.id, tagIds })
                  }
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded border border-dashed border-hairline px-1.5 py-0.5 text-[0.7rem] font-semibold text-text-tertiary transition-colors hover:border-border-secondary hover:text-text-secondary"
                    >
                      + Tag
                    </button>
                  }
                />
              )}
            </div>
          </section>

          {/* Note */}
          <section>
            <JournalSessionNote
              key={trade.id}
              initialNote={note?.note_html ?? ""}
              onSave={(text) => saveNote.mutateAsync(text || null)}
            />
          </section>
        </SheetBody>
        )}

      </SheetContent>
    </Sheet>
  );
}
