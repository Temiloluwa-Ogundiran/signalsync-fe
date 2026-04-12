"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAYBACK_SPEEDS = [1, 1.5, 2] as const;

const BAR_PATTERN: readonly number[] = [
  1, 0.83, 0.73, 0.67, 0.5, 0.33, 0.67, 0.73, 0.8, 0.5, 0.33, 0.33, 1, 0.83, 1,
  0.83, 0.73, 0.67, 0.5, 0.33, 0.67, 0.73, 0.8, 0.5, 0.33, 0.67, 0.73, 0.8,
];

function barsForMessage(messageId: string): number[] {
  let h = 0;
  for (let i = 0; i < messageId.length; i++) {
    h += messageId.charCodeAt(i);
  }
  const offset = h % BAR_PATTERN.length;
  return [...BAR_PATTERN.slice(offset), ...BAR_PATTERN.slice(0, offset)];
}

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface JournalVoiceMessagePlayerProps {
  messageId: string;
  audioUrl: string;
}

export function JournalVoiceMessagePlayer({
  messageId,
  audioUrl,
}: JournalVoiceMessagePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);

  const bars = useMemo(() => barsForMessage(messageId), [messageId]);
  const speed = PLAYBACK_SPEEDS[speedIdx % PLAYBACK_SPEEDS.length];

  const syncPlaybackRate = useCallback(() => {
    const el = audioRef.current;
    if (el) el.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    syncPlaybackRate();
  }, [syncPlaybackRate]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onMeta = () => setDuration(el.duration || 0);
    const onTime = () => setCurrentTime(el.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  };

  const cycleSpeed = () => {
    setSpeedIdx((i) => (i + 1) % PLAYBACK_SPEEDS.length);
  };

  return (
    <div
      className="w-full max-w-[min(100%,20.75rem)] rounded-tl-[2.75rem] rounded-tr-[2.75rem] rounded-br-[2.75rem] rounded-bl-md p-2"
      style={{ background: "var(--journal-voice-outer)" }}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" />
      <div
        className="relative flex min-h-[4.375rem] items-center gap-2 rounded-[2.75rem] px-2 py-2"
        style={{ background: "var(--journal-voice-inner)" }}
      >
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-11 w-11 shrink-0 rounded-full border-0 text-[var(--journal-voice-play-fg)]"
          style={{ background: "var(--journal-voice-play-bg)" }}
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" fill="currentColor" />
          ) : (
            <Play className="h-5 w-5 pl-0.5" fill="currentColor" />
          )}
        </Button>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
          <div
            className="flex h-8 max-w-full items-end justify-center gap-px overflow-hidden px-1"
            aria-hidden
          >
            {bars.slice(0, 40).map((h, i) => (
              <span
                key={i}
                className="w-0.5 shrink-0 rounded-full"
                style={{
                  height: `${Math.max(0.2, h) * 100}%`,
                  background: "var(--journal-voice-bar)",
                }}
              />
            ))}
          </div>
          <span
            className="text-[0.625rem] font-semibold leading-none"
            style={{ color: "var(--journal-voice-time)" }}
          >
            {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 shrink-0 rounded-full px-3 text-sm font-semibold"
          style={{
            background: "var(--journal-voice-speed-bg)",
            color: "var(--journal-voice-speed-fg)",
          }}
          onClick={cycleSpeed}
        >
          {speed}x
        </Button>
      </div>
    </div>
  );
}
