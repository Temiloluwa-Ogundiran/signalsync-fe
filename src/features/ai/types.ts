export type MessageRole = "user" | "assistant";

export interface AiMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string | null;
  created_at: string;
}

export interface AiSession {
  id: string;
  user_id: string;
  account_id: string | null;
  title: string | null;
  context_type: string;
  context_ref: string | null;
  is_deleted: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiSessionWithMessages extends AiSession {
  messages: AiMessage[];
}

export interface AiSessionListResponse {
  items: AiSession[];
  next_cursor: string | null;
}

export interface StreamingMessage extends AiMessage {
  isStreaming?: boolean;
}

export interface AiContext {
  /** Human-readable breadcrumb shown in the greeting, e.g. "Day Journal · 2026-06-23". */
  source: string;
  accountId?: string;
  /**
   * Server-side context scope. When set, the dock resolves a reuse-or-create
   * session for this (contextType, contextRef) instead of a generic chat, so
   * the coach's analysis is scoped to that day/trade.
   */
  contextType?: string;
  contextRef?: string;
  /**
   * When set, the dock auto-sends this as the first user message once the
   * scoped session is empty — so the coach starts the conversation.
   */
  seedMessage?: string;
}

export interface TradeReview {
  trade_id: string;
  review: string;
  insight: string;
  cached: boolean;
}

export type SSEEvent =
  | { type: "token"; v: string }
  | { type: "tool"; name: string }
  | { type: "done"; message_id: string }
  | { type: "error"; detail: string };

export interface CoachRead {
  trading_date: string;
  read: string;
  insight: string;
  cached: boolean;
}

export interface AiUsage {
  credits_used: number;
  credits_limit: number;
  credits_remaining: number;
  period_month: string;
  message_count: number;
}
