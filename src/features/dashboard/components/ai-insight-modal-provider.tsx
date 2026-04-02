"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AiInsightModal } from "./ai-insight-modal";

type AiInsightModalContextValue = {
  open: (topic?: string | null) => void;
  close: () => void;
};

const AiInsightModalContext = createContext<AiInsightModalContextValue | null>(
  null,
);

export function AiInsightModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);

  const open = useCallback((t?: string | null) => {
    setTopic(t ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AiInsightModalContext.Provider value={{ open, close }}>
      {children}
      <AiInsightModal isOpen={isOpen} onClose={close} topic={topic} />
    </AiInsightModalContext.Provider>
  );
}

export function useAiInsightModal() {
  const ctx = useContext(AiInsightModalContext);
  if (!ctx) {
    throw new Error("useAiInsightModal must be used within AiInsightModalProvider");
  }
  return ctx;
}
