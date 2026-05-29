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
  onPickFile: (type: "image" | "audio") => void;
  onRecordToggle: () => void;
  onSend: () => void;
  onPromptClick: (value: string) => void;
  onContextChange: (value: ChatContext) => void;
  onRemoveFile: () => void;
  onPasteFile?: (file: File) => void;
  onEditMessage?: (messageId: string, content: string) => Promise<void> | void;
  onDeleteMessage?: (messageId: string) => Promise<void> | void;
  onCancelSending?: (messageId: string) => void;
  resolvedBlobUrls?: Record<string, string>;
  title?: string;
  subtitle?: string;
  composerPlaceholder?: string;
}
