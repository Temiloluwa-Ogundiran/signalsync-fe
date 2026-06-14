import {
  startOfToday,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  startOfQuarter,
  startOfYear,
} from "date-fns";

export type DateRange = { from: Date; to?: Date };

export interface Preset {
  id: string;
  label: string;
  getRange: () => DateRange;
}

const today = () => startOfToday();

/**
 * Period-to-date except where noted. Emits date-only Dates at local midnight —
 * start/end-of-day + timezone conversion is the query layer's job, not here.
 */
export const DEFAULT_PRESETS: Preset[] = [
  { id: "today", label: "Today", getRange: () => ({ from: today(), to: today() }) },
  {
    id: "this-week",
    label: "This week",
    getRange: () => ({ from: startOfWeek(today(), { weekStartsOn: 0 }), to: today() }),
  },
  {
    id: "this-month",
    label: "This month",
    getRange: () => ({ from: startOfMonth(today()), to: today() }),
  },
  {
    id: "last-30-days",
    label: "Last 30 days",
    getRange: () => ({ from: subDays(today(), 29), to: today() }), // rolling
  },
  {
    id: "last-month",
    label: "Last month",
    getRange: () => ({
      from: startOfMonth(subMonths(today(), 1)),
      to: endOfMonth(subMonths(today(), 1)), // full previous calendar month
    }),
  },
  {
    id: "this-quarter",
    label: "This quarter",
    getRange: () => ({ from: startOfQuarter(today()), to: today() }),
  },
  {
    id: "ytd",
    label: "YTD (year to date)",
    getRange: () => ({ from: startOfYear(today()), to: today() }),
  },
];
