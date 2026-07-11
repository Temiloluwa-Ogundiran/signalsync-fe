import test from "node:test";
import assert from "node:assert/strict";
import { authConfig } from "./auth.config.ts";

test("session callback does not expose the refresh token to the client session", async () => {
  const session = await authConfig.callbacks.session({
    session: {
      user: {
        name: null,
        email: null,
        image: null,
      },
      expires: new Date(Date.now() + 60_000).toISOString(),
    },
    token: {
      id: "user-1",
      email: "user@example.com",
      displayName: "Trader",
      avatarUrl: null,
      isEmailVerified: true,
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresAt: Date.now() + 60_000,
    },
  } as never);

  assert.equal(session.accessToken, "access-token");
  assert.equal("refreshToken" in session, false);
});

test("authorized callback rejects protected routes when auth state is broken", () => {
  const result = authConfig.callbacks.authorized({
    auth: {
      user: {
        id: "user-1",
        onboardingCompleted: true,
      },
      accessToken: undefined,
      error: "RefreshAccessTokenError",
    } as never,
    request: {
      nextUrl: new URL("http://localhost:3000/dashboard"),
    } as never,
  });

  assert.equal(result, false);
});

test("authorized callback redirects authenticated users away from login", () => {
  const result = authConfig.callbacks.authorized({
    auth: {
      user: {
        id: "user-1",
        onboardingCompleted: true,
      },
      accessToken: "access-token",
    } as never,
    request: {
      nextUrl: new URL("http://localhost:3000/login"),
    } as never,
  });

  assert.ok(result instanceof Response);
  assert.equal(result.headers.get("location"), "http://localhost:3000/dashboard");
});

test("authorized callback rejects anonymous journal access", () => {
  const result = authConfig.callbacks.authorized({
    auth: null,
    request: {
      nextUrl: new URL("http://localhost:3000/dashboard"),
    } as never,
  });

  assert.equal(result, false);
});

test("jwt callback handles non-JSON refresh responses without surfacing a SyntaxError", async () => {
  const originalFetch = global.fetch;
  const originalConsoleError = console.error;
  const consoleCalls: unknown[][] = [];

  global.fetch = (async () =>
    new Response("<html>bad gateway</html>", {
      status: 502,
      headers: {
        "content-type": "text/html",
      },
    })) as typeof fetch;
  console.error = (...args: unknown[]) => {
    consoleCalls.push(args);
  };

  try {
    const result = await authConfig.callbacks.jwt({
      token: {
        accessToken: "expired-token",
        refreshToken: "refresh-token",
        expiresAt: Date.now() - 60_000,
      },
    } as never);

    assert.equal(result.error, "RefreshAccessTokenError");
    assert.equal(
      consoleCalls.some((args) =>
        args.some((value) => value instanceof SyntaxError),
      ),
      false,
    );
  } finally {
    global.fetch = originalFetch;
    console.error = originalConsoleError;
  }
});

test("jwt callback does not retry refresh after a prior refresh failure", async () => {
  const originalFetch = global.fetch;
  let fetchCalls = 0;

  global.fetch = (async () => {
    fetchCalls += 1;
    return new Response("{}");
  }) as typeof fetch;

  try {
    const result = await authConfig.callbacks.jwt({
      token: {
        accessToken: "expired-token",
        refreshToken: "refresh-token",
        expiresAt: Date.now() - 60_000,
        error: "RefreshAccessTokenError",
      },
    } as never);

    assert.equal(result.error, "RefreshAccessTokenError");
    assert.equal(fetchCalls, 0);
  } finally {
    global.fetch = originalFetch;
  }
});

