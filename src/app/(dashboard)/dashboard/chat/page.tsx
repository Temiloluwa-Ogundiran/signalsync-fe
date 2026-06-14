"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { JournalDayChatPage } from "@/features/journal/components/journal-day-chat-page";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center p-4 md:p-6">
          <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading journal day...
          </div>
        </div>
      }
    >
      <JournalDayChatPage />
    </Suspense>
  );
}
