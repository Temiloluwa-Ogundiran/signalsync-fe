import { X, Plus, RefreshCw, Trash2, Briefcase, CreditCard } from "lucide-react";
import type { Account } from "../types";

export function ManageAccountsModal({
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
