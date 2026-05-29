import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface JournalTradeChatHeaderProps {
  symbol: string;
  subtitle: string;
  onBack: () => void;
  isReviewed: boolean;
  isMarkingReviewed?: boolean;
  onMarkReviewed: () => void;
  canPrevTrade: boolean;
  canNextTrade: boolean;
  onPrevTrade: () => void;
  onNextTrade: () => void;
  isManual?: boolean;
  isMissed?: boolean;
  onEdit?: () => void;
}

export function JournalTradeChatHeader({
  symbol,
  subtitle,
  onBack,
  isReviewed,
  isMarkingReviewed,
  onMarkReviewed,
  canPrevTrade,
  canNextTrade,
  onPrevTrade,
  onNextTrade,
  isManual,
  isMissed,
  onEdit,
}: JournalTradeChatHeaderProps) {
  return (
    <Card className="rounded-none border-x-0 border-t-0 border-b-px border-border-primary bg-bg-primary shadow-none">
      <CardContent className="flex flex-col gap-3 p-3 md:p-4">
        {/* Missed Trade reflection banner */}
        {isMissed && (
          <div className="w-full rounded-xl bg-orange-500/10 border border-orange-500/25 px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-orange-500 animate-in fade-in duration-200">
            <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
            Missed Trade Setup — Logged for reflection and journaling only.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 w-full">
          <Button
            variant="ghost"
            className="rounded-full border border-border-secondary bg-bg-primary px-4 text-text-primary"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div>
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              {symbol}
            </h1>
            <p className="text-sm font-semibold text-text-secondary">
              {subtitle}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {isManual && onEdit && (
              <Button
                variant="ghost"
                onClick={onEdit}
                className="rounded-full border border-border-secondary bg-bg-primary text-text-primary h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-colors hover:bg-bg-secondary cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Trade</span>
              </Button>
            )}

            <Button
              variant="ghost"
              className="rounded-full border border-border-secondary bg-bg-primary text-text-primary h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold flex items-center gap-1"
              type="button"
              disabled={isMarkingReviewed}
              onClick={onMarkReviewed}
            >
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">
                {isReviewed ? "Trade reviewed" : "Mark Trade as reviewed"}
              </span>
              <span className="inline sm:hidden">
                {isReviewed ? "Reviewed" : "Mark Reviewed"}
              </span>
            </Button>

            <div className="inline-flex overflow-hidden rounded-full border border-border-secondary bg-bg-secondary h-8 sm:h-9">
              <Button
                variant="ghost"
                type="button"
                disabled={!canPrevTrade}
                className="rounded-none border-r border-border-secondary text-text-primary h-full px-2.5 sm:px-4 text-[11px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1"
                onClick={onPrevTrade}
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Previous Trade</span>
                <span className="inline sm:hidden">Prev</span>
              </Button>
              <Button
                variant="ghost"
                type="button"
                disabled={!canNextTrade}
                className="rounded-none text-text-primary h-full px-2.5 sm:px-4 text-[11px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1"
                onClick={onNextTrade}
              >
                <span className="hidden sm:inline">Next Trade</span>
                <span className="inline sm:hidden">Next</span>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
