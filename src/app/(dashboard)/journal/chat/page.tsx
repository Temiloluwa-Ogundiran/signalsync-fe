"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Mic,
  SendHorizontal,
  Square,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCreateJournalDayMessage,
  useCreateJournalTradeMessage,
  useJournalDay,
  useTradeJournalMessages,
} from "@/features/journal/hooks/use-journal-day-modal";
import type { JournalMessage } from "@/features/journal/types";

type ChatContext = "day" | "trade";

function JournalChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountId = searchParams.get("accountId") ?? undefined;
  const tradingDate = searchParams.get("date") ?? undefined;
  const tradeId = searchParams.get("tradeId") ?? undefined;
  const initialContext =
    (searchParams.get("context") as ChatContext | null) ?? "day";

  const [chatContext, setChatContext] = useState<ChatContext>(initialContext);
  const [draftMessage, setDraftMessage] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);

  const dayQuery = useJournalDay(
    accountId,
    tradingDate,
    !!accountId && !!tradingDate,
  );
  const tradeMessagesQuery = useTradeJournalMessages(
    tradeId,
    chatContext === "trade" && !!tradeId,
  );

  const createDayMessage = useCreateJournalDayMessage(accountId, tradingDate);
  const createTradeMessage = useCreateJournalTradeMessage(
    accountId,
    tradingDate,
  );

  const isSending = createDayMessage.isPending || createTradeMessage.isPending;

  const messages = useMemo<JournalMessage[]>(() => {
    if (chatContext === "trade") {
      return [...(tradeMessagesQuery.data ?? [])].sort((a, b) =>
        a.created_at.localeCompare(b.created_at),
      );
    }

    return [...(dayQuery.data?.messages ?? [])].sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    );
  }, [chatContext, dayQuery.data?.messages, tradeMessagesQuery.data]);

  const dayLabel = useMemo(() => {
    if (!tradingDate) return "Day Chat";
    const date = new Date(`${tradingDate}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [tradingDate]);

  const clearComposer = () => {
    setDraftMessage("");
    setPendingFile(null);
  };

  const sendMessage = async (payload: {
    content?: string;
    file?: File;
    messageType?: "text" | "image" | "voice";
  }) => {
    if (chatContext === "day") {
      if (!dayQuery.data?.id) return;
      await createDayMessage.mutateAsync({
        dailyJournalId: dayQuery.data.id,
        payload,
      });
      return;
    }

    if (!tradeId) return;
    await createTradeMessage.mutateAsync({
      tradeId,
      payload,
    });
  };

  const onSendComposer = async () => {
    const content = draftMessage.trim();
    if (!content && !pendingFile) return;

    await sendMessage({
      content: content || undefined,
      file: pendingFile || undefined,
    });

    clearComposer();
  };

  const onStartRecording = async () => {
    if (isRecording) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordingStreamRef.current = stream;

    const recorder = new MediaRecorder(stream);
    recordingChunksRef.current = [];

    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        recordingChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(recordingChunksRef.current, { type: "audio/webm" });
      const file = new File([blob], `voice-note-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      if (recordingStreamRef.current) {
        for (const track of recordingStreamRef.current.getTracks()) {
          track.stop();
        }
      }

      setIsRecording(false);
      await sendMessage({ file, messageType: "voice" });
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const onStopRecording = () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "inactive"
    ) {
      return;
    }
    mediaRecorderRef.current.stop();
  };

  if (!accountId || !tradingDate) {
    return (
      <div className="p-6 text-sm text-text-secondary">
        Missing chat context. Open chat from the journal day modal.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4.5rem)] p-4 md:p-6">
      <div className="mx-auto flex h-full max-w-5xl flex-col rounded-2xl border border-border-primary bg-card-bg">
        <div className="flex items-center justify-between border-b border-border-primary px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-primary text-text-secondary hover:text-text-primary"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">
                Journal Chat
              </h1>
              <p className="text-xs text-text-tertiary">{dayLabel}</p>
            </div>
          </div>

          <div className="inline-flex rounded-lg border border-border-primary bg-bg-tertiary/30 p-1">
            <button
              onClick={() => setChatContext("day")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                chatContext === "day"
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-bg-tertiary"
              }`}
            >
              Day Chat
            </button>
            <button
              onClick={() => tradeId && setChatContext("trade")}
              disabled={!tradeId}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                chatContext === "trade"
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-bg-tertiary"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Trade Chat
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-bg-tertiary/10">
          {dayQuery.isLoading ||
          (chatContext === "trade" && tradeMessagesQuery.isLoading) ? (
            <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading messages...
            </div>
          ) : messages.length ? (
            messages.map((message) => {
              const isSystem = message.message_type === "system";

              return (
                <div
                  key={message.id}
                  className={isSystem ? "text-center" : "flex justify-end"}
                >
                  <div
                    className={
                      isSystem
                        ? "inline-block rounded-full bg-bg-tertiary px-3 py-1 text-xs text-text-tertiary"
                        : "max-w-[80%] rounded-2xl bg-accent px-3 py-2 text-white"
                    }
                  >
                    {message.attachments?.length ? (
                      <div className="mb-1 space-y-2">
                        {message.attachments.map((attachment) => (
                          <img
                            key={attachment.id}
                            src={attachment.signed_url}
                            alt={
                              attachment.original_filename || "journal image"
                            }
                            className="max-h-64 w-full rounded-lg object-cover"
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

                    {message.content ? (
                      <p className="text-sm leading-snug">{message.content}</p>
                    ) : null}

                    {!isSystem ? (
                      <p className="mt-1 text-[10px] text-white/80 text-right">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-text-tertiary">
              {chatContext === "day"
                ? "No messages yet. Start your day journal."
                : "No trade messages yet. Record or send the first note."}
            </p>
          )}
        </div>

        <div className="border-t border-border-primary p-3">
          {pendingFile ? (
            <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-bg-tertiary px-2 py-1 text-xs text-text-secondary">
              {pendingFile.name}
              <button
                onClick={() => setPendingFile(null)}
                className="text-text-tertiary hover:text-text-primary"
              >
                remove
              </button>
            </div>
          ) : null}

          <div className="flex items-end gap-2">
            <textarea
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              rows={2}
              placeholder={
                chatContext === "day"
                  ? "How'd the day go..."
                  : "Type something..."
              }
              className="flex-1 resize-none rounded-md border border-border-primary bg-bg-tertiary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
            />

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setPendingFile(file);
              }}
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-primary text-text-secondary hover:text-accent"
              title="Attach image"
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            <button
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={isSending}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${
                isRecording
                  ? "border-danger text-danger"
                  : "border-border-primary text-text-secondary hover:text-accent"
              }`}
              title={isRecording ? "Stop recording" : "Record voice note"}
            >
              {isRecording ? (
                <Square className="h-3.5 w-3.5" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={onSendComposer}
              disabled={
                isSending ||
                (chatContext === "trade" && !tradeId) ||
                (!draftMessage.trim() && !pendingFile)
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent text-white disabled:opacity-50"
              title="Send"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JournalChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center p-4 md:p-6">
          <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading chat...
          </div>
        </div>
      }
    >
      <JournalChatContent />
    </Suspense>
  );
}
