import { Suspense } from "react";
import { TagSettingsPage } from "@/features/settings";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TagSettingsPage />
    </Suspense>
  );
}
