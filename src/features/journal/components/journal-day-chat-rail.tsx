"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Image as ImageIcon,
  Loader2,
  Mic,
  Paperclip,
  SendHorizontal,
  Square,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { DropdownMenu, ContextMenu } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ChatRailProps } from "./journal-day-chat.types";
import type { JournalAttachment } from "@/features/journal/types";
import { JournalVoiceMessagePlayer } from "./journal-voice-message-player";

function isImageAttachment(attachment: JournalAttachment): boolean {
  const mime = attachment.mime_type?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return true;
  const media = attachment.media_type?.toLowerCase() ?? "";
  return media.startsWith("image/");
}

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
  onPickFile,
  onRecordToggle,
  onSend,
  onPromptClick,
  onContextChange,
  onRemoveFile,
  onPasteFile,
  onEditMessage,
  onDeleteMessage,
  onCancelSending,
  resolvedBlobUrls,
  title = "Journal Your Day",
  subtitle = "Review your trades with text, image, and voice notes.",
  composerPlaceholder = "How did your day go...",
}: ChatRailProps) {
  void prompts;
  void hasTrade;
  void onPromptClick;
  void onContextChange;

  const [attachmentPreview, setAttachmentPreview] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
    null,
  );
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleStartEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditText(content);
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editText.trim()) return;
    if (onEditMessage) {
      await onEditMessage(messageId, editText.trim());
    }
    setEditingMessageId(null);
  };

  const handleDelete = async (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      if (onDeleteMessage) {
        await onDeleteMessage(messageId);
      }
    }
  };

  useEffect(() => {
    /* Object URL lifecycle: create/revoke in effect for Strict Mode correctness. */
    /* eslint-disable react-hooks/set-state-in-effect -- blob preview URL sync */
    if (!pendingFile || !pendingFile.type.startsWith("image/")) {
      setPendingPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPendingPreviewUrl(url);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  const canSend = Boolean(draftMessage.trim() || pendingFile);

  return (
    <Card className="flex h-[calc(100vh-12rem)] min-h-176 flex-col rounded-2xl border-l border-border-secondary bg-card-bg">
      <Dialog
        open={!!attachmentPreview}
        onOpenChange={(open) => {
          if (!open) setAttachmentPreview(null);
        }}
      >
        <DialogContent
          overlayClassName="bg-black/80 supports-backdrop-filter:backdrop-blur-xs"
          showCloseButton
          className="max-h-[min(92vh,900px)] max-w-[min(96vw,1200px)] gap-0 border-0 bg-transparent p-2 shadow-none ring-0 sm:max-w-[min(96vw,1200px)] [&>button]:text-white [&>button]:hover:bg-white/10"
        >
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          {attachmentPreview ? (
            <img
              src={attachmentPreview.src}
              alt={attachmentPreview.alt}
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="border-b border-border-secondary p-4">
        <p className="font-heading text-xl text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary">{subtitle}</p>
      </div>

      <div ref={containerRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading messages...
          </div>
        ) : messages.length ? (
          messages.map((message) => {
            const isSystem = message.message_type === "system";
            const systemBubbleClass =
              "inline-block rounded-full bg-bg-tertiary px-3 py-1 text-xs text-text-tertiary";
            const textBubbleClass =
              "w-fit max-w-full rounded-[2.75rem] bg-bg-tertiary px-6 py-5 text-sm text-text-primary";

            if (isSystem) {
              return (
                <div key={message.id} className="text-center">
                  <div className={systemBubbleClass}>
                    {message.attachments?.length ? (
                      <div className="mb-2 space-y-2">
                        {message.attachments.map((attachment) => {
                          const alt =
                            attachment.original_filename ||
                            "journal attachment";
                          if (isImageAttachment(attachment)) {
                            return (
                              <button
                                key={attachment.id}
                                type="button"
                                className="block w-full cursor-pointer rounded-xl border-0 bg-transparent p-0 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                aria-label="View image"
                                onClick={() =>
                                  setAttachmentPreview({
                                    src: attachment.signed_url,
                                    alt,
                                  })
                                }
                              >
                                <img
                                  src={attachment.signed_url}
                                  alt={alt}
                                  className="max-h-64 w-full rounded-xl object-cover"
                                  onLoad={scrollToBottom}
                                />
                              </button>
                            );
                          }
                          return (
                            <img
                              key={attachment.id}
                              src={attachment.signed_url}
                              alt={alt}
                              className="max-h-64 w-full rounded-xl object-cover"
                              onLoad={scrollToBottom}
                            />
                          );
                        })}
                      </div>
                    ) : null}
                    {message.audio_url ? (
                      <div className="max-w-full">
                        <JournalVoiceMessagePlayer
                          key={message.id}
                          messageId={message.id}
                          audioUrl={message.audio_url}
                        />
                      </div>
                    ) : null}
                    {message.content ? <p>{message.content}</p> : null}
                  </div>
                </div>
              );
            }

            const trimmedText = message.content?.trim() ?? "";

            return (
              <ContextMenu.Root key={message.id}>
                <ContextMenu.Trigger disabled={isSystem || !!editingMessageId}>
                  <div className="group/msg relative flex items-center gap-2 w-full pr-8 py-1 rounded-xl hover:bg-bg-tertiary/10 transition-all">
                    {/* Unified Content Block: w-fit max-w-[90%] */}
                    <div className="flex flex-col gap-2 w-fit max-w-[90%]">
                      {/* Attachments */}
                      {message.attachments?.length ? (
                        <div className="space-y-2 w-fit max-w-full">
                          {message.attachments.map((attachment) => {
                            const alt =
                              attachment.original_filename ||
                              "journal attachment";
                            if (isImageAttachment(attachment)) {
                              const isSending = message.status === "sending";
                              const isSuccess = message.status === "success";
                              const showOverlay = isSending || isSuccess;
                              const imageUrl =
                                resolvedBlobUrls?.[message.id] ||
                                attachment.signed_url;
                              return (
                                <div
                                  key={attachment.id}
                                  className="relative w-fit max-w-full overflow-hidden rounded-xl"
                                >
                                  <button
                                    type="button"
                                    className="block w-fit max-w-full cursor-pointer rounded-xl border-0 bg-transparent p-0 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                    aria-label="View image"
                                    disabled={isSending}
                                    onClick={() =>
                                      setAttachmentPreview({
                                        src: imageUrl,
                                        alt,
                                      })
                                    }
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={alt}
                                      className="max-h-64 w-full rounded-xl object-cover"
                                      onLoad={scrollToBottom}
                                    />
                                  </button>

                                  {/* Blurred Sending overlay */}
                                  {showOverlay && (
                                    <div
                                      className={`absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-[1.5px] transition-all duration-500 ease-out ${
                                        isSuccess
                                          ? "opacity-0 scale-95 pointer-events-none"
                                          : "opacity-100 scale-100"
                                      }`}
                                    >
                                      <div className="relative flex items-center justify-center">
                                        <Loader2 className="h-10 w-10 animate-spin text-white" />
                                        {isSending && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              onCancelSending?.(message.id);
                                            }}
                                            className="absolute h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border-0 cursor-pointer focus:outline-none"
                                            title="Cancel upload"
                                          >
                                            <span className="text-[11px] font-bold">
                                              ✕
                                            </span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return (
                              <img
                                key={attachment.id}
                                src={attachment.signed_url}
                                alt={alt}
                                className="max-h-64 w-full rounded-xl object-cover"
                                onLoad={scrollToBottom}
                              />
                            );
                          })}
                        </div>
                      ) : null}

                      {/* Audio URL */}
                      {message.audio_url ? (
                        <div className="max-w-full w-fit">
                          {message.status === "sending" ||
                          message.status === "success" ? (
                            <div
                              className={`relative w-fit max-w-[min(100%,20.75rem)] transition-all duration-500 ${
                                message.status === "success"
                                  ? "opacity-100"
                                  : "opacity-60"
                              }`}
                            >
                              <JournalVoiceMessagePlayer
                                messageId={message.id}
                                audioUrl={
                                  resolvedBlobUrls?.[message.id] ||
                                  message.audio_url ||
                                  ""
                                }
                              />
                              <div
                                className={`absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white transition-all duration-500 ease-out ${
                                  message.status === "success"
                                    ? "opacity-0 scale-95 pointer-events-none"
                                    : "opacity-100 scale-100"
                                }`}
                              >
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Sending...</span>
                                {message.status === "sending" && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      onCancelSending?.(message.id);
                                    }}
                                    className="ml-1 cursor-pointer font-bold text-red-400 hover:text-red-300 pointer-events-auto"
                                    title="Cancel upload"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <JournalVoiceMessagePlayer
                              key={message.id}
                              messageId={message.id}
                              audioUrl={
                                resolvedBlobUrls?.[message.id] ||
                                message.audio_url ||
                                ""
                              }
                            />
                          )}
                        </div>
                      ) : null}

                      {/* Inline Text Editor */}
                      {editingMessageId === message.id ? (
                        <div className="flex flex-col gap-2 w-full rounded-2xl bg-bg-tertiary px-6 py-5 border border-border-primary/45 shadow-inner">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-12 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-sm text-text-primary placeholder:text-text-tertiary resize-none"
                            autoFocus
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                void handleSaveEdit(message.id);
                              }
                              if (event.key === "Escape") {
                                setEditingMessageId(null);
                              }
                            }}
                          />
                          <div className="flex justify-end gap-2 text-xs">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 cursor-pointer text-text-secondary hover:text-text-primary rounded-lg"
                              onClick={() => setEditingMessageId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-3 bg-brand text-brand-foreground hover:bg-brand-hover cursor-pointer rounded-lg font-bold"
                              onClick={() => handleSaveEdit(message.id)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : trimmedText ? (
                        <div className="flex flex-col gap-1 w-fit max-w-full">
                          <div className={textBubbleClass}>
                            <p>{trimmedText}</p>
                          </div>

                          {/* Sending status below bubble */}
                          {(message.status === "sending" ||
                            message.status === "success") && (
                            <span
                              className={`text-[10px] text-text-tertiary flex items-center gap-1 pl-3 transition-all duration-500 ease-out ${
                                message.status === "success"
                                  ? "opacity-0 translate-y-1 pointer-events-none"
                                  : "opacity-60 translate-y-0"
                              }`}
                            >
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                              Sending...
                              {message.status === "sending" && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onCancelSending?.(message.id);
                                  }}
                                  className="ml-1 cursor-pointer font-bold text-red-400 hover:text-red-300"
                                  title="Cancel upload"
                                >
                                  ✕
                                </button>
                              )}
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Hover Action Dropdown Menu: sits immediately next to the Content Block */}
                    {!isSystem &&
                      !editingMessageId &&
                      message.status !== "sending" &&
                      message.status !== "success" && (
                        <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity shrink-0">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-full border border-border-primary/40 bg-bg-secondary text-text-secondary hover:text-text-primary shadow-xs cursor-pointer flex items-center justify-center animate-in fade-in zoom-in-95 duration-150"
                                title="Message actions"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="z-50 min-w-[7.5rem] overflow-hidden rounded-lg border border-border-primary bg-bg-secondary p-1 text-text-primary shadow-md"
                                align="start"
                                sideOffset={4}
                              >
                                <DropdownMenu.Item
                                  onClick={() =>
                                    handleStartEdit(message.id, trimmedText)
                                  }
                                  disabled={!trimmedText}
                                  className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold outline-none hover:bg-bg-tertiary focus:bg-bg-tertiary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                  <span className="ml-2">Edit</span>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  onClick={() => handleDelete(message.id)}
                                  className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-danger outline-none hover:bg-danger/10 hover:text-danger focus:bg-danger/10 focus:text-danger transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="ml-2">Delete</span>
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </div>
                      )}
                  </div>
                </ContextMenu.Trigger>
                <ContextMenu.Portal>
                  <ContextMenu.Content
                    className="z-50 min-w-[7.5rem] overflow-hidden rounded-lg border border-border-primary bg-bg-secondary p-1 text-text-primary shadow-md"
                    alignOffset={4}
                  >
                    <ContextMenu.Item
                      onClick={() => handleStartEdit(message.id, trimmedText)}
                      disabled={!trimmedText}
                      className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold outline-none hover:bg-bg-tertiary focus:bg-bg-tertiary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span className="ml-2">Edit</span>
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      onClick={() => handleDelete(message.id)}
                      className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-danger outline-none hover:bg-danger/10 hover:text-danger focus:bg-danger/10 focus:text-danger transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="ml-2">Delete</span>
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Portal>
              </ContextMenu.Root>
            );
          })
        ) : (
          <p className="text-sm text-text-tertiary">
            {chatContext === "day"
              ? "No messages yet. Start your day journal."
              : "No trade messages yet. Open a trade and send the first note."}
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border-secondary p-4">
        {/* <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
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
        </div> */}

        {pendingFile ? (
          <div className="mb-2 flex flex-wrap items-center gap-3 rounded-xl bg-bg-tertiary p-2 text-xs text-text-secondary">
            {pendingPreviewUrl && pendingFile.type.startsWith("image/") ? (
              <button
                type="button"
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-0 p-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                aria-label="Preview attached image"
                onClick={() =>
                  setAttachmentPreview({
                    src: pendingPreviewUrl,
                    alt: pendingFile.name || "Attached image",
                  })
                }
              >
                <img
                  src={pendingPreviewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  onLoad={scrollToBottom}
                />
              </button>
            ) : null}
            <span className="min-w-0 flex-1 truncate">{pendingFile.name}</span>
            <button
              type="button"
              onClick={onRemoveFile}
              className="shrink-0 text-text-tertiary hover:text-text-primary"
            >
              remove
            </button>
          </div>
        ) : null}

        <div className="flex items-end gap-2 rounded-full bg-bg-tertiary p-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full cursor-pointer text-text-secondary hover:text-text-primary"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[9.5rem] overflow-hidden rounded-lg border border-border-primary bg-bg-secondary p-1 text-text-primary shadow-md"
                align="start"
                sideOffset={8}
              >
                <DropdownMenu.Item
                  onClick={() => onPickFile("image")}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold outline-none hover:bg-bg-tertiary focus:bg-bg-tertiary transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span className="ml-2">Photo</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => onPickFile("audio")}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold outline-none hover:bg-bg-tertiary focus:bg-bg-tertiary transition-colors"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span className="ml-2">Audio File</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <Textarea
            value={draftMessage}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey) return;
              event.preventDefault();
              if (!canSend || isRecording) return;
              onSend();
            }}
            onPaste={(event) => {
              if (!onPasteFile) return;
              const items = event.clipboardData?.items;
              if (!items) return;
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.startsWith("image/")) {
                  const file = item.getAsFile();
                  if (file) {
                    onPasteFile(file);
                    event.preventDefault();
                    break;
                  }
                }
              }
            }}
            rows={1}
            placeholder={composerPlaceholder}
            className="min-h-10 border-0 bg-transparent py-2 shadow-none focus-visible:ring-0"
          />

          {isRecording ? (
            <Button
              size="icon"
              className="rounded-full hover:cursor-pointer bg-bg-tertiary text-text-primary hover:bg-accent-hover"
              onClick={onRecordToggle}
              title="Stop recording"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : canSend ? (
            <Button
              size="icon"
              className="rounded-full hover:cursor-pointer bg-primary text-primary-foreground"
              onClick={onSend}
              title="Send message"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="rounded-full hover:cursor-pointer bg-bg-tertiary text-text-primary hover:bg-accent-hover"
              onClick={onRecordToggle}
              title="Record voice note"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
