/**
 * Timezone-aware date/time formatting.
 *
 * `formatInTimezone` renders an instant in a chosen IANA timezone. When no
 * timezone is given it falls back to the browser's local zone (Intl default),
 * preserving existing behaviour.
 */

type DateInput = Date | string | number;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

/**
 * Format an instant in the given IANA timezone (e.g. "America/New_York").
 * Pass `timeZone = null/undefined` to use the browser's local zone.
 */
export function formatInTimezone(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {},
  timeZone?: string | null
): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(undefined, {
      ...options,
      ...(timeZone ? { timeZone } : {}),
    }).format(date);
  } catch {
    // Invalid timeZone (shouldn't happen — backend validates it). Fall back to
    // local zone rather than throwing in a render path.
    return new Intl.DateTimeFormat(undefined, options).format(date);
  }
}

/** Time-only, e.g. "14:05" (24h). */
export function formatClockInTimezone(
  value: DateInput,
  timeZone?: string | null
): string {
  return formatInTimezone(
    value,
    { hour: "2-digit", minute: "2-digit", hour12: false },
    timeZone
  );
}

/** Short calendar date, e.g. "Jun 17, 2026". */
export function formatDateInTimezone(
  value: DateInput,
  timeZone?: string | null
): string {
  return formatInTimezone(
    value,
    { year: "numeric", month: "short", day: "numeric" },
    timeZone
  );
}
