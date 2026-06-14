import { Suspense } from "react";
import { JournalDayPage } from "@/features/journal/components/journal-day-page";

export const metadata = { title: "Daily log" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JournalDayPage />
    </Suspense>
  );
}
