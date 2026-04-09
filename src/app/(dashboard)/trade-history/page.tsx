import { Suspense } from "react";
import { JournalTradeHistoryPage } from "@/features/journal/components/journal-trade-history-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JournalTradeHistoryPage />
    </Suspense>
  );
}
