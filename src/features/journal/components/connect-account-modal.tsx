"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, X, RefreshCw, FileUp, CopyPlus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ConnectAccountForm } from "./connect-account-form";
import { CSVImportWizard } from "./csv-import/csv-import-wizard";
import { useJournalUiStore } from "../store/journal-ui-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JournalAccount } from "../types";
import { getAccountSyncStatus } from "../lib/account-sync-status";

export function ConnectAccountModal() {
  const connectModalOpen = useJournalUiStore((s) => s.connectModalOpen);
  const setConnectModalOpen = useJournalUiStore((s) => s.setConnectModalOpen);
  const csvReimportAccountId = useJournalUiStore((s) => s.csvReimportAccountId);

  return (
    <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
      {connectModalOpen && (
        // Remount on each open (and when the reimport target changes) so the
        // step state initializes fresh without a cascading-render effect.
        <ConnectAccountFlow key={csvReimportAccountId ?? "new"} />
      )}
    </Dialog>
  );
}

type ImportMethod = "api" | "csv" | "manual";

const METHODS: {
  id: ImportMethod;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  recommended?: boolean;
  disabled?: boolean;
}[] = [
  {
    id: "api",
    icon: RefreshCw,
    title: "Auto-sync",
    description: "Connect your broker",
    recommended: true,
  },
  {
    id: "csv",
    icon: FileUp,
    title: "File upload",
    description: "Upload broker-provided file with your trading history",
  },
  {
    id: "manual",
    icon: CopyPlus,
    title: "Add manually",
    description: "Add your trades one by one with our interface",
    disabled: true,
  },
];

