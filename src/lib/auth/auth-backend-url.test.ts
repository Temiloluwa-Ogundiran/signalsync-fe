import test from "node:test";
import assert from "node:assert/strict";
import { resolveAuthBackendUrl } from "./auth-backend-url.ts";

function withEnv(
  env: Record<string, string | undefined>,
  run: () => void,
) {
  const keys = [
    "NODE_ENV",
    "AUTH_BACKEND_URL",
    "BACKEND_URL",
    "NEXT_PUBLIC_API_URL",
    "ALLOW_LOCAL_BACKEND_URL",
  ];
  const previous = new Map(keys.map((key) => [key, process.env[key]]));

  for (const key of keys) {
    delete process.env[key];
  }

  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }

  try {
    run();
  } finally {
    for (const key of keys) {
      const value = previous.get(key);
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("production auth backend resolution fails fast when no backend URL is configured", () => {
  withEnv({ NODE_ENV: "production" }, () => {
    assert.throws(
      () => resolveAuthBackendUrl(),
      /AUTH_BACKEND_URL or BACKEND_URL must be configured/,
    );
  });
});

test("production auth backend resolution rejects localhost backend URLs by default", () => {
  withEnv(
    {
      NODE_ENV: "production",
      AUTH_BACKEND_URL: "http://localhost:8000",
    },
    () => {
      assert.throws(
        () => resolveAuthBackendUrl(),
        /must not point at localhost in production/,
      );
    },
  );
});

test("auth backend resolution strips trailing slashes", () => {
  withEnv(
    {
      NODE_ENV: "production",
      AUTH_BACKEND_URL: "https://api.example.com///",
    },
    () => {
      assert.equal(resolveAuthBackendUrl(), "https://api.example.com");
    },
  );
});
