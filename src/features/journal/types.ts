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
  status: "pending_sync" | "synced" | "error" | "disconnected";
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
  next_sync_not_before: string | null;
  // Backend serializes the Decimal as a string ("583.61"); may also be a number.
  latest_balance: string | number | null;
  latest_equity: number | null;
  is_deleted: boolean;
  sync_provider?: string;
  created_at: string;
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
  profit_factor: number;
  avg_win: number;
  avg_loss: number;
  avg_trade_duration_seconds: number;
  total_net_pnl: number;
  starting_balance: number;
  max_drawdown: number;
}

export interface JournalAnalyticsEquityCurvePoint {
  date: string;
  cumulative_pnl: number;
  daily_pnl: number;
}

export interface JournalAnalyticsEquityCurveResponse {
  points: JournalAnalyticsEquityCurvePoint[];
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
  is_manual?: boolean;
  is_missed?: boolean;
}

export interface JournalDailyResponse {
  id: string;
  trading_date: string;
  account_timezone: string;
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
  is_manual?: boolean;
  is_missed?: boolean;
  sl?: number;
  tp?: number;
  swap?: number;
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

export interface TagOption {
  id: string;
  category_id: string;
  value: string;
  color?: string | null;
}

export interface TagCategory {
  id: string;
  title: string;
  is_system: boolean;
  options: TagOption[];
}

export interface ManualTradeCreatePayload {
  is_missed: boolean;
  symbol: string;
  direction: "buy" | "sell";
  opened_at: string; // ISO string
  open_price: number;
  volume?: number;
  closed_at?: string; // ISO string
  close_price?: number;
  net_profit?: number;
  commission?: number;
  swap?: number;
  sl?: number;
  tp?: number;
}

export type ManualTradeUpdatePayload = Partial<ManualTradeCreatePayload>;

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

