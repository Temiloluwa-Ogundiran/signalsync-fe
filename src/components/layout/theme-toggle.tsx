"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Sun03Icon, Moon02Icon } from "@hugeicons/core-free-icons";
import { useThemeStore } from "@/features/theme/store";

/** Standalone header theme switcher (sun/moon), matching the icon-button chrome. */
export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-border-secondary bg-chrome-bar-bg text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary cursor-pointer"
    >
      <HugeiconsIcon
        icon={theme === "dark" ? Sun03Icon : Moon02Icon}
        size={18}
        strokeWidth={1.8}
      />
    </button>
  );
}
