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

/**
 * Inclusive rolling window: `days` calendar days ending at `anchor` (default
 * today, local). Pass an anchor to end the window at a specific date — e.g. an
 * account's most recent activity instead of "now".
 */
export function getLastDaysInclusiveRange(days: number, anchor?: Date) {
  const to = anchor ? new Date(anchor) : new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  return {
    fromDate: formatDateParam(from),
    toDate: formatDateParam(to),
  };
}
