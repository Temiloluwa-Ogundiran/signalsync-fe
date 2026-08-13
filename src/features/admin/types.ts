export type PlatformRole = "user" | "admin" | "technical_admin" | "super_admin";

export interface AdminOverview {
  totals: Record<string, number>;
  signups: Array<{ date: string; count: number }>;
  funnel: Array<{ stage: string; sessions: number }>;
  product: { sessions: number; bounced_sessions: number; bounce_rate: number };
}

export interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  platform_role: PlatformRole;
  is_email_verified: boolean;
  is_suspended: boolean;
  onboarding_completed: boolean;
  trading_account_count: number;
  copy_account_count: number;
  last_active_at: string | null;
  created_at: string;
}

export interface AdminUserDetail extends AdminUser {
  auth_provider: string;
  suspended_at: string | null;
  suspension_reason: string | null;
  active_sessions: number;
  trading_accounts: Array<Record<string, string | null>>;
  copy_accounts: Array<Record<string, string | boolean | null>>;
}

export interface AdminUserPage { items: AdminUser[]; next_cursor: string | null }
export interface AdminSystem {
  status: string;
  components: Array<{
    name: string;
    status: string;
    heartbeat_age_seconds: number;
    stream_lag: number;
    pending: number;
    last_error: string | null;
  }>;
  copy_latency: { samples: number; p50_ms: number | null; p95_ms: number | null; over_2s: number };
  grafana_url: string | null;
}
export interface AuditPage {
  items: Array<{
    id: string;
    actor_email: string;
    target_email: string | null;
    action: string;
    reason: string | null;
    created_at: string;
  }>;
  next_cursor: string | null;
}

export interface AdminAffiliateSettings {
  default_commission_rate: string;
  commission_hold_days: number;
  recurring_months: number;
  minimum_payout: string;
  custom_rate_users: number;
}

export interface AdminAffiliate {
  user_id: string;
  email: string;
  display_name: string | null;
  code: string;
  status: string;
  commission_rate_override: string | null;
  effective_commission_rate: string;
  referrals: number;
  created_at: string;
}

export interface AdminAffiliatePage { items: AdminAffiliate[]; }
