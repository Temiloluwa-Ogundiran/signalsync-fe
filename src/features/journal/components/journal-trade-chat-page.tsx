"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";
import type { JournalMessage } from "@/features/journal/types";
import {
  useCreateJournalTradeMessage,
  useJournalDayTrades,
  useMarkJournalTradeReviewed,
  useTradeJournalMessages,
  useUpdateJournalMessage,
  useDeleteJournalMessage,
} from "@/features/journal/hooks/use-journal-day-modal";
import { JournalDayChatRail } from "./journal-day-chat-rail";
import type { ChatPrompt } from "./journal-day-chat.types";
import { asNumber } from "./journal-day-modal.utils";
import { JournalTradeChatHeader } from "./journal-trade-chat-header";
import { JournalTradeChatStatsCard } from "./journal-trade-chat-stats-card";
import { JournalTradeChatTagsCard } from "./journal-trade-chat-tags-card";
import { buildTradeMetrics, formatTradeHeaderDate } from "./journal-trade-chat.utils";
import { requestSkipNextJournalDashboardAutoSync } from "@/features/journal/lib/journal-dashboard-auto-sync-skip";

import { useJournalUiStore } from "@/features/journal/store/journal-ui-store";

export function JournalTradeChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openEditTradeModal = useJournalUiStore((s) => s.openEditTradeModal);

  const accountId = useResolvedJournalAccountId();
  const tradingDate = searchParams.get("date") ?? undefined;
  const tradeId = searchParams.get("tradeId") ?? undefined;
  const fromParam = searchParams.get("from");
  const contextParam = searchParams.get("context");

  const [draftMessage, setDraftMessage] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    requestSkipNextJournalDashboardAutoSync();
  }, []);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);

  interface SendingMessage {
    id: string;
    content?: string;
    file?: File;
    previewUrl?: string;
    messageType: "text" | "image" | "voice";
    abortController: AbortController;
    status?: "sending" | "success" | "error";
  }

  const [sendingMessages, setSendingMessages] = useState<SendingMessage[]>([]);
  const [resolvedBlobUrls, setResolvedBlobUrls] = useState<Record<string, string>>({});
  const createdBlobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      createdBlobUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      });
    };
  }, []);

  const onCancelSending = useCallback((messageId: string) => {
    setSendingMessages((prev) => {
      const match = prev.find((sm) => sm.id === messageId);
      if (match) {
        match.abortController.abort();
        if (match.previewUrl) URL.revokeObjectURL(match.previewUrl);
      }
      return prev.filter((sm) => sm.id !== messageId);
    });
  }, []);

  const tradesQuery = useJournalDayTrades(
    accountId,
    tradingDate,
    !!accountId && !!tradingDate,
  );
  const tradeMessagesQuery = useTradeJournalMessages(tradeId, !!tradeId);
  const createTradeMessage = useCreateJournalTradeMessage(
    accountId,
    tradingDate,
  );
  const updateMessage = useUpdateJournalMessage(accountId, tradingDate, tradeId);
  const deleteMessage = useDeleteJournalMessage(accountId, tradingDate, tradeId);
  const markTradeReviewed = useMarkJournalTradeReviewed(accountId, tradingDate);

  const trades = useMemo(
    () => tradesQuery.data?.items ?? [],
    [tradesQuery.data?.items],
  );
  const tradesChronological = useMemo(
    () =>
      [...trades].sort((a, b) => {
        const byClose = a.closed_at.localeCompare(b.closed_at);
        return byClose !== 0 ? byClose : a.id.localeCompare(b.id);
      }),
    [trades],
  );
  const tradeIndex = useMemo(() => {
    if (!tradeId) return -1;
    return tradesChronological.findIndex((item) => item.id === tradeId);
  }, [tradeId, tradesChronological]);
  const trade = useMemo(
    () => trades.find((item) => item.id === tradeId),
    [tradeId, trades],
  );
  const rawMessages = useMemo(
    () =>
      [...(tradeMessagesQuery.data ?? [])].sort((a, b) =>
        a.created_at.localeCompare(b.created_at),
      ),
    [tradeMessagesQuery.data],
  );

  const messages = useMemo<JournalMessage[]>(() => {
    const optimistic: JournalMessage[] = sendingMessages.map((sm) => {
      const isVoice = sm.messageType === "voice";
      const isImage = sm.messageType === "image";
      return {
        id: sm.id,
        daily_journal_id: null,
        trade_journal_id: tradeId ?? null,
        message_type: sm.messageType,
        content: sm.content ?? null,
        tags: [],
        audio_url: isVoice && sm.previewUrl ? sm.previewUrl : null,
        attachments: isImage && sm.previewUrl ? [{
          id: `attach-${sm.id}`,
          message_id: sm.id,
          storage_path: "",
          media_type: "image",
          mime_type: sm.file?.type ?? "image/png",
          original_filename: sm.file?.name ?? "image.png",
          caption: null,
          signed_url: sm.previewUrl,
          signed_url_expires_at: "",
          created_at: new Date().toISOString(),
        }] : [],
        created_at: new Date().toISOString(),
        status: (sm.status ?? "sending") as any,
      };
    });

    const optimisticIds = new Set(sendingMessages.map((sm) => sm.id));
    const filteredRaw = rawMessages.filter((m) => !optimisticIds.has(m.id));
    return [...filteredRaw, ...optimistic];
  }, [rawMessages, sendingMessages, tradeId]);

  const metrics = useMemo(() => buildTradeMetrics(trade), [trade]);
  const prompts = useMemo<ChatPrompt[]>(
    () => [
      { id: "p1", label: "Why did this trade perform this way?" },
      { id: "p2", label: "Was my risk management good?" },
      { id: "p3", label: "What should I improve next trade?" },
    ],
    [],
  );

  const isLoadingPage = tradesQuery.isLoading || tradeMessagesQuery.isLoading;
  const isSending =
    createTradeMessage.isPending ||
    updateMessage.isPending ||
    deleteMessage.isPending ||
    sendingMessages.length > 0;

  const sendMessage = async (payload: {
    content?: string;
    file?: File;
    messageType?: "text" | "image" | "voice";
  }) => {
    if (!tradeId) return;
    const tempId = `temp-${Date.now()}`;
    const abortController = new AbortController();
    const messageType =
      payload.messageType ??
      (payload.file?.type.startsWith("image/")
        ? "image"
        : payload.file?.type.startsWith("audio/")
          ? "voice"
          : "text");
    const previewUrl = payload.file ? URL.createObjectURL(payload.file) : undefined;
    if (previewUrl) {
      createdBlobUrlsRef.current.push(previewUrl);
    }

    setSendingMessages((prev) => [
      ...prev,
      {
        id: tempId,
        content: payload.content,
        file: payload.file,
        previewUrl,
        messageType,
        abortController,
      },
    ]);

    try {
      const realMsg = await createTradeMessage.mutateAsync({
        tradeId,
        payload,
        signal: abortController.signal,
      });

      if (realMsg && realMsg.id) {
        setSendingMessages((prev) =>
          prev.map((sm) =>
            sm.id === tempId
              ? { ...sm, id: realMsg.id, status: "success" as any }
              : sm
          )
        );
        if (previewUrl) {
          setResolvedBlobUrls((prev) => ({ ...prev, [realMsg.id]: previewUrl }));
        }
        setTimeout(() => {
          setSendingMessages((prev) => prev.filter((sm) => sm.id !== realMsg.id));
        }, 600);
      } else {
        setSendingMessages((prev) => prev.filter((sm) => sm.id !== tempId));
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      }
    } catch (err: any) {
      if (
        err.name === "CanceledError" ||
        err.name === "AbortError" ||
        axios.isCancel(err)
      ) {
        console.log("Upload aborted by user");
        return;
      }
      setSendingMessages((prev) => prev.filter((sm) => sm.id !== tempId));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const [{ toast }] = await Promise.all([import("sonner")]);
      toast.error("Failed to send message", {
        description: err.message || "An error occurred while uploading.",
      });
    }
  };

  const onSendComposer = async () => {
    const content = draftMessage.trim();
    if (!content && !pendingFile) return;
    await sendMessage({
      content: content || undefined,
      file: pendingFile || undefined,
    });
    setDraftMessage("");
    setPendingFile(null);
  };

  const onStartRecording = async () => {
    if (isRecording) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordingStreamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    recordingChunksRef.current = [];

    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) recordingChunksRef.current.push(event.data);
    };
    recorder.onstop = async () => {
      const blob = new Blob(recordingChunksRef.current, { type: "audio/webm" });
      const file = new File([blob], `voice-note-${Date.now()}.webm`, {
        type: "audio/webm",
      });
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
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
    )
      return;
    mediaRecorderRef.current.stop();
  };

  const buildTradeHrefForId = useCallback(
    (id: string) => {
      if (!tradingDate) return "";
      const params = new URLSearchParams();
      params.set("date", tradingDate);
      params.set("tradeId", id);
      if (fromParam) params.set("from", fromParam);
      if (contextParam) params.set("context", contextParam);
      return `/journal/trade?${params.toString()}`;
    },
    [tradingDate, fromParam, contextParam],
  );

  const goToTradeAtIndex = (index: number) => {
    const target = tradesChronological[index];
    if (!accountId || !tradingDate || !target) return;
    router.replace(buildTradeHrefForId(target.id));
  };

  const handleBack = useCallback(() => {
    if (fromParam === "day" && tradingDate && tradeId) {
      const ctx = contextParam ?? "trade";
      router.push(
        `/journal/chat?date=${encodeURIComponent(tradingDate)}&context=${encodeURIComponent(ctx)}&tradeId=${encodeURIComponent(tradeId)}`,
      );
      return;
    }
    router.back();
  }, [contextParam, fromParam, router, tradeId, tradingDate]);

  const isTradeReviewed = Boolean(trade?.trade_reviewed_at);

  if (!accountId || !tradingDate || !tradeId) {
    return (
      <div className="p-6 text-sm text-text-secondary">
        Missing trade context. Open trade journal from a day/trade row.
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg-primary px-4 pb-6 pt-4 lg:px-6">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-4">
        <JournalTradeChatHeader
          symbol={trade?.symbol ?? "Trade"}
          subtitle={formatTradeHeaderDate(trade?.opened_at)}
          onBack={handleBack}
          isReviewed={isTradeReviewed}
          isMarkingReviewed={markTradeReviewed.isPending}
          onMarkReviewed={() => {
            if (!tradeId) return;
            void markTradeReviewed.mutateAsync(tradeId);
          }}
          canPrevTrade={tradeIndex > 0}
          canNextTrade={
            tradeIndex >= 0 && tradeIndex < tradesChronological.length - 1
          }
          onPrevTrade={() => goToTradeAtIndex(tradeIndex - 1)}
          onNextTrade={() => goToTradeAtIndex(tradeIndex + 1)}
          isManual={trade?.is_manual}
          isMissed={trade?.is_missed}
          onEdit={() => {
            if (trade) openEditTradeModal(trade.id);
          }}
        />

        {isLoadingPage ? (
          <div className="flex h-[calc(100vh-12rem)] items-center justify-center text-sm text-text-secondary">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading trade details...
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,520px)_minmax(0,520px)_minmax(0,556px)]">
            <JournalDayChatRail
              title="Journal Trade"
              subtitle="Review your trade with text, image, and voice notes."
              composerPlaceholder="What was the lore behind this trade..."
              messages={messages}
              prompts={prompts}
              isLoading={tradeMessagesQuery.isLoading}
              isSending={isSending}
              chatContext="trade"
              hasTrade
              pendingFile={pendingFile}
              draftMessage={draftMessage}
              isRecording={isRecording}
              onDraftChange={setDraftMessage}
              onPickFile={(type) =>
                type === "image"
                  ? imageInputRef.current?.click()
                  : audioInputRef.current?.click()
              }
              onRecordToggle={isRecording ? onStopRecording : onStartRecording}
              onSend={onSendComposer}
              onPromptClick={(prompt) => setDraftMessage(prompt)}
              onContextChange={() => {}}
              onRemoveFile={() => setPendingFile(null)}
              onPasteFile={setPendingFile}
              onEditMessage={async (messageId, content) => {
                await updateMessage.mutateAsync({ messageId, content });
              }}
              onDeleteMessage={async (messageId) => {
                await deleteMessage.mutateAsync(messageId);
              }}
              onCancelSending={onCancelSending}
              resolvedBlobUrls={resolvedBlobUrls}
            />
            {/* Responsive stacking container for Details and Tags columns on md/lg screens */}
            <div className="grid gap-4 h-fit xl:contents">
              <JournalTradeChatStatsCard
                metrics={metrics}
                netPnl={asNumber(trade?.net_profit)}
                tradeId={tradeId}
                rating={trade?.rating}
                executionQuality={trade?.execution_quality}
                setupQuality={trade?.setup_quality}
                disciplineScore={trade?.discipline_score}
                accountId={accountId}
              />
              <JournalTradeChatTagsCard
                tradeId={tradeId}
                accountId={accountId}
              />
            </div>
          </div>
        )}
      </div>

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

      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) setPendingFile(file);
        }}
      />
    </div>
  );
}
