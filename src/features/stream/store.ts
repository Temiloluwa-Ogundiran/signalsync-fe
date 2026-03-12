import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Stream } from "./api/stream.api";

interface StreamState {
  activeStream: Stream | null;
  setActiveStream: (stream: Stream) => void;
  clearActiveStream: () => void;
}

export const useStreamStore = create<StreamState>()(
  persist(
    (set) => ({
      activeStream: null,
      setActiveStream: (stream) => set({ activeStream: stream }),
      clearActiveStream: () => set({ activeStream: null }),
    }),
    {
      name: "stream-storage",
    }
  )
);
