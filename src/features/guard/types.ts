/**
 * Partna Guard — types mirror the BE read-models (synctrades-be/docs/partna-guard-spec.md §3–4).
 *
 * The FE renders these numbers verbatim — it NEVER recomputes any floor/buffer/ratio.
 * All buffer math is the deterministic Python engine's job; this is presentation only.
 */

export type GuardStatus =
  | "HEALTHY"
  | "CAUTION"
  | "WARNING"
  | "CRITICAL"
  | "LOCKED";

export type DrawdownType = "STATIC" | "TRAILING";
export type DailyBasis = "BALANCE" | "EQUITY";
export type DailyAnchor = "DAY_START_BALANCE" | "HIGHER_OF_BALANCE_EQUITY";
export type DrawdownAnchorRef = "INITIAL_BALANCE" | "PEAK_EQUITY" | "PEAK_BALANCE";
export type TradingDayRule = "ANY_TRADE" | "RESULT_MOVES_X";
export type ConsistencyBasis = "TOTAL_PROFIT" | "TARGET";

/** A line item in the monitor read-model (`monitor_view._line`). */
export interface GuardLine {
  label: string;
  floor: number;
  room: number;
  /** 0..100, already rounded by the BE. */
  consumed_pct: number;
  breached: boolean;
}

export interface GuardConsistency {
  biggest_day: number;
  share: number;
  cap: number;
  ceiling: number;
  state: GuardStatus;
}

export interface GuardPassPlan {
  band_lo: number;
  band_hi: number;
  days_left: number | null;
  ceil_day: number;
  on_track: boolean;
}

/** An open position passed through from mt5-core for the read-only positions panel. */
export interface GuardPosition {
  ticket: string;
  symbol: string;
  volume: number;
  open_price: number;
  profit: number;
  /** "Buy" | "Sell" if the BE resolves direction; optional otherwise. */
  side?: string;
}

/** One point of the rolling intraday equity window. */
export interface GuardTickPoint {
  ts: string;
  equity: number;
}

/** A recent alert row (de-duped tier escalations). */
export interface GuardAlertEntry {
  ts: string;
  tier: GuardStatus | "BREACHED";
  kind: string;
  message: string;
  channel?: string;
  sent_ok?: boolean;
}

/**
 * The fat `/guard/accounts/{id}/monitor` payload — the whole awareness dashboard
 * in one call: latest AccountState projection + pass progress + positions +
 * rolling chart window + recent alerts.
 */
export interface GuardMonitor {
  account_id: string;
  ts: string;
  status: GuardStatus;
  equity: number;
  balance: number;
  peak: number;
  breached: boolean;
  nudge: string;
  lines: {
    daily: GuardLine;
    maxDD: GuardLine;
    personalDaily: GuardLine | null;
    personalDD: GuardLine | null;
  };
  challenge: {
    profit: number;
    target: number;
    to_go: number;
    days_traded: number;
    days_owed: number;
    passed: boolean;
    consistency: GuardConsistency | null;
    plan: GuardPassPlan | null;
  };
  /** Read-only open positions (presentation only). */
  positions: GuardPosition[];
  /** Floors for the chart reference lines (current firm-day). */
  chart: {
    points: GuardTickPoint[];
    daily_floor: number;
    max_dd_floor: number;
  };
  alerts: GuardAlertEntry[];
}

/** The user-entered firm rules, percentages as fractions (0.05 not 5). */
export interface GuardRuleSpecInput {
  daily_loss: {
    pct: number;
    basis: DailyBasis;
    anchor: DailyAnchor;
    reset_hour: number;
    reset_tz: string;
  };
  max_drawdown: {
    pct: number;
    type: DrawdownType;
    anchor_ref: DrawdownAnchorRef;
    locks_at_initial: boolean;
  };
  profit_target: { pct: number };
  min_days?: { count: number; day_counts_if: TradingDayRule } | null;
  consistency?: { cap: number; basis: ConsistencyBasis } | null;
  firm?: string;
}

export interface GuardPersonalInput {
  daily_frac: number;
  dd_frac: number;
}

/** A Guard-enabled account row (list + detail). */
export interface GuardAccount {
  id: string;
  trading_account_id: string;
  enabled: boolean;
  size: number;
  status: GuardStatus | null;
  connection_health: "ok" | "offline";
  last_polled_at: string | null;
  display_name: string | null;
  broker_name: string | null;
  rule_spec: GuardRuleSpecInput;
  personal: GuardPersonalInput | null;
  contract_text: string | null;
}

/** The `/guard/accounts/{id}/rules` projection (rules_view). */
export interface GuardRulesView {
  account_id: string;
  size: number;
  firm: {
    name: string;
    version: string;
    daily_loss_pct: number;
    daily_basis: DailyBasis;
    daily_reset: string;
    max_drawdown_pct: number;
    max_drawdown_type: DrawdownType;
    profit_target_pct: number;
    min_days: number;
    consistency_cap_pct: number | null;
  };
  personal: { daily_frac: number; dd_frac: number };
  contract: string;
}

/** Body for POST /guard/accounts (enable Guard on a connected account). */
export interface EnableGuardInput {
  trading_account_id: string;
  size: number;
  rule_spec: GuardRuleSpecInput;
  personal?: GuardPersonalInput | null;
  contract_text?: string | null;
}

export interface GuardConnectableAccount {
  id: string;
  display_name: string | null;
  broker_name: string;
  broker_login: string;
  connection_state: string;
  is_archived: boolean;
  /** True when this account already has Guard enabled. */
  guard_enabled?: boolean;
}
