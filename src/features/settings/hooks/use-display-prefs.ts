"use client";

import { useMemo } from "react";
import {
  formatClockInTimezone,
  formatDateInTimezone,
  formatInTimezone,
} from "@/lib/format/datetime";
import { useCurrentUser } from "./use-settings";

type DateInput = Date | string | number;

export interface DisplayPrefs {
  /** The user's chosen IANA timezone, or null for the browser's local zone. */
  timezone: string | null;
  /** Format an instant in the user's timezone. */
  dateTime: (value: DateInput, opts?: Intl.DateTimeFormatOptions) => string;
  /** Time-only in the user's timezone. */
  clock: (value: DateInput) => string;
  /** Short date in the user's timezone. */
  date: (value: DateInput) => string;
}

/**
 * Read the user's display timezone preference and return formatters bound to it.
 * Falls back to the browser's local timezone before the user loads (or when no
 * preference is set).
 *
 * Note: currency is NOT a user preference — monetary amounts are formatted in
 * each broker account's own currency via `@/lib/format/money` (`formatMoney`).
 */
export function useDisplayPrefs(): DisplayPrefs {
  const { data: user } = useCurrentUser();
  const timezone = user?.display_timezone ?? null;

  return useMemo(
    () => ({
      timezone,
      dateTime: (value, opts) => formatInTimezone(value, opts, timezone),
      clock: (value) => formatClockInTimezone(value, timezone),
      date: (value) => formatDateInTimezone(value, timezone),
    }),
    [timezone]
  );
}
