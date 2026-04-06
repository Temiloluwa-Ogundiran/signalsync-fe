import { PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JournalDayModalFooterProps {
  onClose: () => void;
  onOpenDayJournal: () => void;
}

export function JournalDayModalFooter({
  onClose,
  onOpenDayJournal,
}: JournalDayModalFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-border-primary px-8 py-5">
      <Button
        type="button"
        variant="outline"
        className="rounded-full border-border-primary bg-card-bg text-text-primary hover:bg-bg-tertiary"
        onClick={onClose}
      >
        Close
      </Button>
      <Button
        type="button"
        className="rounded-full bg-violet-700 text-white hover:bg-violet-600"
        onClick={onOpenDayJournal}
      >
        <PencilLine className="mr-2 h-4 w-4" />
        Journal Day
      </Button>
    </div>
  );
}
