import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StreamState {
  activeStreamId: string | null;
  setActiveStreamId: (id: string | null) => void;
  clearActiveStream: () => void;
}

export const useStreamStore = create<StreamState>()(
  persist(
    (set) => ({
      activeStreamId: null,
      setActiveStreamId: (id) => set({ activeStreamId: id }),
      clearActiveStream: () => set({ activeStreamId: null }),
    }),
    {
      name: "stream-storage",
      version: 1,
      migrate: (state: unknown, version: number) =>
        version < 1
          ? { activeStreamId: (state as any)?.activeStream?.id ?? null }
          : (state as StreamState),
    },
  ),
);
