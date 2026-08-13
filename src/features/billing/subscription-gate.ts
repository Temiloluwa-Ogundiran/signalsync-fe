import type { Subscription } from "./api";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";
type GateDecision = "loading" | "allow" | "redirect" | "error";

export function resolveSubscriptionGate({
  pathname,
  sessionStatus,
  queryPending,
  queryError,
  subscription,
}: {
  pathname: string;
  sessionStatus: SessionStatus;
  queryPending: boolean;
  queryError: boolean;
  subscription?: Pick<
    Subscription,
    "plan" | "has_journal_access" | "has_copy_access"
  >;
}): GateDecision {
  if (
    pathname.startsWith("/settings/subscription") ||
    pathname.startsWith("/settings/affiliate")
  ) return "allow";
  if (sessionStatus !== "authenticated" || queryPending) return "loading";
  if (queryError) return "error";

  const hasAccess = pathname.startsWith("/copy-trading")
    ? subscription?.has_copy_access || subscription?.plan === "copy"
    : subscription?.has_journal_access || subscription?.plan !== null;

  return hasAccess ? "allow" : "redirect";
}
