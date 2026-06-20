export type CopyRouteState =
  | "draft"
  | "ready"
  | "active"
  | "paused"
  | "reauthentication_required"
  | "unsupported"
  | "target_unavailable";

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
  minimum_fields: string;
  assembly_window_seconds: number | null;
  process_all_group_authors: boolean;
  notify_success: boolean;
  notify_failure: boolean;
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
}
