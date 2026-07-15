type CopyRouteState =
  | "draft"
  | "ready"
  | "active"
  | "paused"
  | "needs_attention"
  | "reauthentication_required"
  | "target_unavailable";

export type CopyTradingMode = "setup" | "monitoring";

type MinimumFields =
  | "direction_symbol"
  | "direction_symbol_entry"
  | "direction_symbol_sl"
  | "direction_symbol_tp"
  | "direction_symbol_sl_tp";

type AutomationHealthTone = "success" | "warning" | "neutral" | "danger";

export interface AutomationHealth {
  tone: AutomationHealthTone;
  label: string;
  description: string;
}

export interface ActivityPresentation {
  actionLabel: string;
  statusLabel: string;
}

export interface CopyTradingSettings {
  user_id: string;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
}

export interface CopyAccountPolicy {
  id: string;
  connection_id: string;
  max_lot: string;
  max_lot_per_trade: string;
  max_open_positions: number;
  daily_loss_limit: string | null;
  max_drawdown_percent: string | null;
  allowed_symbols: string[];
  blocked_symbols: string[];
  market_signal_max_age_seconds: number;
  max_spread_points: number | null;
  max_slippage_points: number | null;
  max_quote_age_seconds: number;
  high_spread_behavior: "reject" | "wait";
  trading_start_hour_utc: number | null;
  trading_end_hour_utc: number | null;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
}

export interface CopyRoute {
  id: string;
  source_id: string;
  target_connection_id: string | null;
  magic_number: number;
  state: CopyRouteState;
  fixed_lot: string;
  take_profit_mode: "all" | "lowest" | "highest";
  lot_distribution: "split_total" | "fixed_each";
  pending_orders_enabled: boolean;
  minimum_fields: MinimumFields;
  assembly_window_seconds: number | null;
  process_all_group_authors: boolean;
  notify_success: boolean;
  notify_failure: boolean;
  semantic_duplicate_window_seconds: number;
  allow_sl_tp_updates: boolean;
  allow_break_even: boolean;
  allow_additional_tp: boolean;
  allow_partial_close: boolean;
  allow_full_close: boolean;
  allow_pending_cancel: boolean;
  unsafe_minimum_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CopyActivity {
  id: string;
  route_id: string | null;
  source_id: string | null;
  connection_id: string | null;
  correlation_id: string;
  action: string;
  level: "info" | "success" | "warning" | "error";
  title: string;
  body: string | null;
  parsed_details: Record<string, unknown>;
  broker_details: Record<string, unknown>;
  created_at: string;
}

export interface CopyActivityFilters {
  search?: string;
  level?: CopyActivity["level"];
  source_id?: string;
  connection_id?: string;
  cursor?: string;
  limit?: number;
}

export interface CopyActivityPage {
  items: CopyActivity[];
  next_cursor: string | null;
}

export interface CopyExecutionLatency {
  sample_count: number;
  p50_ms: number | null;
  p95_ms: number | null;
  p99_ms: number | null;
  target_ms: number;
  over_target_count: number;
  recent: Array<{
    correlation_id: string;
    action: string;
    symbol: string | null;
    status: string;
    ingestion_ms: number | null;
    assembly_ms: number | null;
    broker_ms: number | null;
    total_ms: number | null;
    created_at: string;
  }>;
}

export interface CopySignalReview {
  id: string;
  route_id: string;
  source_id: string;
  correlation_id: string;
  parsed_details: Record<string, unknown>;
  candidates: Array<{
    conversation_id: string;
    symbol: string | null;
    direction: string | null;
    updated_at: string;
  }>;
  state: "pending" | "approved" | "ignored";
  created_at: string;
}

export interface CopyRoutePreview {
  accepted: boolean;
  reason: string | null;
  action: string;
  signal_symbol: string | null;
  broker_symbol: string | null;
  direction: string | null;
  volume: string | null;
  take_profits: string[];
  warnings: string[];
}

interface CopyHealthComponent {
  role: string;
  status: "healthy" | "degraded" | "stale" | "missing" | string;
  heartbeat_at: string | null;
  stream_lag: number;
  pending_count: number;
  last_error: string | null;
}

export interface CopySystemHealth {
  status: "ready" | "degraded" | "action_required";
  ready: boolean;
  components: CopyHealthComponent[];
  issues: string[];
}

export interface CopyLaunchReadiness {
  ready: boolean;
  blockers: string[];
  warnings: string[];
  components: CopyHealthComponent[];
  stream_lag: number;
  pending_events: number;
  dead_letters: number;
  oldest_uncertain_seconds: number;
  global_paused: boolean;
}

type CopyTradingConnectionState =
  | "submitted"
  | "provisioning"
  | "deploying"
  | "connecting"
  | "synchronizing"
  | "ready"
  | "invalid_credentials"
  | "server_not_found"
  | "provisioning_failed"
  | "broker_disconnected"
  | "synchronization_failed"
  | "trading_disabled"
  | "deleting"
  | "deleted";

export interface CopyTradingConnection {
  id: string;
  user_id: string;
  display_name: string;
  broker_login: string;
  broker_server: string;
  platform: "mt5";
  metaapi_account_id: string | null;
  state: CopyTradingConnectionState;
  last_error_code: string | null;
  last_error_message: string | null;
  symbol_catalog_refreshed_at: string | null;
  last_health_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CopyTradingConnectionInput {
  display_name: string;
  broker_login: string;
  broker_server: string;
  trader_password: string;
  platform: "mt5";
}

export interface TelegramConnection {
  id: string;
  telegram_user_id: number | null;
  phone_hint: string | null;
  display_name: string | null;
  username: string | null;
  state: "pending" | "ready" | "reauthentication_required" | "disconnected";
  is_paused: boolean;
  reauthentication_reason: string | null;
  last_heartbeat_at: string | null;
  created_at: string;
}

export interface TelegramAuth {
  auth_id: string;
  method: "phone" | "qr";
  state: string;
  qr_url?: string | null;
  message: string;
}

export interface TelegramDialog {
  chat_id: number;
  title: string;
  username: string | null;
  source_type: "channel" | "group";
  is_admin: boolean;
}

export interface TelegramSource {
  id: string;
  connection_id: string;
  telegram_chat_id: number;
  title: string;
  username: string | null;
  source_type: "channel" | "group";
  state: "ready" | "active" | "paused";
  is_paused: boolean;
}

export interface CopyRouteInput {
  source_id: string;
  target_connection_id: string;
  fixed_lot: string;
  take_profit_mode: "all" | "lowest" | "highest";
  lot_distribution: "split_total" | "fixed_each";
  pending_orders_enabled: boolean;
  minimum_fields: MinimumFields;
  assembly_window_seconds: number | null;
  process_all_group_authors: boolean;
  notify_success: boolean;
  notify_failure: boolean;
  semantic_duplicate_window_seconds: number;
  allow_sl_tp_updates: boolean;
  allow_break_even: boolean;
  allow_additional_tp: boolean;
  allow_partial_close: boolean;
  allow_full_close: boolean;
  allow_pending_cancel: boolean;
  unsafe_minimum_confirmed: boolean;
}
