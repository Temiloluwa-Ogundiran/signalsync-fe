export interface JournalCalendarDayStat {
  date: number;
  pnl: number;
  trades: number;
  winRate: number;
  /** True when the user has non-system journal notes on that day (daily or trade). */
  hasJournalActivity: boolean;
}

export type TradingPlatform = "MT5";

export interface JournalAccountConnectFormValues {
  broker_login: string;
  broker_server: string;
  investor_password: string;
  platform: TradingPlatform;
  display_name?: string;
}

export interface JournalAccountConnectPayload extends JournalAccountConnectFormValues {
  timezone?: string;
}

export interface Mt5ServerSearchItem {
  server_name: string;
}

export interface JournalAccount {
  id: string;
  user_id: string;
  meta_account_id: string;
  broker_name: string;
  broker_login: string;
  broker_server: string;
  account_type: "demo" | "live";
  platform: TradingPlatform;
  currency: string;
  timezone: string;
  broker_utc_offset: number;
  display_name: string | null;
  status: "pending_sync" | "synced" | "error";
  connection_state:
    | "pending_verification"
    | "verification_failed"
    | "bootstrapping"
    | "ready"
    | "bootstrap_failed";
  is_data_ready_for_stats: boolean;
  last_synced_at: string | null;
  last_bootstrap_synced_at: string | null;
  sync_error_message: string | null;
  bootstrap_error_message: string | null;
  last_sync_attempted_at: string | null;
  last_sync_outcome?: string | null;
  closed_trade_count?: number;
  next_sync_not_before: string | null;
  sync_status?: JournalAccountSyncStatus;
  // Backend serializes the Decimal as a string ("583.61"); may also be a number.
  latest_balance: string | number | null;
  latest_equity: number | null;
  is_archived: boolean;
  import_method?: string;
  created_at: string;
  /** True for the seeded demo account (drives the demo banner + badge). */
  is_demo?: boolean;
}

export interface JournalAccountSyncStatus {
  code: string;
  severity: "success" | "info" | "pending" | "warning" | "error";
  headline: string;
  detail: string;
  action: string | null;
}

export interface JournalAccountSyncImmediateResult {
  inserted_trades: number;
  touched_trading_dates: number;
}

export interface JournalAccountSyncQueuedResult {
  status: string;
  task_id?: string | null;
  mode?: "verify" | "sync";
  retry_after_seconds?: number | null;
  message?: string | null;
}

export type JournalAccountSyncResult =
  | JournalAccountSyncImmediateResult
  | JournalAccountSyncQueuedResult;

export interface JournalAnalyticsCalendarDay {
  date: string;
  trade_count: number;
  total_pnl: number;
  win_count: number;
  loss_count: number;
  outcome: "win" | "loss" | "breakeven" | "no_trades";
  has_journal_activity?: boolean;
}

export interface JournalAnalyticsCalendarResponse {
  month: string;
  days: JournalAnalyticsCalendarDay[];
}

export interface JournalAnalyticsSummaryResponse {
  total_trades: number;
  win_rate: number;
  profit_factor: number | null;
  avg_win: number;
  avg_loss: number;
  avg_trade_duration_seconds: number;
  total_net_pnl: number;
  starting_balance: number;
  max_drawdown: number;
}

export interface JournalDayNote {
  trading_date: string;
  note_html: string | null;
  note_updated_at: string | null;
}

export interface JournalAnalyticsEvaluationResponse {
  total_trades: number;
  avg_profit_per_trading_day: number;
  biggest_winner: number;
  biggest_loser: number;
  total_fees: number;
  avg_hold_seconds: number;
  winrate_wo_be: number;
  roi: number;
  max_drawdown_pct: number;
  winning_days: number;
  losing_days: number;
  trades_per_day: number;
  trades_per_week: number;
  /** Most recent trade outcomes oldest→newest: "W" | "L" | "B". */
  recent_streak: string[];
}

export interface JournalAnalyticsInstrumentItem {
  symbol: string;
  trade_count: number;
  total_pnl: number;
  win_rate: number;
  avg_pnl: number;
  avg_mfe?: number | null;
  avg_mae?: number | null;
}

