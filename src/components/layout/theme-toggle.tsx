"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/features/theme/store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  // Theme class is managed by the store's onRehydrateStorage + the blocking
  // inline script in layout.tsx — no useEffect needed here.

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="relative p-2 rounded-full text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary transition-colors"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
