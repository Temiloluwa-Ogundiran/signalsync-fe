import { auth } from "@/auth";
import { hasUsableSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  redirect(hasUsableSession(session) ? "/journal" : "/login");
}
