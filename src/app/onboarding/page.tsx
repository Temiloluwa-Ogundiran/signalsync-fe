import { auth } from "@/lib/auth/auth";
import { ForceLight } from "@/features/theme/force-light";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";

export const metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const session = await auth();
  const firstName =
    session?.user?.displayName?.split(" ")[0] ||
    session?.user?.name?.split(" ")[0] ||
    "";

  return (
    <>
      {/* Onboarding is always light, like the auth screens. */}
      <ForceLight />
      <OnboardingFlow firstName={firstName} />
    </>
  );
}
