import { Settings } from "lucide-react";
import type { MockStream } from "../types";

export function CopyStreamCard({
  stream,
  onOpenSettings,
}: {
  stream: MockStream;
  onOpenSettings: () => void;
}) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 group ${stream.status === "active" ? "bg-card-bg border-border-primary hover:border-accent/30" : "bg-bg-tertiary border-border-primary opacity-75"}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-text-primary text-sm">{stream.name}</h3>
          <p className="text-xs text-text-secondary">{stream.owner}</p>
        </div>
        <div
          className={`h-2 w-2 rounded-full ${stream.status === "active" ? "bg-success animate-pulse" : "bg-text-tertiary"}`}
        />
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {stream.tags.map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 bg-bg-tertiary text-text-tertiary text-[10px] font-medium rounded uppercase"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-primary">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-tertiary uppercase font-bold">
            Profit
          </span>
          <span
            className={`text-xs font-bold ${stream.profit.startsWith("+") ? "text-success" : "text-danger"}`}
          >
            {stream.profit}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-text-tertiary hover:text-accent hover:bg-accent-light rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${stream.status === "active" ? "bg-accent" : "bg-bg-tertiary"}`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${stream.status === "active" ? "translate-x-5" : "translate-x-1"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
