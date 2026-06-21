export type CopyRouteState =
  | "draft"
  | "ready"
  | "active"
  | "paused"
  | "reauthentication_required"
  | "unsupported"
  | "target_unavailable";

export type CopyTradingMode = "setup" | "monitoring";

export type MinimumFields =
  | "direction_symbol"
  | "direction_symbol_entry"
  | "direction_symbol_sl"
  | "direction_symbol_tp"
  | "direction_symbol_sl_tp";

export type AutomationHealthTone =
  | "success"
  | "warning"
  | "neutral"
  | "danger";

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
  account_id: string;
  max_lot: string;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
}

export interface CopyRoute {
  id: string;
  source_id: string;
  target_account_id: string;
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
  account_id: string | null;
  correlation_id: string;
  action: string;
  level: "info" | "success" | "warning" | "error";
  title: string;
  body: string | null;
  parsed_details: Record<string, unknown>;
  broker_details: Record<string, unknown>;
  created_at: string;
}

export interface CopyTargetAccount {
  id: string;
  display_name: string | null;
  broker_name: string;
  broker_login: string;
  is_archived: boolean;
  connection_state: string;
  broker_server?: string;
  account_balance?: string | number | null;
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

export interface ChannelProfile {
  id: string;
  signal_style: string;
  recommended_assembly_window_seconds: number;
  confidence: "low" | "medium" | "high";
  confidence_score: number;
  image_frequency: number;
  image_primary: boolean;
  supported_actions: string[];
  sample_count: number;
  validated_at: string;
}

export interface TelegramSource {
  id: string;
  connection_id: string;
  telegram_chat_id: number;
  title: string;
  username: string | null;
  source_type: "channel" | "group";
  state: "draft" | "learning" | "ready" | "active" | "paused" | "unsupported";
  unsupported_reason: string | null;
  is_paused: boolean;
  profile: ChannelProfile | null;
}

export interface CopyRouteInput {
  source_id: string;
  target_account_id: string;
  fixed_lot: string;
  take_profit_mode: "all" | "lowest" | "highest";
  lot_distribution: "split_total" | "fixed_each";
  pending_orders_enabled: boolean;
  minimum_fields: MinimumFields;
  assembly_window_seconds: number | null;
  process_all_group_authors: boolean;
  notify_success: boolean;
  notify_failure: boolean;
  allow_sl_tp_updates: boolean;
  allow_break_even: boolean;
  allow_additional_tp: boolean;
  allow_partial_close: boolean;
  allow_full_close: boolean;
  allow_pending_cancel: boolean;
  unsafe_minimum_confirmed: boolean;
}
