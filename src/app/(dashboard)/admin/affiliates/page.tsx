import { AdminConsole } from "@/features/admin/admin-console";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function AdminAffiliatesPage() {
  const session = await auth();
  if (session?.user.platformRole !== "super_admin") redirect("/admin");
  return <AdminConsole view="affiliates" />;
}
