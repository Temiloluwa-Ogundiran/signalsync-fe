import Link from "next/link";
import type {
  CopyActivity,
  CopyRoute,
  CopyTradingConnection,
  TelegramConnection,
} from "../types";
import { relativeTime } from "../utils";

export function HealthStrip({
  routes,
  connections,
  accounts,
  activity,
}: {
  routes: CopyRoute[];
  connections: TelegramConnection[];
  accounts: CopyTradingConnection[];
  activity: CopyActivity[];
}) {
  const latestSuccess = activity.find((event) => event.level === "success");
  const items = [
    {
      label: "Active copy rules",
      value: String(routes.filter((item) => item.state === "active").length),
      href: "/copy-trading/routes",
    },
    {
      label: "Telegram ready",
      value: String(
        connections.filter(
          (item) => item.state === "ready" && !item.is_paused,
        ).length,
      ),
      href: "/copy-trading/settings",
    },
    {
      label: "Trading accounts ready",
      value: String(
        accounts.filter((item) => item.state === "ready").length,
      ),
      href: "/copy-trading/settings",
    },
    {
      label: "Latest completed action",
      value: latestSuccess ? relativeTime(latestSuccess.created_at) : "None yet",
      href: "/copy-trading/activity",
    },
  ];
  return (
    <div className="grid border-y border-border-primary sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="border-b border-border-primary px-4 py-4 last:border-b-0 hover:bg-bg-tertiary sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
        >
          <span className="block text-xs text-text-tertiary">{item.label}</span>
          <span className="mt-1 block text-lg font-semibold text-text-primary">
            {item.value}
          </span>
        </Link>
      ))}
    </div>
  );
}
