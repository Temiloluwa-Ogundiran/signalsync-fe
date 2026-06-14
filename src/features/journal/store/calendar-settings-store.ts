import { create } from "zustand";
import { persist } from "zustand/middleware";

type CalendarSettingsState = {
  /** Weekly P&L summary column. Off by default so day cells fill the space. */
  showWeekSummary: boolean;
  setShowWeekSummary: (show: boolean) => void;
};

export const useCalendarSettingsStore = create<CalendarSettingsState>()(
  persist(
    (set) => ({
      showWeekSummary: false,
      setShowWeekSummary: (show) => set({ showWeekSummary: show }),
    }),
    { name: "journal-calendar-settings", version: 1 },
  ),
);
