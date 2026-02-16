import type { LucideIcon } from "lucide-react";

interface StatusWidgetProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function StatusWidget({
  label,
  value,
  icon: Icon,
  trend,
}: StatusWidgetProps) {
  return (
    <div className="flex items-center space-x-3 bg-card-bg px-4 py-3 rounded-xl border border-border-primary shadow-sm min-w-[140px]">
      <div className="p-2 bg-bg-tertiary rounded-lg text-text-secondary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
          {label}
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-bold text-text-primary">{value}</span>
          {trend === "up" && (
            <span className="h-2 w-2 rounded-full bg-success" />
          )}
          {trend === "down" && (
            <span className="h-2 w-2 rounded-full bg-danger" />
          )}
        </div>
      </div>
    </div>
  );
}
