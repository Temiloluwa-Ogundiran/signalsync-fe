"use client";

import { Star } from "lucide-react";
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
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-semibold tabular-nums text-text-primary">
        {value}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-text-tertiary">
      {children}
    </p>
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
  const pnlTone =
    net > 0
      ? "text-kpi-metric-positive"
      : net < 0
        ? "text-danger"
        : "text-text-tertiary";

  const groupColor = new Map(config.map((g) => [g.id, g.color || "#64748b"]));

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-2 pr-8">
            <SheetTitle>{trade.symbol}</SheetTitle>
            <Badge variant="neutral">{trade.direction}</Badge>
          </div>
          <SheetDescription>
            <span className={cn("font-semibold", pnlTone)}>
              {formatMoney(net, { currency })}
            </span>
            {trade.net_roi_percent != null && (
              <span className="ml-2 text-text-tertiary">
                {num(trade.net_roi_percent).toFixed(2)}% ROI
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-6">
          {/* Stats */}
          <section>
            <SectionLabel>Stats</SectionLabel>
            <div className="rounded-xl bg-card-bg px-4 py-2 ring-1 ring-hairline">
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
              <StatRow label="Opened" value={fmtDateTime(trade.opened_at)} />
              <StatRow label="Closed" value={fmtDateTime(trade.closed_at)} />
              <StatRow label="Duration" value={fmtDuration(trade.duration_seconds)} />
              {trade.session && (
                <StatRow label="Session" value={trade.session} />
              )}
            </div>
          </section>

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
      </SheetContent>
    </Sheet>
  );
}
