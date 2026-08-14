import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDateParam,
  getCalendarMonthDateRange,
  getCurrentMonthDateRange,
  getDateRangeFromParams,
} from "./date-range";

const now = new Date(2026, 7, 14, 16, 30);

test("defaults to the current local month through today", () => {
  const range = getCurrentMonthDateRange(now);

  assert.equal(formatDateParam(range.from), "2026-08-01");
  assert.equal(formatDateParam(range.to), "2026-08-14");
});

test("keeps a valid URL range", () => {
  const range = getDateRangeFromParams("2026-07-03", "2026-07-20", now);

  assert.equal(formatDateParam(range.from), "2026-07-03");
  assert.equal(formatDateParam(range.to), "2026-07-20");
});

test("invalid or incomplete URL dates fall back to this month", () => {
  const invalid = getDateRangeFromParams("2026-02-30", "2026-03-01", now);
  const incomplete = getDateRangeFromParams("2026-07-01", null, now);

  assert.equal(formatDateParam(invalid.from), "2026-08-01");
  assert.equal(formatDateParam(invalid.to), "2026-08-14");
  assert.equal(formatDateParam(incomplete.from), "2026-08-01");
  assert.equal(formatDateParam(incomplete.to), "2026-08-14");
});

test("calendar month ranges cap the current month at today", () => {
  const range = getCalendarMonthDateRange(new Date(2026, 7, 1), now);

  assert.equal(formatDateParam(range.from), "2026-08-01");
  assert.equal(formatDateParam(range.to), "2026-08-14");
});
