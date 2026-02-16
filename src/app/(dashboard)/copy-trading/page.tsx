"use client";

import { useState } from "react";
import {
  PauseCircle,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Activity,
  DollarSign,
  Wifi,
  MoreVertical,
  Plus,
  ChevronDown,
  CreditCard,
  Briefcase,
  Check,
  X,
  RefreshCw,
  Trash2,
  Save,
  Power,
  Filter,
  Layers,
} from "lucide-react";

// --- Types & Mock Data ---

interface Account {
  id: string;
  name: string;
  broker: string;
  type: "Prop" | "Personal";
  balance: string;
  status: "connected" | "disconnected";
}

const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc1",
    name: "FTMO #18292",
    broker: "FTMO",
    type: "Prop",
    balance: "$102,450.00",
    status: "connected",
  },
  {
    id: "acc2",
    name: "Personal IC Markets",
    broker: "IC Markets",
    type: "Personal",
    balance: "$4,240.50",
    status: "connected",
  },
  {
    id: "acc3",
    name: "MFF Phase 2",
    broker: "MFF",
    type: "Prop",
    balance: "$50,000.00",
    status: "disconnected",
  },
];

const MOCK_STREAMS = [
  {
    id: 1,
    name: "Gold Killers",
    owner: "Sarah Snipe",
    tags: ["Scalping", "Gold"],
    winRate: "78%",
    status: "active",
    profit: "+$1,240",
  },
  {
    id: 2,
    name: "London Alpha",
    owner: "Tom Trade",
    tags: ["Forex", "Swing"],
    winRate: "65%",
    status: "active",
    profit: "+$850",
  },
  {
    id: 3,
    name: "Crypto Whale",
    owner: "BitMan",
    tags: ["BTC", "Risk"],
    winRate: "45%",
    status: "paused",
    profit: "-$120",
  },
];

const MOCK_TRADES = [
  {
    id: 101,
    stream: "Gold Killers",
    pair: "XAUUSD",
    type: "BUY",
    entry: "2035.50",
    current: "2038.10",
    sl: "2032.00",
    tp: "2045.00",
    pl: "+$260.00",
    plPercent: "+1.2%",
    accountId: "acc1",
  },
  {
    id: 102,
    stream: "Gold Killers",
    pair: "XAUUSD",
    type: "BUY",
    entry: "2036.00",
    current: "2038.10",
    sl: "2033.00",
    tp: "2045.00",
    pl: "+$210.00",
    plPercent: "+0.9%",
    accountId: "acc1",
  },
  {
    id: 103,
    stream: "London Alpha",
    pair: "GBPUSD",
    type: "SELL",
    entry: "1.2650",
    current: "1.2640",
    sl: "1.2680",
    tp: "1.2600",
    pl: "+$100.00",
    plPercent: "+0.4%",
    accountId: "acc1",
  },
  {
    id: 104,
    stream: "London Alpha",
    pair: "EURUSD",
    type: "SELL",
    entry: "1.0850",
    current: "1.0860",
    sl: "1.0880",
    tp: "1.0800",
    pl: "-$50.00",
    plPercent: "-0.2%",
    accountId: "acc2",
  },
];

// --- Sub-Components (dark theme) ---

