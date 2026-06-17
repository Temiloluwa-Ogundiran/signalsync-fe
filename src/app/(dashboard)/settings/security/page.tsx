import { Suspense } from "react";
import { SecuritySettingsPage } from "@/features/settings";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SecuritySettingsPage />
    </Suspense>
  );
}
