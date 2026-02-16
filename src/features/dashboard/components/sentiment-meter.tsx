interface SentimentMeterProps {
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
  color: string;
}

export function SentimentMeter({
  label,
  value,
  leftLabel,
  rightLabel,
  color,
}: SentimentMeterProps) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-bold text-text-primary uppercase">
          {label}
        </span>
        <span className="text-xs font-medium text-text-secondary">
          {value > 50 ? rightLabel : leftLabel}
        </span>
      </div>
      <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-text-tertiary font-medium">
          {leftLabel}
        </span>
        <span className="text-[10px] text-text-tertiary font-medium">
          {rightLabel}
        </span>
      </div>
    </div>
  );
}
