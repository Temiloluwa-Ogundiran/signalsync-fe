"use client";

import { cn } from "@/lib/utils";
import { getPasswordStrength } from "@/lib/validation/password-policy";

/**
 * Segmented password-strength meter shown under the signup password field.
 * Four bars fill and shift colour (red → amber → lime → green) as the password
 * gets stronger, with a text label.
 */
export function PasswordStrength({ password }: { password: string }) {
  const { score, label } = getPasswordStrength(password);

  if (!password) return null;

  // Colour for the filled segments at this score.
  const fill =
    score <= 1
      ? "bg-red-500"
      : score === 2
        ? "bg-amber-500"
        : score === 3
          ? "bg-lime-500"
          : "bg-emerald-500";

  const labelColor =
    score <= 1
      ? "text-red-500"
      : score === 2
        ? "text-amber-600"
        : score === 3
          ? "text-lime-600"
          : "text-emerald-600";

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < score ? fill : "bg-border-secondary/60",
            )}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-xs text-text-tertiary">Password strength</span>
        <span className={cn("text-xs font-semibold", labelColor)}>{label}</span>
      </div>
    </div>
  );
}
