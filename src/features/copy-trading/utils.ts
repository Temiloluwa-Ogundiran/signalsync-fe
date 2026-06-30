import type {
  CopyRoute,
  CopyTradingConnection,
  TelegramConnection,
} from "./types";

export function apiError(error: unknown): string {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "data" in error.response
  ) {
    const data = error.response.data as { detail?: string };
    return data.detail ?? "The request could not be completed.";
  }
  return error instanceof Error
    ? error.message
    : "The request could not be completed.";
}

export function connectionName(connection: TelegramConnection): string {
  return (
    connection.display_name ||
    (connection.username ? `@${connection.username}` : null) ||
    connection.phone_hint ||
    "Telegram account"
  );
}

export function accountLabel(
  account: CopyTradingConnection | undefined,
  fallback: string,
): string {
  if (!account) return `Account ${fallback.slice(0, 8)}`;
  return account.display_name || `${account.broker_server} ${account.broker_login}`;
}

export function routeInput(route: CopyRoute) {
  return {
    source_id: route.source_id,
    target_connection_id: route.target_connection_id ?? "",
    fixed_lot: route.fixed_lot,
    take_profit_mode: route.take_profit_mode,
    lot_distribution: route.lot_distribution,
    pending_orders_enabled: route.pending_orders_enabled,
    minimum_fields: route.minimum_fields,
    assembly_window_seconds: route.assembly_window_seconds,
    process_all_group_authors: route.process_all_group_authors,
    notify_success: route.notify_success,
    notify_failure: route.notify_failure,
    allow_sl_tp_updates: route.allow_sl_tp_updates,
    allow_break_even: route.allow_break_even,
    allow_additional_tp: route.allow_additional_tp,
    allow_partial_close: route.allow_partial_close,
    allow_full_close: route.allow_full_close,
    allow_pending_cancel: route.allow_pending_cancel,
    unsafe_minimum_confirmed: Boolean(route.unsafe_minimum_confirmed_at),
  };
}

export function relativeTime(value: string): string {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000),
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
