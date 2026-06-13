import { X, Layers, Shield, Filter, Power, Save } from "lucide-react";
import type { Account, MockStream } from "../types";

export function StreamSettingsModal({
  isOpen,
  onClose,
  stream,
  accounts,
}: {
  isOpen: boolean;
  onClose: () => void;
  stream: MockStream | null;
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
