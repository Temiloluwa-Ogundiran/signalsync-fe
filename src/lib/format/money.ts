/**
 * Currency-aware money formatting.
 *
 * `formatMoney` turns a number into a displayed amount in a given ISO-4217
 * currency — whatever the broker account reports (USD, NGN, EUR, …). It does
 * NOT convert the value; it only controls how the number is rendered.
 */

const DEFAULT_CURRENCY = "USD";

interface FormatMoneyOptions {
  /** ISO-4217 currency code from the account/data. Falls back to USD. */
  currency?: string | null;
  /** Compact notation (e.g. $1.2K) for axis labels and dense UI. */
  compact?: boolean;
  /** Force min/max fraction digits. Defaults follow the currency. */
  fractionDigits?: number;
}

function resolveCurrency(currency?: string | null): string {
  const code = (currency ?? "").trim().toUpperCase();
  // ISO-4217 codes are 3 letters; anything else falls back to the default.
  return /^[A-Z]{3}$/.test(code) ? code : DEFAULT_CURRENCY;
}

/**
 * Format a numeric amount in the given currency.
 *
 * Examples: formatMoney(1234.5) -> "$1,234.50"
 *           formatMoney(1234.5, { currency: "NGN" }) -> "₦1,234.50"
 *           formatMoney(12000, { compact: true }) -> "$12K"
 */
export function formatMoney(
  value: number,
  options: FormatMoneyOptions = {}
): string {
  const currency = resolveCurrency(options.currency);
  const safeValue = Number.isFinite(value) ? value : 0;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      notation: options.compact ? "compact" : "standard",
      ...(options.fractionDigits !== undefined
        ? {
            minimumFractionDigits: options.fractionDigits,
            maximumFractionDigits: options.fractionDigits,
          }
        : {}),
    }).format(safeValue);
  } catch {
    // Unknown currency code or narrowSymbol unsupported — degrade gracefully
    // rather than throwing in a render path.
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        notation: options.compact ? "compact" : "standard",
      }).format(safeValue);
    } catch {
      return `${safeValue.toFixed(2)} ${currency}`;
    }
  }
}

/**
 * Compact, sign-prefixed money for calendar/summary cells, e.g. "+$1.2K" /
 * "-₦450". Always shows an explicit + or - and uses the account currency symbol.
 */
export function formatMoneyCompactSigned(
  value: number,
  currency?: string | null
): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  const sign = safeValue < 0 ? "-" : "+";
  // Format the magnitude (compact) then prepend our explicit sign so positives
  // get a "+", which Intl never adds on its own.
  return `${sign}${formatMoney(Math.abs(safeValue), {
    currency,
    compact: true,
  })}`;
}