export interface JournalAnalyticsInstrumentsResponse {
  instruments: JournalAnalyticsInstrumentItem[];
}

export interface JournalAnalyticsTimePerformancePoint {
  bucket: string;
  trade_count: number;
  total_pnl: number;
  win_rate: number;
  avg_pnl: number;
}

export interface JournalAnalyticsTimePerformanceResponse {
  hourly: JournalAnalyticsTimePerformancePoint[];
  daily: JournalAnalyticsTimePerformancePoint[];
}

export interface JournalMonthHeaderStats {
  trades: number;
  wins: number;
  profits: number;
  percent: number;
}

export type JournalWidgetId =
  | "toolbar"
  | "kpiStrip"
  | "calendar"
  | "tradesPanel"
  | "symbols"
  | "timePerformance";

export interface JournalWidgetConfig {
  id: JournalWidgetId;
  order: number;
  visible: boolean;
}

export interface JournalTradesPanelRow {
  id: string;
  closeDate: string;
  symbol: string;
  netPnl: number;
  holdTime: string;
}

export interface JournalOpenPosition {
  position_id: string;
  symbol: string;
  side: "buy" | "sell";
  volume: number;
  floating_profit: number;
  opened_at: string | null;
  open_price: number;
  current_price: number;
  sl?: number | null;
  tp?: number | null;
  magic?: number | null;
  comment?: string | null;
}

export interface JournalOpenPositionListResponse {
  as_of: string | null;
  items: JournalOpenPosition[];
}

export interface JournalOpenPositionsPanelRow {
  id: string;
  openDate: string;
  symbol: string;
  floatingPnl: number;
}

export type JournalMessageType =
  | "text"
  | "voice"
  | "image"
  | "system"
  | "prompt"
  | "ai_response";

export interface JournalAttachment {
  id: string;
  storage_path: string;
  media_type: string;
  mime_type: string;
  original_filename: string | null;
  caption: string | null;
  signed_url: string;
  signed_url_expires_at: string;
}

export interface JournalMessage {
  id: string;
  daily_journal_id: string | null;
  trade_journal_id: string | null;
  author_id?: string | null;
  message_type: JournalMessageType;
  content: string | null;
  tags: string[];
  system_data?: Record<string, unknown> | null;
  audio_storage_path?: string | null;
  audio_duration_seconds?: number | null;
  audio_url?: string | null;
  audio_url_expires_at?: string | null;
  attachments: JournalAttachment[];
  is_edited?: boolean;
  edited_at?: string | null;
  created_at: string;
  status?: "sending" | "success" | "error";
}

export interface JournalCreateMessagePayload {
  content?: string;
  file?: File;
  messageType?: JournalMessageType;
}

export interface JournalDailyTradeChip {
  trade_id: string;
  symbol: string;
  direction: "buy" | "sell";
  net_profit: number;
  outcome: "win" | "loss" | "breakeven";
  journal_message_count: number;
}

export interface JournalDailyResponse {
  id: string;
  trading_date: string;
  account_timezone: string;
  /** Broker account currency (ISO-4217, e.g. "USD", "NGN") for money formatting. */
  account_currency: string;
  reviewed_at?: string | null;
  day_start_balance: number | null;
  day_end_balance: number | null;
  trade_chips: JournalDailyTradeChip[];
  trades: JournalTrade[];
  messages: JournalMessage[];
}

export interface JournalTrade {
  id: string;
  account_id: string;
  symbol: string;
  direction: "buy" | "sell";
  open_price: number | string;
  close_price: number | string;
  volume: number;
  commission: number;
  net_profit: number;
  opened_at: string;
  closed_at: string;
  trading_date: string;
  balance_before_trade?: number | string | null;
  net_roi_percent?: number | string | null;
  trade_reviewed_at?: string | null;
  rating?: number;
  execution_quality?: number;
  setup_quality?: number;
  discipline_score?: number;
  sl?: number;
  tp?: number;
  swap?: number;
  setup?: string | null;
  duration_seconds?: number;
  session?: string;
  mfe?: number | string | null;
  mae?: number | string | null;
  r_multiple?: number | null;
}

