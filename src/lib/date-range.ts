export interface DateRangeValue {
  from: Date;
  to: Date;
}

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

  // Date's constructor normalizes invalid values (for example, month 13),
  // so verify the components after parsing instead of accepting a shifted day.
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function dateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Current calendar month through today, using the browser's local timezone. */
export function getCurrentMonthDateRange(now = new Date()): DateRangeValue {
  const today = dateOnly(now);
  return {
    from: new Date(today.getFullYear(), today.getMonth(), 1),
    to: today,
  };
}

/** Resolve a URL range, falling back to the current month when absent/invalid. */
export function getDateRangeFromParams(
  fromValue: string | null,
  toValue: string | null,
  now = new Date(),
): DateRangeValue {
  const from = parseDateParam(fromValue);
  const to = parseDateParam(toValue);
  if (from && to && from <= to) return { from, to };
  return getCurrentMonthDateRange(now);
}

/** Return a complete calendar-month range, capped at today for this month. */
export function getCalendarMonthDateRange(
  month: Date,
  now = new Date(),
): DateRangeValue {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const today = dateOnly(now);
  return {
    from: monthStart,
    to: monthEnd > today ? today : monthEnd,
  };
}
