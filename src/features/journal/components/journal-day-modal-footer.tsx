import { PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface JournalDayModalFooterProps {
  onClose: () => void;
  onOpenDayJournal: () => void;
}

export function JournalDayModalFooter({
  onClose,
  onOpenDayJournal,
}: JournalDayModalFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-border-primary px-11 py-3">
      <Button
        type="button"
        variant="outline"
        className="rounded-full border-border-primary cursor-pointer bg-card-bg text-text-primary hover:bg-bg-tertiary w-[164px] h-[46px]"
        onClick={onClose}
      >
        Close
      </Button>
      <Button
        type="button"
        className="rounded-full font-semibold bg-violet-700 cursor-pointer text-white hover:bg-violet-600 w-[164px] h-[46px]"
        onClick={onOpenDayJournal}
      >
        <PencilLine className="h-4 w-4" />
        Journal Day
      </Button>
    </div>
  );
}
