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
        { type: "shell", pattern: "src/components/layout/**" },
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
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: { type: "app" },
              allow: { to: { type: ["app", "shell", "features", "shared"] } },
            },
            { from: { type: "features" }, allow: { to: { type: "shared" } } },
            {
              from: { type: "shell" },
              allow: { to: { type: ["shell", "features", "shared"] } },
            },
            {
              from: { type: "features", captured: { feature: "ai" } },
              allow: { to: { type: "features", captured: { feature: "journal" } } },
            },
            {
              from: { type: "features", captured: { feature: "journal" } },
              allow: { to: { type: "features", captured: { feature: "ai" } } },
            },
            {
              from: { type: "features", captured: { feature: "onboarding" } },
              allow: { to: { type: "features", captured: { feature: "settings" } } },
            },
            {
              from: { type: "features", captured: { feature: "settings" } },
              allow: { to: { type: "features", captured: { feature: "journal" } } },
            },
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
  // Theme guard: discourage hardcoded colors that won't adapt to light/dark.
  // Use design tokens (bg-surface-subtle, border-hairline, text-text-*,
  // text-ai-accent, bg-overlay, etc.) instead. Report-only ("warn").
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/app/globals.css", "src/lib/use-chart-colors.ts"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "Literal[value=/(?:bg|ring|border|divide)-white\\/\\[|(?:bg|text|border|ring)-\\[#|bg-black\\/\\[|bg-black(?![\\w-])/]",
          message:
            "Avoid hardcoded colors (white/black opacity, arbitrary hex). Use a design token (bg-surface-subtle, border-hairline, text-text-*, bg-overlay, text-ai-accent) so it adapts to light/dark.",
        },
      ],
    },
  },
]);

export default eslintConfig;
