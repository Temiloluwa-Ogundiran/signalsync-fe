import { Suspense } from "react";
import { JournalAccountsPage } from "@/features/journal/components/journal-accounts-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JournalAccountsPage />
    </Suspense>
  );
}
