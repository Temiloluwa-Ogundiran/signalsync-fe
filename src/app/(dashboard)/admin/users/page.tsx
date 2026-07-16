import { AdminConsole } from "@/features/admin/admin-console";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user.platformRole === "technical_admin") redirect("/admin/system");
  return <AdminConsole view="users" />;
}
