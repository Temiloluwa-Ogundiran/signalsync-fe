import { Suspense } from "react";
import { SetupsPage } from "@/features/journal/components/setups-page";

export const metadata = { title: "Strategies" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SetupsPage />
    </Suspense>
  );
}
