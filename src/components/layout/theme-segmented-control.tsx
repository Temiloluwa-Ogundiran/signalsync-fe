"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerIcon, Sun03Icon, Moon02Icon } from "@hugeicons/core-free-icons";
import { useThemeStore, type ThemePreference } from "@/features/theme/store";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof ComputerIcon }[] = [
  { value: "system", label: "System", icon: ComputerIcon },
  { value: "light", label: "Light", icon: Sun03Icon },
  { value: "dark", label: "Dark", icon: Moon02Icon },
];

/** System / Light / Dark segmented control (matches the profile-menu footer). */
export function ThemeSegmentedControl() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center gap-1 rounded-xl bg-surface-subtle p-1"
    >
      {OPTIONS.map(({ value, label, icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-1 items-center justify-center rounded-lg py-1.5 transition-colors cursor-pointer",
              active
                ? "bg-card-bg text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8} />
          </button>
        );
      })}
    </div>
  );
}
