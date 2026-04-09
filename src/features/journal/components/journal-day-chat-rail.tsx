"use client";
/* eslint-disable @next/next/no-img-element */

import {
  Image as ImageIcon,
  Loader2,
  Mic,
  SendHorizontal,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { ChatRailProps } from "./journal-day-chat.types";

export function JournalDayChatRail({
  messages,
  prompts,
  isLoading,
  isSending,
  chatContext,
  hasTrade,
  pendingFile,
  draftMessage,
  isRecording,
  onDraftChange,
  onPickImage,
  onRecordToggle,
  onSend,
  onPromptClick,
  onContextChange,
  onRemoveFile,
  title = "Journal Your Day",
  subtitle = "Review your trade with text, image, and voice notes.",
  composerPlaceholder = "How did your day go...",
}: ChatRailProps) {
  return (
    <Card className="flex h-[calc(100vh-12rem)] min-h-176 flex-col rounded-2xl border-l border-border-secondary bg-card-bg">
      <div className="border-b border-border-secondary p-4">
        <p className="font-heading text-xl text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary">{subtitle}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading messages...
          </div>
        ) : messages.length ? (
          messages.map((message) => {
            const isSystem = message.message_type === "system";
            const bubbleClass = isSystem
              ? "inline-block rounded-full bg-bg-tertiary px-3 py-1 text-xs text-text-tertiary"
              : "max-w-[92%] rounded-[2.75rem] bg-bg-tertiary px-6 py-5 text-sm text-text-primary";

            return (
              <div
                key={message.id}
                className={isSystem ? "text-center" : "flex justify-start"}
              >
                <div className={bubbleClass}>
                  {message.attachments?.length ? (
                    <div className="mb-2 space-y-2">
                      {message.attachments.map((attachment) => (
                        <img
                          key={attachment.id}
                          src={attachment.signed_url}
                          alt={
                            attachment.original_filename || "journal attachment"
                          }
                          className="max-h-64 w-full rounded-xl object-cover"
                        />
                      ))}
                    </div>
                  ) : null}

                  {message.audio_url ? (
                    <audio
                      controls
                      src={message.audio_url}
                      className="max-w-full"
                    />
                  ) : null}

                  {message.content ? <p>{message.content}</p> : null}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-text-tertiary">
            {chatContext === "day"
              ? "No messages yet. Start your day journal."
              : "No trade messages yet. Open a trade and send the first note."}
          </p>
        )}
      </div>

      <div className="border-t border-border-secondary p-4">
        <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {prompts.map((prompt) => (
            <Button
              key={prompt.id}
              variant="ghost"
              size="sm"
              className="rounded-full border border-border-secondary text-xs text-text-primary"
              onClick={() => onPromptClick(prompt.label)}
            >
              {prompt.label}
            </Button>
          ))}
        </div>

        {pendingFile ? (
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-bg-tertiary px-3 py-1 text-xs text-text-secondary">
            {pendingFile.name}
            <button
              onClick={onRemoveFile}
              className="text-text-tertiary hover:text-text-primary"
            >
              remove
            </button>
          </div>
        ) : null}

        <div className="flex items-end gap-2 rounded-full bg-bg-tertiary p-2">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={onPickImage}
            title="Attach image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Textarea
            value={draftMessage}
            onChange={(event) => onDraftChange(event.target.value)}
            rows={1}
            placeholder={composerPlaceholder}
            className="min-h-10 border-0 bg-transparent py-2 shadow-none focus-visible:ring-0"
          />

          <Button
            size="icon"
            className="rounded-full bg-accent text-white hover:bg-accent-hover"
            onClick={onRecordToggle}
            disabled={isSending}
            title={isRecording ? "Stop recording" : "Record voice note"}
          >
            {isRecording ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          <Button
            size="icon"
            className="rounded-full bg-primary text-primary-foreground"
            onClick={onSend}
            disabled={isSending || (!draftMessage.trim() && !pendingFile)}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
