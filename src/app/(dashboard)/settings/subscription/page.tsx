import { Suspense } from "react";

import { SubscriptionPage } from "@/features/billing/subscription-page";


export default function Page() {
  return (
    <Suspense fallback={null}>
      <SubscriptionPage />
    </Suspense>
  );
}
