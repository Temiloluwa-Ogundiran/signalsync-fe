import { auth } from "@/lib/auth/auth";
import { hasUsableSession } from "@/lib/auth/auth-session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  redirect(hasUsableSession(session) ? "/journal" : "/login");
}
