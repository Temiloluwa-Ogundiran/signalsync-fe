import { ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface JournalDayChatHeaderProps {
  dayLabel: string;
  onBack: () => void;
  isReviewed: boolean;
  isMarkingReviewed?: boolean;
  markReviewDisabled?: boolean;
  onMarkReviewed: () => void;
  canPrevDay: boolean;
  canNextDay: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function JournalDayChatHeader({
  dayLabel,
  onBack,
  isReviewed,
  isMarkingReviewed,
  markReviewDisabled,
  onMarkReviewed,
  canPrevDay,
  canNextDay,
  onPrevDay,
  onNextDay,
}: JournalDayChatHeaderProps) {
  return (
    <Card className="border-x-0 border-t-0 rounded-none border-b-px border-border-primary bg-bg-primary shadow-none">
      <CardContent className="flex flex-wrap items-center gap-3 p-3 md:p-4">
        <Button
          variant="ghost"
          className="rounded-full border border-border-secondary bg-bg-primary px-4 text-text-primary"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <h1 className="font-heading font-bold text-2xl text-text-primary md:text-3xl">
          {dayLabel}
        </h1>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-full border border-border-secondary bg-bg-primary text-text-primary"
            type="button"
            disabled={Boolean(isMarkingReviewed || markReviewDisabled)}
            onClick={onMarkReviewed}
          >
            <Check className="h-4 w-4" />
            {isReviewed ? "Day reviewed" : "Mark day as reviewed"}
          </Button>

          <div className="inline-flex overflow-hidden rounded-full border-2 border-chrome-control-border bg-bg-secondary">
            <Button
              variant="ghost"
              type="button"
              disabled={!canPrevDay}
              className="rounded-none border-r border-chrome-control-border text-text-primary"
              onClick={onPrevDay}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Day
            </Button>
            <Button
              variant="ghost"
              type="button"
              disabled={!canNextDay}
              className="rounded-none text-text-primary"
              onClick={onNextDay}
            >
              Next Day
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
