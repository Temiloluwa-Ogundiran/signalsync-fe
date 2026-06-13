import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Architectural boundaries (Part 6 §6.2.4). Layered as:
  //   app -> features -> shared   (no feature -> feature; no shared -> feature)
  // Enabled as "warn" (report-only first) because two known couplings still
  // violate it: post/create-post-modal -> features/stream, and
  // components/layout/stream-switcher -> features/stream. Promote to "error"
  // once those are routed through a shared layer.
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "features", pattern: "src/features/*", capture: ["feature"] },
        {
          type: "shared",
          pattern: [
            "src/components/**",
            "src/lib/**",
            "src/hooks/**",
            "src/config/**",
          ],
        },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "warn",
        {
          default: "disallow",
          rules: [
            {
              from: { type: "app" },
              allow: { to: { type: ["app", "features", "shared"] } },
            },
            { from: { type: "features" }, allow: { to: { type: "shared" } } },
            {
              // a feature may import its own slice
              from: { type: "features" },
              allow: {
                to: { type: "features", captured: { feature: "{{from.feature}}" } },
              },
            },
            { from: { type: "shared" }, allow: { to: { type: "shared" } } },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
