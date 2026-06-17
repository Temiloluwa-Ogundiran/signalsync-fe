import { formatMoney } from "@/lib/format/money";

/**
 * Calendar/week-summary money formatting in the account's currency.
 *
 * Mirrors the long-standing calendar style: full amount under 1,000 (so small
 * day P&Ls stay readable), compact notation (e.g. ₦1.2K) at or above 1,000.
 * Negatives keep a leading "-"; positives are unsigned (callers add tone/colour).
 */
export function formatCalendarMoney(value: number, currency: string): string {
  const abs = Math.abs(Number.isFinite(value) ? value : 0);
  const sign = value < 0 ? "-" : "";

  if (abs < 1000) {
    return `${sign}${formatMoney(abs, {
      currency,
      fractionDigits: abs < 1 ? 2 : 0,
    })}`;
  }
  return `${sign}${formatMoney(abs, { currency, compact: true })}`;
}
