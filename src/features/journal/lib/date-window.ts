export function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateParam(value: string | null) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

/** Inclusive rolling window: `days` calendar days ending today (local). */
export function getLastDaysInclusiveRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return {
    fromDate: formatDateParam(from),
    toDate: formatDateParam(to),
  };
}

export type BalanceRangeOption = "1D" | "1W" | "1M" | "1Y" | "All";

export function resolveBalanceRangeWindow(range: BalanceRangeOption) {
  const now = new Date();
  const end = formatDateParam(now);
  if (range === "All") {
    return { fromDate: "2000-01-01", toDate: end, granularity: "day" as const };
  }
  if (range === "1D") {
    return { fromDate: end, toDate: end, granularity: "intraday" as const };
  }
  const start = new Date(now);
  if (range === "1W") start.setDate(start.getDate() - 7);
  if (range === "1M") start.setMonth(start.getMonth() - 1);
  if (range === "1Y") start.setFullYear(start.getFullYear() - 1);
  return {
    fromDate: formatDateParam(start),
    toDate: end,
    granularity: "day" as const,
  };
}
