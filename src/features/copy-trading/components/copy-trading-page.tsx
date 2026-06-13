"use client";

import { useState } from "react";
import {
  PauseCircle,
  Activity,
  TrendingUp,
  Shield,
  Wifi,
  MoreVertical,
  Plus,
  ChevronDown,
  CreditCard,
  Briefcase,
  Check,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "./stat-card";
import { CopyStreamCard } from "./copy-stream-card";
import { ManageAccountsModal } from "./manage-accounts-modal";
import { StreamSettingsModal } from "./stream-settings-modal";
import {
  MOCK_ACCOUNTS,
  MOCK_STREAMS,
  MOCK_TRADES,
  type Account,
  type MockStream,
} from "../types";

export function CopyTradingPage() {
  const [activeTab, setActiveTab] = useState<"trades" | "streams" | "risk">(
    "trades",
  );
  const [selectedAccount, setSelectedAccount] = useState<Account>(
    MOCK_ACCOUNTS[0],
  );
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isManageAccountsOpen, setIsManageAccountsOpen] = useState(false);
  const [activeStreamSettings, setActiveStreamSettings] =
    useState<MockStream | null>(null);

  const filteredTrades = MOCK_TRADES.filter(
    (t) => t.accountId === selectedAccount.id,
  );

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 relative">
      {/* Account Selector & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative">
          <button
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className="flex items-center space-x-3 bg-card-bg border border-border-primary hover:border-accent/30 rounded-xl px-4 py-3 shadow-sm transition-all min-w-[260px]"
          >
            <div
              className={`p-2 rounded-lg ${selectedAccount.type === "Prop" ? "bg-indigo-500/10 text-indigo-400" : "bg-accent-light text-accent"}`}
            >
              {selectedAccount.type === "Prop" ? (
                <Briefcase className="h-5 w-5" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )}
            </div>
            <div className="text-left flex-1">
              <p className="text-xs text-text-tertiary font-bold uppercase tracking-wide">
                Active Account
              </p>
              <p className="text-sm font-bold text-text-primary">
                {selectedAccount.name}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-text-tertiary transition-transform ${isAccountDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isAccountDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-card-bg rounded-xl shadow-xl border border-border-primary z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-2 border-b border-border-primary">
                <p className="px-3 py-2 text-xs font-bold text-text-tertiary uppercase">
                  Switch Account
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {MOCK_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      setSelectedAccount(acc);
                      setIsAccountDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-bg-tertiary transition-colors ${selectedAccount.id === acc.id ? "bg-accent-light" : ""}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-2 w-2 rounded-full ${acc.status === "connected" ? "bg-success" : "bg-text-tertiary"}`}
                      />
                      <div className="text-left">
                        <p
                          className={`text-sm font-bold ${selectedAccount.id === acc.id ? "text-accent" : "text-text-primary"}`}
                        >
                          {acc.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {acc.broker} • {acc.balance}
                        </p>
                      </div>
                    </div>
                    {selectedAccount.id === acc.id && (
                      <Check className="h-4 w-4 text-accent" />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-border-primary bg-bg-tertiary">
                <button
                  onClick={() => {
                    setIsAccountDropdownOpen(false);
                    setIsManageAccountsOpen(true);
                  }}
                  className="w-full text-center text-sm font-bold text-accent hover:text-accent-hover py-2 rounded-lg hover:bg-accent-light transition-colors"
                >
                  Manage Accounts
                </button>
              </div>
            </div>
          )}
          {isAccountDropdownOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsAccountDropdownOpen(false)}
            />
          )}
        </div>

        <button className="w-full md:w-auto flex items-center justify-center space-x-2 bg-danger-light text-danger border border-danger/20 hover:bg-danger/10 hover:border-danger/30 px-6 py-3 rounded-xl font-bold transition-all shadow-sm">
          <PauseCircle className="h-5 w-5" />
          <span>PAUSE ALL COPYING</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total P/L (Today)"
          value="+$520.00"
          trend="up"
          subValue="+2.4% Account Growth"
        />
        <StatCard label="Total P/L (All Time)" value="+$3,450.20" trend="up" />
        <StatCard
          label="Active Trades"
          value={`${filteredTrades.length}`}
          subValue="Exposure: 12%"
        />
        <StatCard label="Copied Streams" value="2 / 5" subValue="3 Paused" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Copied Streams */}
        <div
          className={`lg:col-span-3 flex flex-col gap-4 ${activeTab !== "streams" ? "hidden lg:flex" : "flex"}`}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center">
              <Activity className="h-4 w-4 mr-2" /> Copied Streams
            </h2>
            <button className="p-1 hover:bg-bg-tertiary rounded text-text-tertiary">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {MOCK_STREAMS.map((stream) => (
              <CopyStreamCard
                key={stream.id}
                stream={stream}
                onOpenSettings={() => setActiveStreamSettings(stream)}
              />
            ))}
            <button className="w-full border-2 border-dashed border-border-primary rounded-xl p-4 flex flex-col items-center justify-center text-text-tertiary hover:border-accent/30 hover:text-accent hover:bg-accent-light transition-all group">
              <Plus className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Discover New Streams</span>
            </button>
          </div>
        </div>

        {/* Center: Active Trades */}
        <div
          className={`lg:col-span-6 flex flex-col ${activeTab !== "trades" ? "hidden lg:flex" : "flex"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" /> Trade History
            </h2>
            <span className="bg-success-light text-success text-xs px-2 py-0.5 rounded-full font-bold flex items-center animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />{" "}
              Live
            </span>
          </div>
          <div className="bg-card-bg rounded-2xl border border-border-primary shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            {filteredTrades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-bg-tertiary text-text-tertiary font-semibold border-b border-border-primary">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">
                        Stream / Pair
                      </th>
                      <th className="px-4 py-3 text-center">Side</th>
                      <th className="px-4 py-3 text-right hidden sm:table-cell">
                        Entry
                      </th>
                      <th className="px-4 py-3 text-right">Close</th>
                      <th className="px-4 py-3 text-right">P/L</th>
                      <th className="px-4 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary">
                    {filteredTrades.map((trade) => (
                      <tr
                        key={trade.id}
                        className="hover:bg-bg-tertiary transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-text-primary">
                            {trade.pair}
                          </div>
                          <div className="text-xs text-text-tertiary">
                            {trade.stream}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${trade.type === "BUY" ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}
                          >
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-text-secondary hidden sm:table-cell font-mono">
                          {trade.entry}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-text-primary">
                          {trade.current}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div
                            className={`font-bold ${trade.pl.startsWith("+") ? "text-success" : "text-danger"}`}
                          >
                            {trade.pl}
                          </div>
                          <div
                            className={`text-xs ${trade.pl.startsWith("+") ? "text-success" : "text-danger"}`}
                          >
                            {trade.plPercent}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-text-tertiary hover:text-text-secondary">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary p-8">
                <div className="h-16 w-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-text-tertiary" />
                </div>
                <p className="font-medium">No active trades</p>
                <p className="text-sm mt-1">
                  Switch accounts to see other trades.
                </p>
              </div>
            )}
            <div className="mt-auto bg-bg-tertiary p-3 text-xs text-text-tertiary border-t border-border-primary flex justify-between items-center">
              <span>Account: {selectedAccount.name}</span>
              <div className="flex space-x-4">
                <span>TP: Take Profit</span>
                <span>SL: Stop Loss</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Risk */}
        <div
          className={`lg:col-span-3 flex flex-col gap-4 ${activeTab !== "risk" ? "hidden lg:flex" : "flex"}`}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center">
              <Shield className="h-4 w-4 mr-2" /> Global Risk
            </h2>
            <div
              className={`flex items-center text-xs font-bold ${selectedAccount.status === "connected" ? "text-success" : "text-danger"}`}
            >
              <Wifi className="h-3 w-3 mr-1" />{" "}
              {selectedAccount.status === "connected"
                ? "Connected"
                : "Disconnected"}
            </div>
          </div>
          <div className="bg-card-bg p-5 rounded-2xl border border-border-primary shadow-sm space-y-6">
            <div className="pb-4 border-b border-border-primary">
              <p className="text-xs text-text-tertiary mb-1 uppercase font-bold">
                Applying to
              </p>
              <p className="text-sm font-bold text-text-primary truncate">
                {selectedAccount.name}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                Risk Per Trade
              </label>
              <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border-primary bg-bg-tertiary text-text-tertiary text-sm">
                  <DollarSign className="h-3 w-3" />
                </span>
                <input
                  type="number"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-border-primary bg-card-bg text-text-primary text-sm focus:ring-accent focus:border-accent"
                  defaultValue={50}
                />
              </div>
              <p className="mt-1 text-[10px] text-text-tertiary">
                Fixed amount per opened position.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                Max Open Trades
              </label>
              <select className="block w-full pl-3 pr-10 py-2 text-sm border-border-primary bg-card-bg text-text-primary border rounded-md focus:outline-none focus:ring-accent focus:border-accent">
                <option>3 Trades</option>
                <option>5 Trades</option>
                <option>10 Trades</option>
                <option>Unlimited (Risky)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                Max Daily Loss
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AlertTriangle className="h-3 w-3 text-danger" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 border border-border-primary bg-card-bg text-text-primary rounded-md text-sm focus:outline-none focus:ring-danger focus:border-danger"
                  defaultValue="$200"
                />
              </div>
              <p className="mt-1 text-[10px] text-text-tertiary">
                Copying pauses if loss exceeds this.
              </p>
            </div>
            <div className="pt-4 border-t border-border-primary">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">
                  Auto-Approve
                </span>
                <button className="bg-success relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors">
                  <span className="translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition" />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-text-tertiary leading-tight">
                Trades execute automatically. Turn off to manually approve
                signals.
              </p>
            </div>
            <button className="w-full bg-text-primary text-bg-primary font-bold py-2 rounded-lg text-sm hover:opacity-80 transition-opacity">
              Save Global Settings
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden fixed bottom-16 left-0 w-full bg-card-bg border-t border-border-primary p-2 z-40 flex justify-around">
        {(["streams", "trades", "risk"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize ${activeTab === tab ? "bg-accent-light text-accent" : "text-text-tertiary"}`}
          >
            {tab === "trades" ? "Active Trades" : tab}
          </button>
        ))}
      </div>

      <ManageAccountsModal
        isOpen={isManageAccountsOpen}
        onClose={() => setIsManageAccountsOpen(false)}
        accounts={MOCK_ACCOUNTS}
      />
      <StreamSettingsModal
        isOpen={!!activeStreamSettings}
        onClose={() => setActiveStreamSettings(null)}
        stream={activeStreamSettings}
        accounts={MOCK_ACCOUNTS}
      />
    </div>
  );
}
