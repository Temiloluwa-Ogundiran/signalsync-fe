"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";
import {
  useCreateJournalTradeMessage,
  useJournalDayTrades,
  useMarkJournalTradeReviewed,
  useTradeJournalMessages,
} from "@/features/journal/hooks/use-journal-day-modal";
import { JournalDayChatRail } from "./journal-day-chat-rail";
import type { ChatPrompt } from "./journal-day-chat.types";
import { asNumber } from "./journal-day-modal.utils";
import { JournalTradeChatHeader } from "./journal-trade-chat-header";
import { JournalTradeChatStatsCard } from "./journal-trade-chat-stats-card";
import { JournalTradeChatTagsCard } from "./journal-trade-chat-tags-card";
import { buildTradeMetrics, formatTradeHeaderDate } from "./journal-trade-chat.utils";
import { requestSkipNextJournalDashboardAutoSync } from "@/features/journal/lib/journal-dashboard-auto-sync-skip";

export function JournalTradeChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);

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
  const messages = useMemo(
    () =>
      [...(tradeMessagesQuery.data ?? [])].sort((a, b) =>
        a.created_at.localeCompare(b.created_at),
      ),
    [tradeMessagesQuery.data],
  );

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
  const isSending = createTradeMessage.isPending;

  const sendMessage = async (payload: {
    content?: string;
    file?: File;
    messageType?: "text" | "image" | "voice";
  }) => {
    if (!tradeId) return;
    await createTradeMessage.mutateAsync({ tradeId, payload });
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
              onPickImage={() => imageInputRef.current?.click()}
              onRecordToggle={isRecording ? onStopRecording : onStartRecording}
              onSend={onSendComposer}
              onPromptClick={(prompt) => setDraftMessage(prompt)}
              onContextChange={() => {}}
              onRemoveFile={() => setPendingFile(null)}
            />
            {/* Responsive stacking container for Details and Tags columns on md/lg screens */}
            <div className="grid gap-4 h-fit xl:contents">
              <JournalTradeChatStatsCard
                metrics={metrics}
                netPnl={asNumber(trade?.net_profit)}
                tradeId={tradeId}
                rating={trade?.rating}
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
    </div>
  );
}
