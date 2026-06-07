import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardShell from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
