import { Suspense } from "react";
import { JournalFeedPage } from "@/features/journal/components/journal-feed-page";

export const metadata = { title: "Journal" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JournalFeedPage />
    </Suspense>
  );
}
