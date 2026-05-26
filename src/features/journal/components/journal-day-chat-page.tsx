"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResolvedJournalAccountId } from "@/features/journal/hooks/use-resolved-journal-account-id";
import { Card, CardContent } from "@/components/ui/card";
import {
  useAdjacentTradedDates,
  useCreateJournalDayMessage,
  useCreateJournalTradeMessage,
  useJournalDay,
  useMarkJournalDayReviewed,
  useTradeJournalMessages,
} from "@/features/journal/hooks/use-journal-day-modal";
import type { JournalMessage } from "@/features/journal/types";
import { JournalDayChatHeader } from "./journal-day-chat-header";
import { JournalDayChatPnlChartCard } from "./journal-day-chat-pnl-chart-card";
import { JournalDayChatRail } from "./journal-day-chat-rail";
import { JournalDayChatStatsCard } from "./journal-day-chat-stats-card";
import { JournalDayChatTradesCard } from "./journal-day-chat-trades-card";
import type { ChatContext } from "./journal-day-chat.types";
import {
  buildBalanceCurve,
  buildMetrics,
  buildRunningPnlCurve,
  formatDayLabel,
} from "./journal-day-chat.utils";
import { buildDaySummary } from "./journal-day-modal.utils";
import { requestSkipNextJournalDashboardAutoSync } from "@/features/journal/lib/journal-dashboard-auto-sync-skip";

