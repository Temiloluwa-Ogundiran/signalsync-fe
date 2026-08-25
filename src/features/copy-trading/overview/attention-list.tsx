import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type {
  CopyActivity,
  CopyRoute,
  TelegramConnection,
  TelegramSource,
} from "../types";

interface AttentionItem {
  title: string;
  detail: string;
  href: string;
  action: string;
}

export function AttentionList({
  routes,
  connections,
  sources,
  activity,
}: {
  routes: CopyRoute[];
  connections: TelegramConnection[];
  sources: TelegramSource[];
  activity: CopyActivity[];
}) {
  const items: AttentionItem[] = [];
  if (
    connections.some(
      (item) => item.state === "reauthentication_required",
    )
  ) {
    items.push({
      title: "Telegram needs to be reconnected",
      detail:
        "Affected channels cannot be read. Other healthy copy rules will continue.",
      href: "/copy-trading/settings",
      action: "Open settings",
    });
  }
  if (sources.some((item) => item.is_paused)) {
    items.push({
      title: "A signal channel is paused",
      detail: "Resume it when you want SignalSync to process new messages.",
      href: "/copy-trading/settings",
      action: "Review channels",
    });
  }
  if (
    routes.some((item) =>
      ["target_unavailable", "reauthentication_required"].includes(item.state),
    )
  ) {
    items.push({
      title: "A copy rule cannot reach its trading account",
      detail: "Healthy copy rules will continue while you repair this one.",
      href: "/copy-trading/routes",
      action: "Review rules",
    });
  }
  if (activity.slice(0, 10).some((item) => item.level === "error")) {
    items.push({
      title: "A recent copied trade failed",
      detail:
        "Open the activity details to see the broker response and next action.",
      href: "/copy-trading/activity",
      action: "View failure",
    });
  }
  if (!items.length) return null;

  return (
    <section className="rounded-lg border border-warning/25 bg-card-bg">
      <div className="flex items-center gap-2 border-b border-border-primary px-4 py-3">
        <AlertTriangle className="size-4 text-warning-text" />
        <h2 className="font-semibold text-text-primary">Needs attention</h2>
      </div>
      <div className="divide-y divide-border-primary">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">
                {item.title}
              </p>
              <p className="mt-0.5 text-sm text-text-secondary">{item.detail}</p>
            </div>
            <Link
              href={item.href}
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-text-primary hover:underline"
            >
              {item.action}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
