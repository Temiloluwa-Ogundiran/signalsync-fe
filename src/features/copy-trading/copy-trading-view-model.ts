import type {
  ActivityPresentation,
  AutomationHealth,
  CopyActivity,
  CopyRoute,
  CopyTradingMode,
  CopySystemHealth,
  CopyLaunchReadiness,
  TelegramConnection,
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

export function deriveSystemHealth(input: {
  globallyPaused: boolean;
  system?: CopySystemHealth;
  launch?: CopyLaunchReadiness;
  connections?: Pick<
    TelegramConnection,
    "state" | "is_paused" | "last_heartbeat_at"
  >[];
}): AutomationHealth {
  if (input.globallyPaused) {
    return {
      tone: "neutral",
      label: "Copying is paused",
      description: "New signals will not be sent to trading accounts.",
    };
  }
  if (!input.system) {
    return {
      tone: "neutral",
      label: "Checking automation",
      description: "Worker status is being refreshed.",
    };
  }
  if (
    input.connections?.some(
      (connection) => connection.state === "reauthentication_required",
    )
  ) {
    return {
      tone: "warning",
      label: "Reconnect Telegram",
      description:
        "Signal reading is stopped. Open Connections & Safety and reconnect Telegram to resume copying.",
    };
  }
  if (
    input.connections?.some(
      (connection) => connection.state === "disconnected",
    )
  ) {
    return {
      tone: "warning",
      label: "Telegram is reconnecting",
      description:
        "Signal reading will resume automatically. You do not need to reconnect your account.",
    };
  }
  if (input.launch && !input.launch.ready) {
    return {
      tone: "danger",
      label: "Live copying is blocked",
      description: humanizeLaunchBlocker(input.launch.blockers[0]),
    };
  }
  if (input.system.status === "action_required") {
    return {
      tone: "danger",
      label: "Copying needs attention",
      description: humanizeHealthIssue(input.system.issues[0]),
    };
  }
  if (input.system.status === "degraded") {
    return {
      tone: "warning",
      label: "Copying is delayed",
      description: `${humanizeHealthIssue(input.system.issues[0])} Healthy rules continue processing.`,
    };
  }
  const staleConnection = input.connections?.some((connection) => {
    if (
      connection.state !== "ready" ||
      connection.is_paused ||
      !connection.last_heartbeat_at
    ) {
      return false;
    }
    const heartbeatTime = new Date(connection.last_heartbeat_at).getTime();
    return (
      Number.isFinite(heartbeatTime) &&
      Date.now() - heartbeatTime > 5 * 60 * 1000
    );
  });
  if (staleConnection) {
    return {
      tone: "warning",
      label: "Telegram is reconnecting",
      description:
        "No recent Telegram heartbeat was received. SignalSync is recovering the saved session automatically.",
    };
  }
  return {
    tone: "success",
    label: "Copying is operational",
    description:
      "Telegram, signal processing, and broker execution are responding.",
  };
}

function humanizeHealthIssue(issue?: string): string {
  if (!issue) return "One automation component is not responding.";
  return issue
    .replace("copy-execution", "The execution worker")
    .replace("copy-signal", "The signal worker")
    .replace("telegram-session", "The Telegram worker")
    .replace(" has not reported health", " has not started")
    .replace(" is stale", " has stopped reporting");
}

function humanizeLaunchBlocker(blocker?: string): string {
  const messages: Record<string, string> = {
    uncertain_intents:
      "A broker confirmation is unresolved. New live copying should remain paused.",
    runtime_health:
      "One or more automation services are not ready for live copying.",
  };
  return messages[blocker ?? ""] ?? "A launch safety check needs attention.";
}

export function humanizeActivity(event: {
  action: string;
  title: string;
  parsed_details: Record<string, unknown>;
}): ActivityPresentation {
  const direction = String(event.parsed_details.direction ?? "");
  const symbol = String(event.parsed_details.symbol ?? "");
  const openingAction = String(event.parsed_details.action ?? "");
  const isOpeningAction = ["open_market", "place_pending"].includes(
    openingAction,
  );
  const actionLabel =
    isOpeningAction && direction && symbol
      ? `${direction.toLowerCase() === "buy" ? "Buy" : "Sell"} ${symbol}`
      : event.title;
  const statusMap: Record<string, string> = {
    "signal.validated": "Signal understood",
    "signal.waiting": "Waiting for trade details",
    "signal.skipped": "Signal skipped",
    "signal.failed": "Signal could not be read",
    "signal.expired": "Incomplete signal expired",
    "broker.uncertain": "Confirming with broker",
    "broker.reconciled": "Broker result confirmed",
    "broker.succeeded": "Trade completed",
    "broker.failed": "Trade failed",
    "broker.confirmed": event.title,
    "risk.blocked": "Blocked by account safety settings",
    "reconciliation.drift": "Broker change synchronized",
    "dead_letter.replayed": "Failed action retried",
    "emergency.requested": "Emergency action processing",
    "emergency.succeeded": "Emergency action completed",
    "emergency.failed": "Emergency action failed",
  };
  return {
    actionLabel,
    statusLabel: statusMap[event.action] ?? event.title,
  };
}

export function activityStatusState(event: {
  action: string;
  level: "info" | "success" | "warning" | "error";
}): string {
  if (["signal.expired", "signal.skipped"].includes(event.action))
    return "skipped";
  if (event.action.endsWith(".failed")) return "failed";
  if (
    ["broker.uncertain", "signal.waiting", "emergency.requested"].includes(
      event.action,
    )
  ) {
    return "processing";
  }
  if (
    [
      "signal.validated",
      "route.created",
      "route.updated",
      "route.resumed",
      "broker.reconciled",
      "broker.succeeded",
      "emergency.succeeded",
    ].includes(event.action)
  ) {
    return "success";
  }
  return event.level;
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
    .join(" | ");
}

export function groupActivity(
  events: Array<
    Partial<CopyActivity> &
      Pick<CopyActivity, "id" | "correlation_id" | "created_at" | "level">
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
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
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
  if (symbol && /symbol|tradable|available|match/i.test(event.title)) {
    return `${event.title}. Other copy rules will continue. Check that ${symbol} is available on the selected trading account, then try again.`;
  }
  return `${event.title}. Other copy rules will continue. Review the copy rule and trading account, then try again.`;
}
