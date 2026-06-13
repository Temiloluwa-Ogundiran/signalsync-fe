import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  label,
  value,
  subValue,
  trend,
}: {
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="bg-card-bg p-4 rounded-xl border border-border-primary shadow-sm flex flex-col justify-between min-w-[160px]">
      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">
        {label}
      </span>
      <div className="flex items-end justify-between">
        <div>
          <span
            className={`text-2xl font-bold ${trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-text-primary"}`}
          >
            {value}
          </span>
          {subValue && (
            <div className="text-xs text-text-tertiary mt-1 font-medium">
              {subValue}
            </div>
          )}
        </div>
        {trend === "up" && <TrendingUp className="h-5 w-5 text-success" />}
        {trend === "down" && <TrendingDown className="h-5 w-5 text-danger" />}
      </div>
    </div>
  );
}
