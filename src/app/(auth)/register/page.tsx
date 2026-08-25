import { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { RegisterCard } from "@/features/auth/components/register-card";
import { AuthCardShell } from "@/features/auth/components/auth-card-shell";
import { hasUsableSession } from "@/lib/auth/auth-session";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Join SignalSync today",
};

export default async function RegisterPage() {
  const session = await auth();

  if (hasUsableSession(session)) {
    redirect("/dashboard");
  }

  return (
    <AuthCardShell withPanel>
      <RegisterCard />
    </AuthCardShell>
  );
}
