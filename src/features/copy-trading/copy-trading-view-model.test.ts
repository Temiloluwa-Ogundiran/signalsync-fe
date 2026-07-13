import test from "node:test";
import assert from "node:assert/strict";
import {
  deriveSystemHealth,
  deriveCopyTradingMode,
  failureGuidance,
  groupActivity,
  humanizeActivity,
  summarizeCopyRule,
} from "./copy-trading-view-model.ts";

test("uses setup mode until a copy rule is active", () => {
  assert.equal(deriveCopyTradingMode([]), "setup");
  assert.equal(deriveCopyTradingMode([{ state: "ready" }]), "setup");
  assert.equal(deriveCopyTradingMode([{ state: "active" }]), "monitoring");
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
      statusLabel: "Confirming with broker",
    },
  );
  assert.equal(
    humanizeActivity({
      action: "signal.waiting",
      title: "Signal is waiting for required trade details.",
      parsed_details: { symbol: "XAUUSD" },
    }).statusLabel,
    "Waiting for trade details",
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
    "0.10 lots | Every take profit | Total size split | Pending orders allowed",
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

test("uses backend worker health instead of optimistic route state", () => {
  const health = deriveSystemHealth({
    globallyPaused: false,
    system: {
      status: "degraded",
      ready: false,
      issues: ["copy-execution is stale."],
      components: [],
    },
  });

  assert.equal(health.tone, "warning");
  assert.equal(health.label, "Copying is delayed");
  assert.match(health.description, /execution worker/i);
});

test("missing runtime workers require action", () => {
  const health = deriveSystemHealth({
    globallyPaused: false,
    system: {
      status: "action_required",
      ready: false,
      issues: ["copy-signal has not reported health."],
      components: [],
    },
  });

  assert.equal(health.tone, "danger");
  assert.equal(health.label, "Copying needs attention");
});

test("stale Telegram heartbeat is not presented as operational", () => {
  const health = deriveSystemHealth({
    globallyPaused: false,
    system: {
      status: "ready",
      ready: true,
      issues: [],
      components: [],
    },
    connections: [
      {
        state: "ready",
        is_paused: false,
        last_heartbeat_at: "2020-01-01T00:00:00.000Z",
      },
    ],
  });

  assert.equal(health.tone, "warning");
  assert.equal(health.label, "Telegram connection is stale");
});

test("launch blockers are never presented as ready", () => {
  const health = deriveSystemHealth({
    globallyPaused: false,
    system: {
      status: "ready",
      ready: true,
      issues: [],
      components: [],
    },
    launch: {
      ready: false,
      blockers: ["uncertain_intents"],
      warnings: [],
      components: [],
      stream_lag: 0,
      pending_events: 0,
      dead_letters: 0,
      oldest_uncertain_seconds: 121,
      global_paused: false,
    },
  });

  assert.equal(health.tone, "danger");
  assert.equal(health.label, "Live copying is blocked");
  assert.match(health.description, /broker confirmation/i);
});
