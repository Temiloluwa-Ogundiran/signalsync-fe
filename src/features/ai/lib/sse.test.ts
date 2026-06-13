import test from "node:test";
import assert from "node:assert/strict";
import { streamChat } from "./sse.ts";

test("streamChat uses the secure Next proxy without browser bearer tokens", async () => {
  const originalFetch = global.fetch;
  let requestedUrl = "";
  let requestedAuthorization: string | null = null;

  global.fetch = (async (input, init) => {
    requestedUrl = String(input);
    requestedAuthorization = new Headers(init?.headers).get("authorization");
    return new Response('data: {"type":"done","message_id":"msg_1"}\n\n', {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  }) as typeof fetch;

  try {
    const events = [];
    for await (const event of streamChat("session_1", "hello", "secret-token")) {
      events.push(event);
    }

    assert.equal(requestedUrl, "/api/proxy/ai/sessions/session_1/stream");
    assert.equal(requestedAuthorization, null);
    assert.deepEqual(events, [{ type: "done", message_id: "msg_1" }]);
  } finally {
    global.fetch = originalFetch;
  }
});
