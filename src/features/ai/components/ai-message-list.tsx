"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StreamingMessage } from "../types";

interface AiMessageListProps {
  messages: StreamingMessage[];
  streamingTool: string | null;
}

function ToolIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary py-1">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
      Analyzing: {name}…
    </div>
  );
}

function MessageBubble({ msg }: { msg: StreamingMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand mt-0.5">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-brand text-white rounded-tr-sm"
            : "bg-card-bg border border-border-secondary/50 text-text-primary rounded-tl-sm",
        )}
      >
        {(msg.content ?? "")
          .split("\n")
          .map((line, i) => (
            <span key={i}>
              {line}
              {i < (msg.content ?? "").split("\n").length - 1 && <br />}
            </span>
          ))}
        {msg.isStreaming && (
          <span className="inline-block h-3.5 w-0.5 ml-0.5 bg-current animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

export function AiMessageList({ messages, streamingTool }: AiMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingTool]);

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}
      {streamingTool && <ToolIndicator name={streamingTool} />}
      <div ref={bottomRef} />
    </div>
  );
}
