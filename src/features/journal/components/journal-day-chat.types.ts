import type { JournalMessage } from "@/features/journal/types";

export type ChatContext = "day" | "trade";

export interface ChatPrompt {
  id: string;
  label: string;
}

export interface MetricRow {
  label: string;
  value: string;
  valueClassName?: string;
}

export interface CurvePoint {
  label: string;
  value: number;
}

export interface ChatRailProps {
  messages: JournalMessage[];
  prompts: ChatPrompt[];
  isLoading: boolean;
  isSending: boolean;
  chatContext: ChatContext;
  hasTrade: boolean;
  pendingFile: File | null;
  draftMessage: string;
  isRecording: boolean;
  onDraftChange: (value: string) => void;
  onPickImage: () => void;
  onRecordToggle: () => void;
  onSend: () => void;
  onPromptClick: (value: string) => void;
  onContextChange: (value: ChatContext) => void;
  onRemoveFile: () => void;
  title?: string;
  subtitle?: string;
  composerPlaceholder?: string;
}
