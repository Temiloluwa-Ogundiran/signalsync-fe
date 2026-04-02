"use client";

import {
  ArrowUpRight,
  Activity,
  Sun,
  Calendar,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import {
  MarketCard,
  type Asset,
} from "@/features/dashboard/components/market-card";
import { SentimentMeter } from "@/features/dashboard/components/sentiment-meter";
import { useAiInsightModal } from "@/features/dashboard/components/ai-insight-modal-provider";

// --- Mock Data ---

const ASSETS: Asset[] = [
  {
    symbol: "DXY",
    name: "US Dollar Index",
    price: "104.25",
    change: "+0.12%",
    trend: "Bullish",
    data: [40, 45, 42, 50, 48, 55, 60],
  },
  {
    symbol: "EURUSD",
    name: "Euro / USD",
    price: "1.0845",
    change: "-0.08%",
    trend: "Bearish",
    data: [60, 55, 58, 50, 45, 40, 38],
  },
  {
    symbol: "GBPUSD",
    name: "British Pound",
    price: "1.2630",
    change: "+0.05%",
    trend: "Neutral",
    data: [45, 46, 45, 47, 46, 48, 48],
  },
  {
    symbol: "USDJPY",
    name: "USD / Yen",
    price: "150.10",
    change: "+0.25%",
    trend: "Bullish",
    data: [30, 35, 40, 45, 50, 55, 60],
  },
  {
    symbol: "XAUUSD",
    name: "Gold",
    price: "2,035.50",
    change: "-0.45%",
    trend: "Bearish",
    data: [70, 65, 60, 55, 50, 45, 40],
  },
  {
    symbol: "US30",
    name: "Dow Jones",
    price: "38,650",
    change: "+0.15%",
    trend: "Bullish",
    data: [50, 52, 55, 58, 60, 62, 65],
  },
  {
    symbol: "NAS100",
    name: "Nasdaq 100",
    price: "17,950",
    change: "-0.30%",
    trend: "Bearish",
    data: [80, 75, 70, 65, 60, 55, 50],
  },
  {
    symbol: "USOIL",
    name: "Crude Oil",
    price: "78.40",
    change: "+1.20%",
    trend: "Bullish",
    data: [20, 25, 30, 40, 50, 60, 70],
  },
];

const RECAP_POINTS = [
  "USD holding strength as Treasury yields tick higher pre-market.",
  "Gold rejected 2040 resistance level, consolidating near 2035 support.",
  "Asian equities closed mixed; Nikkei outperforms on continued weak Yen.",
  "Volatility remains compressed ahead of tomorrow's CPI data.",
];

const NEWS = [
  { time: "08:30", currency: "USD", event: "Core CPI m/m", impact: "High" },
  { time: "08:30", currency: "USD", event: "CPI y/y", impact: "High" },
  {
    time: "10:00",
    currency: "USD",
    event: "FOMC Member Bowman Speaks",
    impact: "Medium",
  },
  {
    time: "14:00",
    currency: "GBP",
    event: "Gov Bailey Speaks",
    impact: "High",
  },
];

const AI_SUGGESTIONS = [
  "Why is the market up today?",
  "Why can't BTC break $70k?",
  "Analyze Gold's rejection at 2040",
  "Impact of upcoming CPI data",
  "Is USD strength sustainable?",
  "Are altcoins outperforming Bitcoin?",
];

export default function OverviewPage() {
  const { open: openAiModal } = useAiInsightModal();

  const handleAiSuggestionClick = (topic: string) => {
    openAiModal(topic);
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* AI Suggestion Bar */}
      <div className="mb-6 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full text-xs font-bold shadow-sm shrink-0">
            <Sparkles className="h-3 w-3" />
            <span>Ask AI</span>
          </div>
          {AI_SUGGESTIONS.map((topic, i) => (
            <button
              key={i}
              onClick={() => handleAiSuggestionClick(topic)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-card-bg border border-border-primary hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-400 text-text-secondary rounded-full text-xs font-medium transition-all whitespace-nowrap shadow-sm group"
            >
              <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                <Lightbulb className="h-3 w-3" />
              </span>
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Market Dashboard
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Macro snapshot •{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-card-bg border border-border-primary rounded-lg px-3 py-1.5 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-bold text-text-secondary uppercase">
            London Session Open
          </span>
        </div>
      </div>

      {/* Section 1: Market Snapshot */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {ASSETS.map((asset) => (
          <MarketCard key={asset.symbol} asset={asset} />
        ))}
      </section>

      {/* Section 2: Session Recap Banner */}
      <section className="mb-8">
        <div className="bg-card-bg rounded-xl border-l-4 border-indigo-500 shadow-sm p-6 flex flex-col md:flex-row md:items-start gap-6">
          <div className="md:w-64 flex-shrink-0">
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Sun className="h-5 w-5" />
              <h2 className="font-bold text-lg">Asia Session Recap</h2>
            </div>
            <p className="text-xs text-text-tertiary uppercase font-bold tracking-wider">
              Briefing Note
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {RECAP_POINTS.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-text-tertiary flex-shrink-0" />
                <p className="text-sm text-text-secondary leading-relaxed font-medium">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections 3 & 4: Sentiment & News */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section 3: Sentiment Snapshot */}
        <section className="lg:col-span-5 bg-card-bg rounded-xl border border-border-primary shadow-sm p-6 h-full">
          <div className="flex items-center gap-2 mb-6 border-b border-border-primary pb-4">
            <Activity className="h-5 w-5 text-text-tertiary" />
            <h2 className="font-bold text-text-primary">Market Sentiment</h2>
          </div>

          <SentimentMeter
            label="USD Strength"
            value={75}
            leftLabel="Weak"
            rightLabel="Strong"
            color="bg-success"
          />
          <SentimentMeter
            label="Risk Appetite"
            value={40}
            leftLabel="Risk-Off"
            rightLabel="Risk-On"
            color="bg-info"
          />
          <SentimentMeter
            label="Retail Bias (EURUSD)"
            value={65}
            leftLabel="Short"
            rightLabel="Long"
            color="bg-indigo-500"
          />
          <SentimentMeter
            label="Volatility (VIX)"
            value={20}
            leftLabel="Low"
            rightLabel="High"
            color="bg-text-secondary"
          />
        </section>

        {/* Section 4: High Impact News */}
        <section className="lg:col-span-7 bg-card-bg rounded-xl border border-border-primary shadow-sm p-6 h-full">
          <div className="flex items-center gap-2 mb-6 border-b border-border-primary pb-4">
            <Calendar className="h-5 w-5 text-text-tertiary" />
            <h2 className="font-bold text-text-primary">
              High Impact Events (24h)
            </h2>
          </div>

          <div className="overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-tertiary uppercase font-bold bg-bg-tertiary">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Time</th>
                  <th className="px-4 py-3">Cur</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {NEWS.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-bg-tertiary transition-colors"
                  >
                    <td className="px-4 py-4 font-mono font-medium text-text-secondary">
                      {item.time}
                    </td>
                    <td className="px-4 py-4 font-bold text-text-primary">
                      {item.currency}
                    </td>
                    <td className="px-4 py-4 text-text-secondary font-medium">
                      {item.event}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.impact === "High"
                            ? "bg-danger-light text-danger"
                            : item.impact === "Medium"
                              ? "bg-warning-light text-warning"
                              : "bg-bg-tertiary text-text-secondary"
                        }`}
                      >
                        {item.impact}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-center">
              <button className="text-xs font-bold text-accent hover:text-accent-hover flex items-center justify-center w-full py-2 hover:bg-accent-light rounded-lg transition-colors">
                View Full Economic Calendar{" "}
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
