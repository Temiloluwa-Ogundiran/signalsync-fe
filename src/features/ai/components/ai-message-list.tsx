"use client";

import { useEffect, useRef } from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AiMarkdown, parseActions, stripActions } from "./ai-markdown";
import type { StreamingMessage } from "../types";

interface AiMessageListProps {
  messages: StreamingMessage[];
  streamingTool: string | null;
  /** Send a follow-up suggestion as the next message. */
  onAction?: (prompt: string) => void;
  /** Disable follow-up buttons while a response is streaming. */
  isStreaming?: boolean;
}

function ToolIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary py-1">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
      Analyzing: {name}…
    </div>
  );
}

/** The tappable follow-up suggestions the model emits via `::actions::`. */
function FollowUpActions({
  actions,
  onAction,
  disabled,
}: {
  actions: string[];
  onAction?: (prompt: string) => void;
  disabled?: boolean;
}) {
  if (actions.length === 0 || !onAction) return null;
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {actions.map((a) => (
        <button
          key={a}
          type="button"
          disabled={disabled}
          onClick={() => onAction(a)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1",
            "text-xs font-medium text-text-primary",
            "border-border-secondary/70 bg-surface-subtle/60",
            "transition-colors hover:border-ai-accent hover:bg-ai-glow hover:text-ai-accent",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {a}
          <ArrowUpRight className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}

function MessageBubble({
  msg,
  onAction,
  isStreaming,
}: {
  msg: StreamingMessage;
  onAction?: (prompt: string) => void;
  isStreaming?: boolean;
}) {
  const isUser = msg.role === "user";
  const content = msg.content ?? "";
  // Only surface follow-up actions once the message has finished streaming —
  // a half-streamed ::actions:: line would flicker incomplete buttons.
  const actions = !isUser && !msg.isStreaming ? parseActions(content) : [];
  const body = !isUser ? stripActions(content) : content;

  return (
    <div className={cn("flex min-w-0 flex-col", isUser ? "items-end" : "items-start")}>
      <div className={cn("flex min-w-0 gap-3", isUser && "flex-row-reverse")}>
        {!isUser && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand mt-0.5">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        )}
        <div
          className={cn(
            "max-w-[85%] min-w-0 break-words overflow-hidden rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-brand text-brand-foreground rounded-tr-sm"
              : "bg-card-bg border border-border-secondary/50 text-text-primary rounded-tl-sm",
          )}
        >
          {isUser ? (
            // User messages are plain text — render verbatim (no markdown).
            <span className="whitespace-pre-wrap">{content}</span>
          ) : (
            <AiMarkdown content={body} isStreaming={msg.isStreaming} />
          )}
          {msg.isStreaming && (
            <span className="inline-block h-3.5 w-0.5 ml-0.5 bg-current animate-pulse align-middle" />
          )}
        </div>
      </div>
      {!isUser && (
        // Indent to align under the bubble (avatar 28px + gap 12px).
        <div className="pl-10">
          <FollowUpActions actions={actions} onAction={onAction} disabled={isStreaming} />
        </div>
      )}
    </div>
  );
}

export function AiMessageList({
  messages,
  streamingTool,
  onAction,
  isStreaming,
}: AiMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingTool]);

  return (
    <div className="flex min-w-0 flex-col gap-4 px-4 py-3">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          onAction={onAction}
          isStreaming={isStreaming}
        />
      ))}
      {streamingTool && <ToolIndicator name={streamingTool} />}
      <div ref={bottomRef} />
    </div>
  );
}
