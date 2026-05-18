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
      username: "trader",
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
      },
      accessToken: undefined,
      error: "RefreshAccessTokenError",
    } as never,
    request: {
      nextUrl: new URL("http://localhost:3000/overview"),
    } as never,
  });

  assert.equal(result, false);
});
