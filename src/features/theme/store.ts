import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

interface ThemeState {
  /** The user's chosen preference (what the toggle reflects). */
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  /** Cycle System → Light → Dark → System. */
  cycleTheme: () => void;
}

const CYCLE: ThemePreference[] = ["system", "light", "dark"];

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(theme: ThemePreference): ResolvedTheme {
  if (theme === "system") return systemPrefersDark() ? "dark" : "light";
  return theme;
}

function applyResolved(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function applyTheme(theme: ThemePreference) {
  applyResolved(resolveTheme(theme));
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      cycleTheme: () => {
        const next = CYCLE[(CYCLE.indexOf(get().theme) + 1) % CYCLE.length];
        set({ theme: next });
        applyTheme(next);
      },
    }),
    {
      name: "syncgram-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);

// Re-resolve when the OS preference changes, but only while the user is on
// "system". Light/dark are explicit and ignore the OS.
if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (useThemeStore.getState().theme === "system") {
        applyTheme("system");
      }
    });
}
