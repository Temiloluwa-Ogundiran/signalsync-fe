import test from "node:test";
import assert from "node:assert/strict";
import {
  deriveAutomationHealth,
  deriveCopyTradingMode,
  failureGuidance,
  groupActivity,
  humanizeActivity,
  summarizeCopyRule,
} from "./copy-trading-view-model";

test("uses setup mode until a copy rule is active", () => {
  assert.equal(deriveCopyTradingMode([]), "setup");
  assert.equal(deriveCopyTradingMode([{ state: "ready" }]), "setup");
  assert.equal(deriveCopyTradingMode([{ state: "active" }]), "monitoring");
});

test("reports degraded health without claiming all copying stopped", () => {
  const health = deriveAutomationHealth({
    globallyPaused: false,
    routes: [
      {
        state: "active",
        source_id: "source-1",
        target_account_id: "account-1",
      },
      {
        state: "target_unavailable",
        source_id: "source-2",
        target_account_id: "account-2",
      },
    ],
    connections: [{ state: "ready", is_paused: false }],
    sources: [
      { id: "source-1", state: "active", is_paused: false },
      { id: "source-2", state: "ready", is_paused: false },
    ],
  });

  assert.equal(health.tone, "warning");
  assert.equal(health.label, "Some copy rules need attention");
  assert.match(health.description, /Healthy rules will continue/);
});

test("translates internal activity into trader-friendly status", () => {
  assert.deepEqual(
    humanizeActivity({
      action: "broker.uncertain",
      title: "Confirming broker status",
      parsed_details: {
        action: "open_market",
        direction: "buy",
        symbol: "XAUUSD",
      },
    }),
    {
      actionLabel: "Buy XAUUSD",
      statusLabel: "Confirming broker result",
    },
  );
});

test("summarizes a copy rule in plain language", () => {
  assert.equal(
    summarizeCopyRule({
      fixed_lot: "0.10",
      take_profit_mode: "all",
      lot_distribution: "split_total",
      pending_orders_enabled: true,
    }),
    "0.10 lots · Every take profit · Total size split · Pending orders allowed",
  );
});

test("groups activity by signal with newest signal first", () => {
  const groups = groupActivity([
    {
      id: "1",
      correlation_id: "signal-a",
      created_at: "2026-06-21T10:00:00Z",
      level: "info",
    },
    {
      id: "2",
      correlation_id: "signal-a",
      created_at: "2026-06-21T10:00:02Z",
      level: "success",
    },
    {
      id: "3",
      correlation_id: "signal-b",
      created_at: "2026-06-21T11:00:00Z",
      level: "error",
    },
  ]);

  assert.deepEqual(
    groups.map((group) => group.correlationId),
    ["signal-b", "signal-a"],
  );
  assert.equal(groups[1].events.length, 2);
});

test("failure guidance explains continuation and the next action", () => {
  const message = failureGuidance({
    title: "No tradable broker symbol matches XAUUSD",
    parsed_details: { symbol: "XAUUSD" },
  });

  assert.match(message, /Other copy rules will continue/);
  assert.match(message, /check that XAUUSD is available/i);
});
