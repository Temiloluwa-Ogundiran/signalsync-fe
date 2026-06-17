import { Suspense } from "react";
import { GlobalSettingsPage } from "@/features/settings";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GlobalSettingsPage />
    </Suspense>
  );
}
