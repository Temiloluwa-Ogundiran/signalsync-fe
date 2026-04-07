import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface JournalDayChatHeaderProps {
  dayLabel: string;
  onBack: () => void;
}

export function JournalDayChatHeader({
  dayLabel,
  onBack,
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
          >
            <Check className="h-4 w-4" />
            Mark day as reviewed
          </Button>

          <div className="inline-flex overflow-hidden rounded-full border-2 border-chrome-control-border bg-bg-secondary">
            <Button
              variant="ghost"
              className="rounded-none border-r border-chrome-control-border text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Day
            </Button>
            <Button variant="ghost" className="rounded-none text-text-primary">
              Next Day
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            className="rounded-full border-2 border-chrome-control-border bg-bg-primary text-text-primary"
          >
            <Share2 className="h-4 w-4" />
            Export Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
