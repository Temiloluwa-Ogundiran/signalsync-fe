/**
 * FEATURE FLAGS
 *
 * Controls which navigation tabs are visible and which routes are accessible.
 * Set a flag to `true` when you're ready to ship that feature.
 *
 * Effects of a `false` flag:
 *  - The nav item is removed from the sidebar and mobile nav (never rendered in DOM)
 *  - Direct URL access to the route redirects to /journal (handled by middleware)
 *  - No page component mounts → no API calls are ever fired
 */
export const FEATURE_FLAGS = {
  /** /ai  — SignalSync AI copilot (dock + full page) */
  AI: true,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
