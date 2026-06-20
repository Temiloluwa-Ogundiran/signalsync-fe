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
  source: string;
  accountId?: string;
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
