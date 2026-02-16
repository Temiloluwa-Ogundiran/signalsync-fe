"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Edit3,
  Save,
  Image as ImageIcon,
  Smile,
  Frown,
  Meh,
  CheckCircle2,
  X,
} from "lucide-react";

// --- Types & Data ---

interface DayStat {
  date: number;
  pnl: number;
  trades: number;
  winRate: number;
  hasJournal: boolean;
}
interface Trade {
  id: string;
  pair: string;
  type: "BUY" | "SELL";
  time: string;
  pnl: number;
  rr: number;
  status: "WIN" | "LOSS" | "BE";
  journaled: boolean;
}

const MONTH_STATS = {
  month: "October",
  year: 2023,
  netPnl: 4250.5,
  winRate: 68,
  profitFactor: 2.1,
  trades: 42,
};

const CALENDAR: Record<number, DayStat> = {
  2: { date: 2, pnl: 240, trades: 3, winRate: 66, hasJournal: true },
  3: { date: 3, pnl: -120, trades: 2, winRate: 0, hasJournal: true },
  4: { date: 4, pnl: 560, trades: 4, winRate: 75, hasJournal: false },
  5: { date: 5, pnl: 110, trades: 1, winRate: 100, hasJournal: true },
  6: { date: 6, pnl: -50, trades: 5, winRate: 40, hasJournal: false },
  9: { date: 9, pnl: 890, trades: 2, winRate: 100, hasJournal: true },
  10: { date: 10, pnl: -320, trades: 4, winRate: 25, hasJournal: true },
  11: { date: 11, pnl: 120, trades: 2, winRate: 50, hasJournal: false },
  12: { date: 12, pnl: 450, trades: 3, winRate: 66, hasJournal: true },
  16: { date: 16, pnl: 210, trades: 2, winRate: 100, hasJournal: true },
  17: { date: 17, pnl: -150, trades: 3, winRate: 33, hasJournal: true },
  18: { date: 18, pnl: 670, trades: 5, winRate: 80, hasJournal: true },
};

const DAY_TRADES: Trade[] = [
  {
    id: "t1",
    pair: "XAUUSD",
    type: "BUY",
    time: "09:30",
    pnl: 350,
    rr: 2.5,
    status: "WIN",
    journaled: true,
  },
  {
    id: "t2",
    pair: "GBPUSD",
    type: "SELL",
    time: "11:15",
    pnl: -110,
    rr: -1,
    status: "LOSS",
    journaled: false,
  },
  {
    id: "t3",
    pair: "US30",
    type: "BUY",
    time: "14:00",
    pnl: 0,
    rr: 0,
    status: "BE",
    journaled: false,
  },
];

// --- Equity Curve ---
function EquityCurve() {
  const bars = [20, 35, 30, 50, 45, 60, 55, 75, 70, 90, 85, 100];
  return (
    <div className="h-24 flex items-end space-x-1 mt-4 px-2">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-bg-tertiary rounded-t-sm relative group cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div
            style={{ height: `${h}%` }}
            className={`w-full rounded-t-sm ${i === bars.length - 1 ? "bg-success" : "bg-accent"}`}
          />
        </div>
      ))}
    </div>
  );
}