export interface TradeNote {
  trade_id: string;
  note_html: string | null;
  note_updated_at: string | null;
}

export interface Setup {
  id: string;
  name: string;
  position: number;
}

export interface JournalAdjacentTradedDatesResponse {
  prev_date: string | null;
  next_date: string | null;
}

export interface JournalReviewedAtResponse {
  reviewed_at: string;
}

export interface JournalTradeListResponse {
  items: JournalTrade[];
  next_cursor: string | null;
}

export interface JournalAnalyticsDashboardResponse {
  summary: JournalAnalyticsSummaryResponse;
  calendar: JournalAnalyticsCalendarResponse;
  instruments: JournalAnalyticsInstrumentsResponse;
  time_performance: JournalAnalyticsTimePerformanceResponse;
  recent_trades: JournalTradeListResponse;
}

export interface Tag {
  id: string;
  group_id: string;
  name: string;
  position: number;
  is_system: boolean;
}

export interface TagGroup {
  id: string;
  name: string;
  color?: string | null;
  position: number;
  is_system: boolean;
  tags: Tag[];
}

export interface CSVPreviewAccountMeta {
  account_number: string | null;
  currency: string | null;
  broker_server: string | null;
  account_type: "demo" | "live" | null;
  broker_name: string | null;
  starting_balance: number | null;
  current_balance: number | null;
}

export interface CSVPreviewTrade {
  broker_trade_id: string;
  symbol: string;
  direction: "buy" | "sell";
  opened_at: string;
  closed_at: string;
  open_price: number;
  close_price: number;
  volume: number;
  profit: number;
  commission: number;
  swap: number;
  sl: number | null;
  tp: number | null;
}

export interface CSVParseError {
  row_number: number;
  column: string | null;
  message: string;
  severity: "error" | "warning";
}

export interface CSVPreviewResponse {
  account_meta: CSVPreviewAccountMeta;
  trades: CSVPreviewTrade[];
  trade_count: number;
  errors: CSVParseError[];
  warnings: string[];
  summary: {
    date_range: { from: string; to: string } | null;
    total_profit: number;
    total_trades: number;
    symbols: string[];
  };
}

export interface CSVConfirmResult {
  account: JournalAccount;
  inserted: number;
  skipped: number;
  touched_dates: number;
}

export interface PlatformInfo {
  id: string;
  name: string;
  description: string;
  supported_extensions: string[];
  export_instructions: string;
  max_file_size_mb: number;
}



// ============================================================================
// Unified Curve Types (Phase 2)
// ============================================================================

export interface CurveDailyPoint {
  date: string; // YYYY-MM-DD
  daily_pnl: number | null; // P&L on this day alone (null for the $0 baseline)
  cumulative_pnl: number; // cumulative from start of range
  is_baseline?: boolean; // true for the synthetic $0 baseline (first day - 1)
}

export interface CurveDailyResponse {
  points: CurveDailyPoint[];
}

export interface CurveIntradayPoint {
  i: number; // sequence index (0, 1, 2, ...)
  t: string; // account-local close time (ISO) — for plotting by real time
  symbol?: string | null; // closing trade's symbol (null at the baseline)
  cumulative_pnl: number; // cumulative within the day at this trade
}

export interface CurveIntradayDay {
  date: string; // YYYY-MM-DD
  net_pnl: number; // total net P&L for the day
  trades_count: number; // number of trades
  gross_pnl: number; // sum of gross profit (before commission/swap)
  win_count: number; // trades with net P&L > 0
  loss_count: number; // trades with net P&L < 0
  commissions: number; // sum of commission
  win_rate: number; // win_count / trades_count * 100
  volume: number; // sum of trade volume (lots)
  profit_factor: number | null; // gross wins / |gross losses|; null if no losses
  points: CurveIntradayPoint[]; // zero-baselined (i=0, cumulative_pnl=0.0 prepended)
}

export interface CurveIntradayResponse {
  days: CurveIntradayDay[];
}

export interface CurveResponse {
  daily_curve?: CurveDailyResponse | null;
  intraday_curve?: CurveIntradayResponse | null;
}
