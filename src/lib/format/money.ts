const DEFAULT_CURRENCY = "USD";

interface FormatMoneyOptions {
  currency?: string | null;
  compact?: boolean;
  fractionDigits?: number;
}

function resolveCurrency(currency?: string | null): string {
  const code = (currency ?? "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : DEFAULT_CURRENCY;
}

export function formatMoney(
  value: number,
  options: FormatMoneyOptions = {},
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
