import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Sparkline } from "./sparkline";

export interface Asset {
  symbol: string;
  name: string;
  price: string;
  change: string;
  trend: "Bullish" | "Bearish" | "Neutral";
  data: number[];
}

export function MarketCard({ asset }: { asset: Asset }) {
  const isBullish = asset.trend === "Bullish";
  const isBearish = asset.trend === "Bearish";
  const color = isBullish ? "#10B981" : isBearish ? "#F43F5E" : "#64748B";

  return (
    <div className="bg-card-bg rounded-xl p-5 border border-border-primary shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-32 relative overflow-hidden">
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-sm font-bold text-text-primary">
            {asset.symbol}
          </h3>
          <p className="text-xs text-text-secondary font-medium">
            {asset.name}
          </p>
        </div>
        <div
          className={`flex items-center text-xs font-bold ${
            isBullish
              ? "text-success"
              : isBearish
                ? "text-danger"
                : "text-text-secondary"
          }`}
        >
          {isBullish && <ArrowUpRight className="h-3 w-3 mr-1" />}
          {isBearish && <ArrowDownRight className="h-3 w-3 mr-1" />}
          {asset.change}
        </div>
      </div>

      <div className="flex items-end justify-between z-10 mt-2">
        <div>
          <span className="text-xl font-bold text-text-primary tracking-tight">
            {asset.price}
          </span>
          <div
            className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded-full inline-block border ${
              isBullish
                ? "bg-success-light text-success border-success/20"
                : isBearish
                  ? "bg-danger-light text-danger border-danger/20"
                  : "bg-bg-tertiary text-text-secondary border-border-primary"
            }`}
          >
            {asset.trend}
          </div>
        </div>
        <div className="w-16 h-8 opacity-80">
          <Sparkline data={asset.data} color={color} />
        </div>
      </div>

      {/* Decorative background glow */}
      <div
        className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 pointer-events-none ${
          isBullish
            ? "bg-success"
            : isBearish
              ? "bg-danger"
              : "bg-text-secondary"
        }`}
      />
    </div>
  );
}
