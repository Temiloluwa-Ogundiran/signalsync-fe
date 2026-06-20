import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

test("journal and AI query keys do not include access tokens", () => {
  const files = [
    "src/features/journal/hooks/use-journal-open-positions.ts",
    "src/features/journal/hooks/use-infinite-trade-history.ts",
  ];

  for (const file of files) {
    const source = readFileSync(join(ROOT, file), "utf8");
    assert.equal(
      source.includes("accessToken"),
      false,
      `${file} must not include accessToken in query keys or proxy-backed query functions`,
    );
  }
});
