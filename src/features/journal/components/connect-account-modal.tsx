"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConnectAccountForm } from "./connect-account-form";
import { CSVImportWizard } from "./csv-import/csv-import-wizard";
import { useJournalUiStore } from "../store/journal-ui-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JournalAccount } from "../types";

export function ConnectAccountModal() {
  const connectModalOpen = useJournalUiStore((s) => s.connectModalOpen);
  const setConnectModalOpen = useJournalUiStore((s) => s.setConnectModalOpen);
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);
  const csvReimportAccountId = useJournalUiStore((s) => s.csvReimportAccountId);

  const [activeTab, setActiveTab] = useState<"api" | "csv">("api");
  const [wizardStep, setWizardStep] = useState<"upload" | "preview" | "confirm">("upload");

  // Force active tab to "csv" when re-importing
  useEffect(() => {
    if (connectModalOpen) {
      if (csvReimportAccountId) {
        setActiveTab("csv");
      } else {
        setActiveTab("api");
      }
      setWizardStep("upload"); // Reset step on modal open
    }
  }, [csvReimportAccountId, connectModalOpen]);

  const handleSuccess = (account: JournalAccount) => {
    setActiveAccountId(account.id);
    setConnectModalOpen(false);

    if (activeTab === "csv") {
      // Don't show redundant toasts if they are handled by the wizard
      return;
    }

    if (account.connection_state === "bootstrap_failed") {
      toast.warning("Account connected with warning", {
        description:
          "Account was verified, but history sync failed. You can retry syncing manually.",
      });
    } else {
      toast.success("Account connected", {
        description: "Your trading account has been successfully connected.",
      });
    }
  };

  const isPreviewStep = activeTab === "csv" && wizardStep === "preview";

  return (
    <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
      <DialogContent
        className={cn(
          "border border-border-primary bg-card-bg max-h-[90vh] overflow-y-auto scrollbar-thin transition-all duration-300",
          isPreviewStep ? "sm:max-w-xl md:max-w-4xl" : "sm:max-w-xl"
        )}
      >
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-text-primary">
            {csvReimportAccountId
              ? "Import Trade History"
              : activeTab === "api"
              ? "Connect Trading Account"
              : "Connect via File Import"}
          </DialogTitle>
          <DialogDescription className="text-text-secondary text-xs">
            {csvReimportAccountId
              ? "Ingest more trade data from an MT5 XLSX report file."
              : activeTab === "api"
              ? "Add your MT5 investor credentials to start automatic syncs."
              : "Upload your trading platform export report to import your trades."}
          </DialogDescription>
        </DialogHeader>

        {/* Custom Tab Switcher */}
        {!csvReimportAccountId && (
          <div className="grid grid-cols-2 gap-1 bg-bg-secondary/60 p-1 rounded-xl border border-border-primary/50 mb-4">
            <button
              onClick={() => setActiveTab("api")}
              className={`py-2 px-3 text-xs font-bold rounded-lg uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                activeTab === "api"
                  ? "bg-card-bg border border-border-primary text-text-primary shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              ⚡ API Connection
            </button>
            <button
              onClick={() => setActiveTab("csv")}
              className={`py-2 px-3 text-xs font-bold rounded-lg uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                activeTab === "csv"
                  ? "bg-card-bg border border-border-primary text-text-primary shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              📄 File Import
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-2">
          {activeTab === "api" ? (
            <ConnectAccountForm onSuccess={handleSuccess} />
          ) : (
            <CSVImportWizard
              reimportAccountId={csvReimportAccountId}
              onSuccess={handleSuccess}
              onStepChange={(step) => setWizardStep(step)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
