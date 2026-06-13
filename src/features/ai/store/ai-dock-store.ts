"use client";

import { create } from "zustand";
import type { AiContext } from "../types";

type AiDockState = {
  isOpen: boolean;
  context: AiContext | null;
  activeSessionId: string | null;
  open: (context?: AiContext | null) => void;
  close: () => void;
  setActiveSessionId: (id: string | null) => void;
};

export const useAiDockStore = create<AiDockState>((set) => ({
  isOpen: false,
  context: null,
  activeSessionId: null,
  open: (context) => set({ isOpen: true, context: context ?? null }),
  close: () => set({ isOpen: false }),
  setActiveSessionId: (id) => set({ activeSessionId: id }),
}));
