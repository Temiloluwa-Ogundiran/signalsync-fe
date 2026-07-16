import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.platformRole === "user") {
    redirect("/dashboard");
  }
  return children;
}