test("jwt callback treats expired refresh token as expected session expiry", async () => {
  const originalFetch = global.fetch;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const errorCalls: unknown[][] = [];
  const warnCalls: unknown[][] = [];

  global.fetch = (async () =>
    new Response(
      JSON.stringify({ detail: "Invalid or expired refresh token." }),
      {
        status: 401,
        headers: {
          "content-type": "application/json",
        },
      },
    )) as typeof fetch;
  console.error = (...args: unknown[]) => {
    errorCalls.push(args);
  };
  console.warn = (...args: unknown[]) => {
    warnCalls.push(args);
  };

  try {
    const result = await authConfig.callbacks.jwt({
      token: {
        accessToken: "expired-token",
        refreshToken: "refresh-token",
        expiresAt: Date.now() - 60_000,
      },
    } as never);

    assert.equal(result.error, "RefreshAccessTokenError");
    assert.equal(errorCalls.length, 0);
    assert.equal(warnCalls.length, 1);
    assert.equal(
      warnCalls[0]?.[0],
      "Session refresh token expired; user must sign in again.",
    );
  } finally {
    global.fetch = originalFetch;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
});

test("jwt callback adopts the rotated refresh token from the grace-path cookie", async () => {
  const originalFetch = global.fetch;

  global.fetch = (async () =>
    new Response(
      JSON.stringify({
        access_token: "fresh-token",
        access_token_expiry_minutes: 30,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "set-cookie": "refresh_token=rotated-token; Path=/; HttpOnly",
        },
      },
    )) as typeof fetch;

  try {
    const result = await authConfig.callbacks.jwt({
      token: {
        accessToken: "expired-token",
        refreshToken: "stale-token",
        expiresAt: Date.now() - 60_000,
      },
    } as never);

    assert.equal(result.accessToken, "fresh-token");
    // The fix: adopt the rotated token the backend returned, never the stale one.
    assert.equal(result.refreshToken, "rotated-token");
    assert.equal(result.error, undefined);
  } finally {
    global.fetch = originalFetch;
  }
});

test("jwt callback single-flights concurrent refreshes of the same token", async () => {
  const originalFetch = global.fetch;
  let fetchCalls = 0;

  global.fetch = (async () => {
    fetchCalls += 1;
    return new Response(
      JSON.stringify({
        access_token: "fresh-token",
        access_token_expiry_minutes: 30,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "set-cookie": "refresh_token=rotated-token; Path=/; HttpOnly",
        },
      },
    );
  }) as typeof fetch;

  try {
    const makeCall = () =>
      authConfig.callbacks.jwt({
        token: {
          accessToken: "expired-token",
          refreshToken: "shared-token",
          expiresAt: Date.now() - 60_000,
        },
      } as never);

    const [a, b] = await Promise.all([makeCall(), makeCall()]);

    // Two concurrent refreshes of the same token collapse into ONE backend call.
    assert.equal(fetchCalls, 1);
    assert.equal(a.refreshToken, "rotated-token");
    assert.equal(b.refreshToken, "rotated-token");
  } finally {
    global.fetch = originalFetch;
  }
});

test("jwt callback prefers AUTH_BACKEND_URL for server-side auth requests", async () => {
  const originalFetch = global.fetch;
  const originalEnvValue = process.env.AUTH_BACKEND_URL;
  let requestedUrl = "";

  process.env.AUTH_BACKEND_URL = "http://127.0.0.1:8000";
  global.fetch = (async (input) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify({
        access_token: "fresh-token",
        access_token_expiry_minutes: 30,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  }) as typeof fetch;

  try {
    const result = await authConfig.callbacks.jwt({
      token: {
        accessToken: "expired-token",
        refreshToken: "refresh-token",
        expiresAt: Date.now() - 60_000,
      },
    } as never);

    assert.equal(result.accessToken, "fresh-token");
    assert.equal(requestedUrl, "http://127.0.0.1:8000/auth/refresh");
  } finally {
    global.fetch = originalFetch;

    if (originalEnvValue === undefined) {
      delete process.env.AUTH_BACKEND_URL;
    } else {
      process.env.AUTH_BACKEND_URL = originalEnvValue;
    }
  }
});
