import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasUsableSession } from "@/lib/auth-session";
import DashboardShell from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!hasUsableSession(session)) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