export function JournalDayChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountId = useResolvedJournalAccountId();
  const tradingDate = searchParams.get("date") ?? undefined;
  const tradeId = searchParams.get("tradeId") ?? undefined;
  const initialContext =
    (searchParams.get("context") as ChatContext | null) ?? "day";

  const [chatContext, setChatContext] = useState<ChatContext>(initialContext);
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
  const markDayReviewed = useMarkJournalDayReviewed(accountId, tradingDate);
  const adjacentDaysQuery = useAdjacentTradedDates(
    accountId,
    tradingDate,
    !!accountId && !!tradingDate,
  );
  const isSending = createDayMessage.isPending || createTradeMessage.isPending;

  const trades = useMemo(() => dayQuery.data?.trades ?? [], [dayQuery.data?.trades]);
  const summary = useMemo(
    () =>
      buildDaySummary(
        trades,
        dayQuery.data?.day_start_balance ?? null,
        dayQuery.data?.day_end_balance ?? null,
      ),
    [
      trades,
      dayQuery.data?.day_start_balance,
      dayQuery.data?.day_end_balance,
    ],
  );
  const chartData = useMemo(() => buildRunningPnlCurve(trades), [trades]);
  const balanceCurveData = useMemo(
    () =>
      buildBalanceCurve(
        trades,
        dayQuery.data?.day_start_balance ?? null,
        dayQuery.data?.day_end_balance ?? null,
      ),
    [
      trades,
      dayQuery.data?.day_start_balance,
      dayQuery.data?.day_end_balance,
    ],
  );
  const metrics = useMemo(
    () =>
      buildMetrics(
        trades,
        dayQuery.data?.day_start_balance ?? null,
        dayQuery.data?.day_end_balance ?? null,
      ),
    [trades, dayQuery.data?.day_end_balance, dayQuery.data?.day_start_balance],
  );
  const dayLabel = useMemo(() => formatDayLabel(tradingDate), [tradingDate]);
  const prompts = useMemo(
    () => [
      { id: "p1", label: "Is this performance consistent?" },
      { id: "p2", label: "What could I improve here?" },
      { id: "p3", label: "Was my risk management good?" },
    ],
    [],
  );

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

  const isLoadingPage = dayQuery.isLoading;
  const isLoadingMessages =
    dayQuery.isLoading ||
    (chatContext === "trade" && tradeMessagesQuery.isLoading);

  const pnlPercentLabel = useMemo(() => {
    const start = dayQuery.data?.day_start_balance ?? 0;
    if (!start) return "0%";
    return `${((summary.grossPnl / start) * 100).toFixed(2)}%`;
  }, [dayQuery.data?.day_start_balance, summary.grossPnl]);

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

  const onOpenTradeJournal = (id: string) => {
    if (!accountId || !tradingDate) return;
    const params = new URLSearchParams();
    params.set("date", tradingDate);
    params.set("tradeId", id);
    params.set("from", "day");
    params.set("context", chatContext);
    router.push(`/journal/trade?${params.toString()}`);
  };

  const isDayReviewed = Boolean(dayQuery.data?.reviewed_at);

  const navigateToTradingDate = (nextDate: string) => {
    if (!accountId) return;
    const params = new URLSearchParams();
    params.set("date", nextDate);
    params.set("context", chatContext);
    if (chatContext === "trade" && tradeId) {
      params.set("tradeId", tradeId);
    }
    router.push(`/journal/chat?${params.toString()}`);
  };

  if (!accountId || !tradingDate) {
    return (
      <div className="p-6 text-sm text-text-secondary">
        Missing chat context. Open chat from the journal day modal.
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg-primary px-4 pb-6 pt-4 lg:px-6">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-4">
        <JournalDayChatHeader
          dayLabel={dayLabel}
          onBack={() => router.back()}
          isReviewed={isDayReviewed}
          isMarkingReviewed={markDayReviewed.isPending}
          markReviewDisabled={!dayQuery.data?.id}
          onMarkReviewed={() => {
            const id = dayQuery.data?.id;
            if (!id) return;
            void markDayReviewed.mutateAsync(id);
          }}
          canPrevDay={Boolean(adjacentDaysQuery.data?.prev_date)}
          canNextDay={Boolean(adjacentDaysQuery.data?.next_date)}
          onPrevDay={() => {
            const d = adjacentDaysQuery.data?.prev_date;
            if (d) navigateToTradingDate(d);
          }}
          onNextDay={() => {
            const d = adjacentDaysQuery.data?.next_date;
            if (d) navigateToTradingDate(d);
          }}
        />

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,556px)_minmax(0,1fr)]">
          <JournalDayChatRail
            messages={messages}
            prompts={prompts}
            isLoading={isLoadingMessages}
            isSending={isSending}
            chatContext={chatContext}
            hasTrade={!!tradeId}
            pendingFile={pendingFile}
            draftMessage={draftMessage}
            isRecording={isRecording}
            onDraftChange={setDraftMessage}
            onPickImage={() => imageInputRef.current?.click()}
            onRecordToggle={isRecording ? onStopRecording : onStartRecording}
            onSend={onSendComposer}
            onPromptClick={(prompt) => setDraftMessage(prompt)}
            onContextChange={setChatContext}
            onRemoveFile={() => setPendingFile(null)}
            onPasteFile={setPendingFile}
          />

          <section className="min-w-0 space-y-4">
            {isLoadingPage ? (
              <Card className="min-h-112">
                <CardContent className="flex h-full items-center justify-center p-6 text-sm text-text-secondary">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading day details...
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,520px)_minmax(0,520px)]">
                <div className="grid gap-4">
                  <JournalDayChatPnlChartCard
                    title="Running P&L"
                    data={chartData}
                    seriesKey="runningPnl"
                  />

                  <JournalDayChatPnlChartCard
                    title="Account Balance"
                    data={balanceCurveData}
                    seriesKey="accountBalance"
                  />
                </div>

                <JournalDayChatStatsCard
                  metrics={metrics}
                  netPnl={summary.grossPnl}
                  pnlPercentLabel={pnlPercentLabel}
                />
              </div>
            )}
          </section>
        </div>

        <JournalDayChatTradesCard
          accountId={accountId}
          tradingDate={tradingDate}
          onOpenTradeJournal={onOpenTradeJournal}
          className="w-full min-w-0"
        />
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