// --- Trade Journal Modal ---
function TradeJournalModal({
  isOpen,
  onClose,
  trade,
}: {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
}) {
  if (!isOpen || !trade) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card-bg rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-primary flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              {trade.type === "BUY" ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-danger" />
              )}
              Journal {trade.pair}
            </h2>
            <p className="text-sm text-text-secondary">
              {trade.time} • P&L: ${trade.pnl}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-full text-text-tertiary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="border-2 border-dashed border-border-primary rounded-xl p-8 flex flex-col items-center justify-center text-text-tertiary hover:border-accent/30 hover:bg-accent-light transition-all cursor-pointer">
            <ImageIcon className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Upload Chart Screenshot</span>
            <span className="text-xs text-text-tertiary">
              Paste (Ctrl+V) or click to browse
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                Setup Strategy
              </label>
              <select className="w-full border-border-primary rounded-lg text-sm p-2.5 bg-bg-tertiary text-text-primary border focus:ring-accent focus:border-accent">
                <option>Select Strategy...</option>
                <option>Break &amp; Retest</option>
                <option>Supply &amp; Demand</option>
                <option>Fibonacci Retracement</option>
                <option>Impulse Entry</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                Mistakes Made
              </label>
              <select className="w-full border-border-primary rounded-lg text-sm p-2.5 bg-bg-tertiary text-text-primary border focus:ring-accent focus:border-accent">
                <option>None (Clean execution)</option>
                <option>FOMO Entry</option>
                <option>Moved Stop Loss</option>
                <option>Oversized Position</option>
                <option>Revenge Trade</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
              Emotions
            </label>
            <div className="flex gap-4">
              {[
                {
                  icon: Smile,
                  label: "Confident",
                  hover: "hover:bg-success-light hover:border-success/20",
                },
                {
                  icon: Meh,
                  label: "Neutral",
                  hover: "hover:bg-info-light hover:border-info/20",
                },
                {
                  icon: Frown,
                  label: "Anxious",
                  hover: "hover:bg-danger-light hover:border-danger/20",
                },
              ].map(({ icon: Icon, label, hover }) => (
                <button
                  key={label}
                  className={`flex-1 py-3 border border-border-primary rounded-xl flex flex-col items-center justify-center gap-1 group transition-all ${hover}`}
                >
                  <Icon className="h-6 w-6 text-text-tertiary group-hover:text-text-primary" />
                  <span className="text-xs font-medium text-text-tertiary group-hover:text-text-primary">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
              Trade Notes
            </label>
            <textarea
              className="w-full border border-border-primary rounded-xl p-4 text-sm bg-bg-tertiary text-text-primary focus:bg-card-bg focus:ring-2 focus:ring-accent/30 outline-none h-32 resize-none"
              placeholder="Why did you take this trade? What did the market do?"
            />
          </div>
        </div>
        <div className="p-6 border-t border-border-primary flex justify-end gap-3 bg-bg-tertiary">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-text-secondary font-bold hover:bg-bg-tertiary rounded-xl transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors text-sm flex items-center"
          >
            <Save className="h-4 w-4 mr-2" /> Save Journal
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main ---

export default function JournalPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(4);
  const [journalingTrade, setJournalingTrade] = useState<Trade | null>(null);
  const [activeTab, setActiveTab] = useState<"daily" | "trades">("daily");

  const daysInMonth = 31;
  const calendarCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const selectedStats = selectedDay ? CALENDAR[selectedDay] : null;

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      {/* Header & Stats */}
      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-text-primary">
              Trading Journal
            </h1>
            <div className="flex items-center bg-card-bg border border-border-primary rounded-lg p-1 shadow-sm">
              <button className="p-1 hover:bg-bg-tertiary rounded text-text-tertiary">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 font-bold text-sm text-text-primary">
                October 2023
              </span>
              <button className="p-1 hover:bg-bg-tertiary rounded text-text-tertiary">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="text-text-secondary">
            Consistently review your performance to build discipline.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {[
            {
              label: "Net P&L",
              value: `+$${MONTH_STATS.netPnl.toLocaleString()}`,
              color: "text-success",
            },
            {
              label: "Win Rate",
              value: `${MONTH_STATS.winRate}%`,
              color: "text-info",
            },
            {
              label: "Profit Factor",
              value: `${MONTH_STATS.profitFactor}`,
              color: "text-text-primary",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-card-bg p-4 rounded-xl border border-border-primary shadow-sm min-w-[140px]"
            >
              <div className="text-xs font-bold text-text-tertiary uppercase mb-1">
                {label}
              </div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-card-bg rounded-2xl border border-border-primary shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border-primary bg-bg-tertiary">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-xs font-bold text-text-tertiary uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 bg-border-primary gap-px border-b border-border-primary">
              {calendarCells.map((day) => {
                const stats = CALENDAR[day];
                const isSelected = day === selectedDay;
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`bg-card-bg h-32 md:h-40 p-2 md:p-3 relative cursor-pointer transition-all hover:bg-bg-tertiary ${isSelected ? "ring-2 ring-inset ring-accent z-10" : ""}`}
                  >
                    <span
                      className={`text-sm font-medium ${isSelected ? "text-accent" : "text-text-tertiary"}`}
                    >
                      {day}
                    </span>
                    {stats && (
                      <div className="flex flex-col h-full justify-center items-center pb-4">
                        <span
                          className={`text-sm md:text-base font-bold mb-1 ${stats.pnl >= 0 ? "text-success" : "text-danger"}`}
                        >
                          {stats.pnl >= 0 ? "+" : ""}${Math.abs(stats.pnl)}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${stats.pnl >= 0 ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}
                          >
                            {stats.pnl >= 0 ? "WIN" : "LOSS"}
                          </span>
                          {stats.hasJournal && (
                            <div
                              className="h-1.5 w-1.5 rounded-full bg-accent"
                              title="Journal Entry"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Equity Curve */}
          <div className="bg-card-bg rounded-2xl border border-border-primary shadow-sm p-6 hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide flex items-center">
                <Activity className="h-4 w-4 mr-2 text-accent" /> Performance
                Curve
              </h3>
              <button className="text-xs font-medium text-text-tertiary hover:text-accent">
                View Full Analytics
              </button>
            </div>
            <EquityCurve />
          </div>
        </div>

        {/* Day Details Panel */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 sticky top-24">
          {selectedDay ? (
            <div className="bg-card-bg rounded-2xl border border-border-primary shadow-sm overflow-hidden flex flex-col min-h-[600px]">
              <div className="p-6 border-b border-border-primary bg-bg-tertiary/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">
                      October {selectedDay}
                    </h2>
                    <p className="text-sm text-text-secondary">Daily Summary</p>
                  </div>
                  {selectedStats ? (
                    <div
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${selectedStats.pnl >= 0 ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}
                    >
                      {selectedStats.pnl >= 0 ? "+" : ""}$
                      {Math.abs(selectedStats.pnl)}
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-bg-tertiary text-text-tertiary text-xs font-bold uppercase">
                      No Trades
                    </span>
                  )}
                </div>
                {selectedStats && (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        label: "Trades",
                        value: selectedStats.trades,
                        color: "text-text-primary",
                      },
                      {
                        label: "Win Rate",
                        value: `${selectedStats.winRate}%`,
                        color: "text-info",
                      },
                      { label: "PnL %", value: "+1.2%", color: "text-success" },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        className="bg-card-bg p-2 rounded-lg border border-border-primary text-center"
                      >
                        <div className="text-[10px] text-text-tertiary font-bold uppercase">
                          {label}
                        </div>
                        <div className={`text-sm font-bold ${color}`}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border-primary">
                {(["daily", "trades"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === tab ? "border-accent text-accent" : "border-transparent text-text-tertiary hover:text-text-secondary"}`}
                  >
                    {tab === "daily"
                      ? "Daily Journal"
                      : `Trades (${selectedStats?.trades || 0})`}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto max-h-[500px]">
                {activeTab === "daily" && (
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase">
                        Daily Reflection
                      </label>
                      <div className="relative group">
                        <textarea
                          className="w-full h-40 p-4 rounded-xl bg-bg-tertiary border border-border-primary text-sm text-text-primary focus:ring-2 focus:ring-accent/30 focus:bg-card-bg transition-all resize-none"
                          placeholder="How did you feel today? Did you follow your plan?"
                          defaultValue={
                            selectedStats?.hasJournal
                              ? "Market was choppy in the morning. I stayed patient and waited for the NY open volatility. Caught a nice move on Gold but gave some back on GBPUSD due to impatience."
                              : ""
                          }
                        />
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-2 bg-accent text-white rounded-lg shadow-md hover:bg-accent-hover transition-colors"
                            title="Save Journal"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase">
                        Daily Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs font-bold border border-indigo-500/20">
                          #Disciplined
                        </span>
                        <span className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded-md text-xs font-bold border border-orange-500/20">
                          #ChoppyMarket
                        </span>
                        <button className="px-2 py-1 bg-bg-tertiary text-text-tertiary rounded-md text-xs font-bold border border-border-primary hover:bg-bg-secondary transition-colors">
                          + Add Tag
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "trades" && (
                  <div className="divide-y divide-border-primary">
                    {selectedStats ? (
                      DAY_TRADES.map((trade) => (
                        <div
                          key={trade.id}
                          className="p-4 hover:bg-bg-tertiary transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded ${trade.type === "BUY" ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}
                              >
                                {trade.type}
                              </span>
                              <span className="font-bold text-text-primary text-sm">
                                {trade.pair}
                              </span>
                              <span className="text-xs text-text-tertiary font-mono">
                                {trade.time}
                              </span>
                            </div>
                            <div
                              className={`text-sm font-bold ${trade.pnl >= 0 ? "text-success" : "text-danger"}`}
                            >
                              {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-text-secondary">
                              <span>
                                R:R{" "}
                                <strong className="text-text-primary">
                                  {trade.rr}
                                </strong>
                              </span>
                              <span
                                className={`font-bold ${trade.status === "WIN" ? "text-success" : trade.status === "LOSS" ? "text-danger" : "text-text-tertiary"}`}
                              >
                                {trade.status}
                              </span>
                            </div>
                            <button
                              onClick={() => setJournalingTrade(trade)}
                              className={`flex items-center text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${trade.journaled ? "bg-accent-light text-accent border-accent/20 hover:bg-accent/20" : "bg-card-bg text-text-secondary border-border-primary hover:border-accent/30 hover:text-accent"}`}
                            >
                              {trade.journaled ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />{" "}
                                  Journaled
                                </>
                              ) : (
                                <>
                                  <Edit3 className="h-3 w-3 mr-1" /> Journal
                                  Trade
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-text-tertiary text-sm">
                        No trades recorded for this day.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card-bg rounded-2xl border border-dashed border-border-primary p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="h-16 w-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="h-8 w-8 text-text-tertiary" />
              </div>
              <h3 className="font-bold text-text-primary">No Day Selected</h3>
              <p className="text-sm text-text-secondary mt-2 max-w-xs">
                Select a day on the calendar to view daily performance and
                journal entries.
              </p>
            </div>
          )}
        </div>
      </div>

      <TradeJournalModal
        isOpen={!!journalingTrade}
        onClose={() => setJournalingTrade(null)}
        trade={journalingTrade}
      />
    </div>
  );
}
