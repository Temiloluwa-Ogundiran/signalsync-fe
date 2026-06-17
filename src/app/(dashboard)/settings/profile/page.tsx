import { Suspense } from "react";
import { ProfileSettingsPage } from "@/features/settings";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfileSettingsPage />
    </Suspense>
  );
}
