import type {
  ActivityPresentation,
  AutomationHealth,
  CopyActivity,
  CopyRoute,
  CopyTradingMode,
  TelegramConnection,
  TelegramSource,
} from "./types";

type RouteStateOnly = Pick<CopyRoute, "state">;

export interface ActivityGroup {
  correlationId: string;
  events: CopyActivity[];
  latest: CopyActivity;
}

export function deriveCopyTradingMode(
  routes: RouteStateOnly[],
): CopyTradingMode {
  return routes.some((route) => route.state === "active")
    ? "monitoring"
    : "setup";
}

export function deriveAutomationHealth(input: {
  globallyPaused: boolean;
  routes: Pick<CopyRoute, "state" | "source_id" | "target_account_id">[];
  connections: Pick<TelegramConnection, "state" | "is_paused">[];
  sources: Pick<TelegramSource, "id" | "state" | "is_paused">[];
}): AutomationHealth {
  if (input.globallyPaused) {
    return {
      tone: "neutral",
      label: "Copying is paused",
      description: "New signals will not be sent to trading accounts.",
    };
  }

  const activeCount = input.routes.filter(
    (route) => route.state === "active",
  ).length;
  const blockedRoutes = input.routes.filter((route) =>
    [
      "reauthentication_required",
      "unsupported",
      "target_unavailable",
    ].includes(route.state),
  );
  const hasConnectionIssue = input.connections.some(
    (connection) => connection.state !== "ready" || connection.is_paused,
  );

  if (activeCount === 0 && (blockedRoutes.length > 0 || hasConnectionIssue)) {
    return {
      tone: "danger",
      label: "Copying has stopped",
      description:
        "Fix the affected Telegram or trading account connection.",
    };
  }
  if (blockedRoutes.length > 0 || hasConnectionIssue) {
    return {
      tone: "warning",
      label: "Some copy rules need attention",
      description: "Healthy rules will continue copying.",
    };
  }
  if (activeCount === 0) {
    return {
      tone: "neutral",
      label: "Copying is not set up yet",
      description: "Complete the setup steps to start copying signals.",
    };
  }
  return {
    tone: "success",
    label: "Copying is active",
    description: "Signals can be read and sent to connected accounts.",
  };
}

export function humanizeActivity(event: {
  action: string;
  title: string;
  parsed_details: Record<string, unknown>;
}): ActivityPresentation {
  const direction = String(event.parsed_details.direction ?? "");
  const symbol = String(event.parsed_details.symbol ?? "");
  const actionLabel =
    direction && symbol
      ? `${direction.toLowerCase() === "buy" ? "Buy" : "Sell"} ${symbol}`
      : event.title;
  const statusMap: Record<string, string> = {
    "signal.validated": "Signal understood",
    "signal.waiting": "Waiting for details",
    "signal.skipped": "Signal skipped",
    "signal.failed": "Signal could not be read",
    "broker.uncertain": "Confirming broker result",
    "broker.reconciled": "Broker result confirmed",
    "broker.succeeded": "Trade completed",
    "broker.failed": "Trade failed",
    "emergency.requested": "Emergency action processing",
    "emergency.succeeded": "Emergency action completed",
    "emergency.failed": "Emergency action failed",
  };
  return {
    actionLabel,
    statusLabel: statusMap[event.action] ?? event.title,
  };
}

export function summarizeCopyRule(
  route: Pick<
    CopyRoute,
    | "fixed_lot"
    | "take_profit_mode"
    | "lot_distribution"
    | "pending_orders_enabled"
  >,
): string {
  const takeProfit =
    route.take_profit_mode === "all"
      ? "Every take profit"
      : route.take_profit_mode === "lowest"
        ? "Nearest take profit"
        : "Furthest take profit";
  const sizing =
    route.take_profit_mode === "all"
      ? route.lot_distribution === "split_total"
        ? "Total size split"
        : "Full size per position"
      : null;
  return [
    `${Number(route.fixed_lot).toFixed(2)} lots`,
    takeProfit,
    sizing,
    route.pending_orders_enabled
      ? "Pending orders allowed"
      : "Market orders only",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function groupActivity(
  events: Array<
    Partial<CopyActivity> &
      Pick<
        CopyActivity,
        "id" | "correlation_id" | "created_at" | "level"
      >
  >,
): ActivityGroup[] {
  const groups = new Map<string, CopyActivity[]>();
  for (const event of events) {
    const current = groups.get(event.correlation_id) ?? [];
    current.push(event as CopyActivity);
    groups.set(event.correlation_id, current);
  }
  return [...groups.entries()]
    .map(([correlationId, groupedEvents]) => {
      const sorted = groupedEvents.toSorted(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime(),
      );
      return {
        correlationId,
        events: sorted,
        latest: sorted[sorted.length - 1],
      };
    })
    .toSorted(
      (a, b) =>
        new Date(b.latest.created_at).getTime() -
        new Date(a.latest.created_at).getTime(),
    );
}

export function failureGuidance(event: {
  title: string;
  parsed_details: Record<string, unknown>;
}): string {
  const symbol = String(event.parsed_details.symbol ?? "");
  if (
    symbol &&
    /symbol|tradable|available|match/i.test(event.title)
  ) {
    return `${event.title}. Other copy rules will continue. Check that ${symbol} is available on the selected trading account, then try again.`;
  }
  return `${event.title}. Other copy rules will continue. Review the copy rule and trading account, then try again.`;
}