function StatCard({
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

function CopyStreamCard({
  stream,
  onOpenSettings,
}: {
  stream: (typeof MOCK_STREAMS)[0];
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

// --- Modals ---

function ManageAccountsModal({
  isOpen,
  onClose,
  accounts,
}: {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card-bg rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 border-b border-border-primary flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">
            Manage Accounts
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-full text-text-tertiary hover:text-text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between p-4 bg-bg-tertiary border border-border-primary rounded-xl"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-lg ${acc.type === "Prop" ? "bg-indigo-500/10 text-indigo-400" : "bg-success-light text-success"}`}
                >
                  {acc.type === "Prop" ? (
                    <Briefcase className="h-5 w-5" />
                  ) : (
                    <CreditCard className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-text-primary">{acc.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${acc.status === "connected" ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}
                    >
                      {acc.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {acc.broker} • {acc.balance}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {acc.status === "disconnected" ? (
                  <button className="flex items-center text-xs font-medium bg-card-bg border border-border-primary text-text-secondary px-3 py-2 rounded-lg hover:border-accent/30 hover:text-accent transition-colors">
                    <RefreshCw className="h-3 w-3 mr-1" /> Reconnect
                  </button>
                ) : (
                  <button className="text-text-tertiary hover:text-danger p-2 hover:bg-danger-light rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button className="w-full py-4 border-2 border-dashed border-border-primary rounded-xl flex items-center justify-center text-text-tertiary hover:text-accent hover:border-accent/30 hover:bg-accent-light transition-all font-medium">
            <Plus className="h-5 w-5 mr-2" /> Connect New Account
          </button>
        </div>
        <div className="p-6 bg-bg-tertiary border-t border-border-primary text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-text-primary text-bg-primary font-bold rounded-xl hover:opacity-80 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function StreamSettingsModal({
  isOpen,
  onClose,
  stream,
  accounts,
}: {
  isOpen: boolean;
  onClose: () => void;
  stream: (typeof MOCK_STREAMS)[0] | null;
  accounts: Account[];
}) {
  if (!isOpen || !stream) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card-bg rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border-primary flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {stream.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {stream.name}
              </h2>
              <p className="text-sm text-text-secondary">
                Managed by {stream.owner}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${stream.status === "active" ? "bg-success-light text-success" : "bg-bg-tertiary text-text-tertiary"}`}
                >
                  Status: {stream.status}
                </span>
                {stream.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs text-text-tertiary bg-bg-tertiary px-1.5 py-0.5 rounded border border-border-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-full text-text-tertiary hover:text-text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Account Targeting */}
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-3 flex items-center">
              <Layers className="h-4 w-4 mr-2 text-accent" /> Account Targeting
            </h3>
            <div className="bg-bg-tertiary rounded-xl p-4 border border-border-primary space-y-3">
              <p className="text-xs text-text-secondary mb-2">
                Select which accounts will copy trades from this stream.
              </p>
              {accounts.map((acc) => (
                <label
                  key={acc.id}
                  className="flex items-center p-3 bg-card-bg rounded-lg border border-border-primary cursor-pointer hover:border-accent/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-accent rounded border-border-primary focus:ring-accent"
                    defaultChecked={acc.status === "connected"}
                  />
                  <div className="ml-3 flex-1">
                    <span className="block text-sm font-bold text-text-primary">
                      {acc.name}
                    </span>
                    <span className="block text-xs text-text-secondary">
                      {acc.broker} - {acc.balance}
                    </span>
                  </div>
                  {acc.status === "connected" && (
                    <span className="text-xs font-bold text-success">
                      Active
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Risk & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-3 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-indigo-400" /> Risk
                Overrides
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Risk Per Trade
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      className="block w-full rounded-l-lg border-border-primary bg-card-bg border text-sm text-text-primary py-2 px-3 focus:ring-accent focus:border-accent"
                      placeholder="50"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-border-primary bg-bg-tertiary text-text-tertiary text-xs font-bold">
                      USD
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Max Daily Loss
                  </label>
                  <input
                    type="text"
                    className="block w-full rounded-lg border-border-primary bg-card-bg border text-sm text-text-primary py-2 px-3 focus:ring-accent focus:border-accent"
                    placeholder="$200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Lot Size Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="block w-full rounded-lg border-border-primary bg-card-bg border text-sm text-text-primary py-2 px-3 focus:ring-accent focus:border-accent"
                    defaultValue="1.0"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-3 flex items-center">
                <Filter className="h-4 w-4 mr-2 text-purple-400" /> Filters
                &amp; Execution
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Allowed Pairs
                  </label>
                  <div className="flex flex-wrap gap-2 p-2 bg-bg-tertiary border border-border-primary rounded-lg min-h-[42px]">
                    <span className="bg-card-bg border border-border-primary text-text-secondary text-xs px-2 py-1 rounded-md flex items-center">
                      XAUUSD{" "}
                      <X className="h-3 w-3 ml-1 cursor-pointer hover:text-danger" />
                    </span>
                    <span className="bg-card-bg border border-border-primary text-text-secondary text-xs px-2 py-1 rounded-md flex items-center">
                      GBPUSD{" "}
                      <X className="h-3 w-3 ml-1 cursor-pointer hover:text-danger" />
                    </span>
                    <button className="text-xs text-accent font-medium hover:underline">
                      + Add
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg border border-border-primary">
                  <div>
                    <span className="block text-sm font-bold text-text-primary">
                      Auto-Approve Trades
                    </span>
                    <span className="text-xs text-text-secondary">
                      Trades execute instantly.
                    </span>
                  </div>
                  <button className="bg-success relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors">
                    <span className="translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-bg-tertiary border-t border-border-primary flex items-center justify-between mt-auto">
          <button className="flex items-center text-danger hover:text-danger font-bold text-sm px-4 py-2 hover:bg-danger-light rounded-lg transition-colors">
            <Power className="h-4 w-4 mr-2" /> Stop Copying Stream
          </button>
          <div className="flex space-x-3">
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
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page (CopyTrading) ---

export default function CopyTradingPage() {
  const [activeTab, setActiveTab] = useState<"trades" | "streams" | "risk">(
    "trades",
  );
  const [selectedAccount, setSelectedAccount] = useState<Account>(
    MOCK_ACCOUNTS[0],
  );
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isManageAccountsOpen, setIsManageAccountsOpen] = useState(false);
  const [activeStreamSettings, setActiveStreamSettings] = useState<
    (typeof MOCK_STREAMS)[0] | null
  >(null);

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