function ConnectAccountFlow() {
  const setConnectModalOpen = useJournalUiStore((s) => s.setConnectModalOpen);
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);
  const csvReimportAccountId = useJournalUiStore((s) => s.csvReimportAccountId);

  // When reimporting into an existing account we skip method selection and go
  // straight to the CSV form.
  const [step, setStep] = useState<"method" | "form">(
    csvReimportAccountId ? "form" : "method",
  );
  const [selected, setSelected] = useState<ImportMethod | null>(
    csvReimportAccountId ? "csv" : null,
  );
  // Track the CSV wizard's internal step so we can label the progress bar.
  const [wizardStep, setWizardStep] = useState<
    "upload" | "preview" | "confirm"
  >("upload");

  const close = () => setConnectModalOpen(false);

  const handleSuccess = (account: JournalAccount) => {
    setActiveAccountId(account.id);
    setConnectModalOpen(false);

    if (selected === "csv") {
      // Toasts handled by the wizard.
      return;
    }

    const syncStatus = getAccountSyncStatus(account);

    if (syncStatus.code === "bootstrapping") {
      toast.info("Account verified", {
        description: "Trade history is importing in the background.",
      });
    } else if (syncStatus.code === "pending_verification") {
      toast.info("Account added", {
        description:
          "Verification has started. We will update the account status in the background.",
      });
    } else if (syncStatus.severity === "error") {
      toast.error(syncStatus.headline, { description: syncStatus.detail });
    } else if (syncStatus.severity === "warning") {
      toast.warning(syncStatus.headline, { description: syncStatus.detail });
    } else if (syncStatus.code === "ready_empty") {
      toast.info(syncStatus.headline, { description: syncStatus.detail });
    } else {
      toast.success("Account connected", {
        description: "Your trading account has been successfully connected.",
      });
    }
  };

  const goBack = () => {
    if (step === "form" && !csvReimportAccountId) {
      setStep("method");
      setSelected(null);
    } else {
      close();
    }
  };

  // Progress: method selection is step 1; the form is step 2 (the CSV wizard
  // sub-steps push it toward completion).
  const progress =
    step === "method"
      ? 0.15
      : selected === "csv"
        ? wizardStep === "upload"
          ? 0.4
          : wizardStep === "preview"
            ? 0.7
            : 0.9
        : 0.55;

  return (
    <DialogContent
      showCloseButton={false}
      overlayClassName="bg-bg-primary"
      className="fixed inset-0 left-0 top-0 z-50 grid h-screen w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_1fr] gap-0 rounded-none border-0 bg-bg-primary p-0 ring-0 sm:max-w-none"
    >
      {/* Top bar: progress + back / close */}
      <div className="relative">
        <div className="h-1 w-full bg-bg-tertiary">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="absolute left-4 top-4 rounded-lg p-2 text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-2 text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto scrollbar-thin">
        <div
          className={cn(
            "mx-auto flex w-full flex-col items-center px-6 pb-16 pt-10",
            step === "form" && selected === "api"
              ? "max-w-5xl"
              : "max-w-2xl",
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            Add Trades
          </p>
          <DialogTitle className="mt-2 text-center text-3xl font-bold tracking-tight text-text-primary">
            {step === "method"
              ? "Select Import Method"
              : selected === "api"
                ? "Connect Trading Account"
                : selected === "csv"
                  ? csvReimportAccountId
                    ? "Import Trade History"
                    : "Upload Trade File"
                  : "Add Trades"}
          </DialogTitle>

          {/* The API form renders its own MetaTrader 5 panel, so skip the
              redundant centered logo there. */}
          {!(step === "form" && selected === "api") && (
            <div className="mt-6 flex flex-col items-center">
              <Image
                src="/brand/mt5.jpeg"
                alt="MetaTrader 5"
                width={48}
                height={48}
                className="h-12 w-12 object-contain mix-blend-multiply dark:mix-blend-screen"
              />
              <p className="mt-2 max-w-sm text-center text-sm text-text-secondary">
                Currently we only support{" "}
                <span className="font-semibold text-text-primary">
                  MetaTrader 5
                </span>{" "}
                accounts &mdash; more platforms coming soon.
              </p>
            </div>
          )}

          {step === "method" ? (
            <MethodSelector
              selected={selected}
              onSelect={setSelected}
              onContinue={() => {
                if (selected && selected !== "manual") setStep("form");
              }}
            />
          ) : (
            <div
              className={cn(
                "mt-10 w-full",
                selected === "api" ? "max-w-5xl" : "max-w-xl",
              )}
            >
              {selected === "api" ? (
                <ConnectAccountForm onSuccess={handleSuccess} />
              ) : (
                <CSVImportWizard
                  reimportAccountId={csvReimportAccountId}
                  onSuccess={handleSuccess}
                  onStepChange={(s) => setWizardStep(s)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

function MethodSelector({
  selected,
  onSelect,
  onContinue,
}: {
  selected: ImportMethod | null;
  onSelect: (m: ImportMethod) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {METHODS.map((method) => {
          const isSelected = selected === method.id;
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              type="button"
              disabled={method.disabled}
              onClick={() => onSelect(method.id)}
              className={cn(
                "group relative flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition-all duration-150",
                isSelected
                  ? "border-accent bg-bg-tertiary ring-2 ring-accent/40"
                  : "border-black/10 bg-bg-tertiary hover:border-accent/60 hover:brightness-110 dark:border-white/10",
                method.disabled &&
                  "cursor-not-allowed opacity-50 hover:border-black/10 hover:brightness-100 dark:hover:border-white/10",
              )}
            >
              {method.recommended && (
                <span className="absolute left-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                  Recommended
                </span>
              )}
              {method.disabled && (
                <span className="absolute right-3 top-3 rounded-full border border-border-primary bg-bg-tertiary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Soon
                </span>
              )}
              {isSelected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <span
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                  isSelected
                    ? "bg-accent text-accent-foreground"
                    : "bg-card-bg text-text-secondary group-hover:text-text-primary",
                )}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-base font-bold text-text-primary">
                {method.title}
              </span>
              <span className="text-xs leading-relaxed text-text-tertiary">
                {method.description}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!selected || selected === "manual"}
        className="mt-10 w-full max-w-md rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-bg-tertiary disabled:text-text-tertiary"
      >
        Continue
      </button>
    </>
  );
}
