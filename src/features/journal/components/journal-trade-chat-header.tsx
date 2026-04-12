import { ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";
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
}: JournalTradeChatHeaderProps) {
  return (
    <Card className="rounded-none border-x-0 border-t-0 border-b-px border-border-primary bg-bg-primary shadow-none">
      <CardContent className="flex flex-wrap items-center gap-3 p-3 md:p-4">
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

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-full border border-border-secondary bg-bg-primary text-text-primary"
            type="button"
            disabled={isMarkingReviewed}
            onClick={onMarkReviewed}
          >
            <Check className="h-4 w-4" />
            {isReviewed ? "Trade reviewed" : "Mark Trade as reviewed"}
          </Button>

          <div className="inline-flex overflow-hidden rounded-full border-2 border-chrome-control-border bg-bg-secondary">
            <Button
              variant="ghost"
              type="button"
              disabled={!canPrevTrade}
              className="rounded-none border-r border-chrome-control-border text-text-primary"
              onClick={onPrevTrade}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Trade
            </Button>
            <Button
              variant="ghost"
              type="button"
              disabled={!canNextTrade}
              className="rounded-none text-text-primary"
              onClick={onNextTrade}
            >
              Next Trade
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
