"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  FileUp,
  Pencil,
  BadgeCheck,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ConnectAccountForm } from "./connect-account-form";
import { CSVImportWizard } from "./csv-import/csv-import-wizard";
import { useJournalUiStore } from "../store/journal-ui-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JournalAccount } from "../types";
import { getAccountSyncStatus } from "../lib/account-sync-status";
import { dashboardPathForAccount } from "../lib/account-navigation";

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
    title: "Connect your broker",
    description:
      "Securely link your account and let trades sync automatically.",
    recommended: true,
  },
  {
    id: "csv",
    icon: FileUp,
    title: "Upload a file",
    description: "Import the trade-history file your broker gives you.",
  },
  {
    id: "manual",
    icon: Pencil,
    title: "Add manually",
    description: "Enter trades one at a time with a guided form.",
    disabled: true,
  },
];

function ConnectAccountFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setConnectModalOpen = useJournalUiStore((s) => s.setConnectModalOpen);
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);
  const csvReimportAccountId = useJournalUiStore((s) => s.csvReimportAccountId);

  // When reimporting into an existing account we skip method selection and go
  // straight to the CSV form.
  const [step, setStep] = useState<"method" | "form">(
    csvReimportAccountId ? "form" : "method",
  );
  // Auto-sync is pre-selected (the recommended path).
  const [selected, setSelected] = useState<ImportMethod>(
    csvReimportAccountId ? "csv" : "api",
  );

  const handleSuccess = (account: JournalAccount) => {
    setActiveAccountId(account.id);
    if (searchParams.has("accountId")) {
      router.replace(dashboardPathForAccount(searchParams, account.id));
    }
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

  const close = () => setConnectModalOpen(false);

  const goBack = () => {
    if (step === "form" && !csvReimportAccountId) {
      setStep("method");
    } else {
      close();
    }
  };

  return (
    <DialogContent
      showCloseButton={false}
      overlayClassName="bg-bg-primary"
      className="fixed inset-0 left-0 top-0 z-modal grid h-screen w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_1fr] gap-0 rounded-none border-0 bg-bg-primary p-0 ring-0 sm:max-w-none"
    >
      {/* Top bar: back + close */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto scrollbar-thin">
        {step === "method" ? (
          <div className="mx-auto flex w-full max-w-[548px] flex-col px-6 pb-16 pt-6">
            <div className="mb-[18px] flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase text-text-tertiary">
              <span>Step 1 of 2</span>
            </div>

            <DialogTitle className="text-[27px] font-semibold leading-[1.15] text-text-primary">
              Add trades
            </DialogTitle>
            <p className="mt-1.5 text-[15px] text-text-secondary">
              Choose how you&apos;d like to bring your trades into the app.
            </p>

            {/* Platform support note — informational, not an option.
                Flat on the canvas (no card chrome) so it reads apart from the
                selectable rows below. */}
            <div className="mt-5 flex items-center gap-3 border-b border-border-secondary pb-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-bg-tertiary">
                <Image
                  src="/brand/mt5.jpeg"
                  alt="MetaTrader 5"
                  width={34}
                  height={34}
                  className="h-[34px] w-[34px] object-contain mix-blend-multiply dark:mix-blend-screen"
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-text-primary">
                    MetaTrader 5
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-accent">
                    <BadgeCheck className="h-3 w-3" />
                    Supported
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-text-tertiary">
                  Connect your MetaTrader 5 account — more platforms are on the
                  way.
                </p>
              </div>
            </div>

            <MethodSelector selected={selected} onSelect={setSelected} />

            <div className="mt-[26px] flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-5 py-3 text-[14.5px] font-semibold text-accent-foreground transition-[background-color,transform] hover:-translate-y-px hover:bg-accent-hover focus-visible:outline-none"
              >
                Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "mx-auto flex w-full flex-col px-6 pb-16 pt-6",
              selected === "api" ? "max-w-5xl" : "max-w-xl",
            )}
          >
            {!csvReimportAccountId && (
              <div className="mb-[18px] flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase text-text-tertiary">
                <span>Step 2 of 2</span>
              </div>
            )}

            <DialogTitle className="text-[27px] font-semibold leading-[1.15] text-text-primary">
              {selected === "api"
                ? "Connect account"
                : csvReimportAccountId
                  ? "Import Trade History"
                  : "Upload Trade File"}
            </DialogTitle>

            <div className="mt-8">
              {selected === "api" ? (
                <ConnectAccountForm onSuccess={handleSuccess} />
              ) : (
                <CSVImportWizard
                  reimportAccountId={csvReimportAccountId}
                  onSuccess={handleSuccess}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

function MethodSelector({
  selected,
  onSelect,
}: {
  selected: ImportMethod;
  onSelect: (m: ImportMethod) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Import method"
      className="mt-5 flex flex-col gap-3"
    >
      {METHODS.map((method) => {
        const isSelected = selected === method.id;
        const Icon = method.icon;
        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-disabled={method.disabled}
            disabled={method.disabled}
            onClick={() => !method.disabled && onSelect(method.id)}
            className={cn(
              "group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border bg-card-bg p-4 pl-5 text-left shadow-[0_1px_2px_rgba(20,20,40,0.04),0_6px_20px_rgba(20,20,40,0.04)] transition-[background-color,border-color,box-shadow] duration-150 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20",
              !method.disabled && "cursor-pointer",
              isSelected
                ? "border-accent/55 bg-accent-light shadow-[0_0_0_1px_rgba(85,214,206,0.22),0_10px_34px_rgba(85,214,206,0.12)]"
                : "border-border-secondary hover:-translate-y-px hover:border-accent/50 hover:bg-bg-tertiary",
              method.disabled &&
                "cursor-not-allowed opacity-60 shadow-none hover:translate-y-0 hover:border-border-secondary hover:bg-card-bg",
            )}
          >
            {/* Left accent bar */}
            <span
              className={cn(
                "absolute inset-y-3.5 left-0 w-[3px] rounded-full bg-accent transition-opacity duration-200",
                isSelected ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0",
              )}
            />

            {/* Icon */}
            <span
              className={cn(
                "flex h-[42px] w-[42px] items-center justify-center rounded-[11px] transition-colors",
                isSelected
                  ? "bg-accent text-accent-foreground"
                  : "bg-bg-tertiary text-text-secondary",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>

            {/* Text */}
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[15.5px] font-semibold text-text-primary">
                  {method.title}
                </span>
                {method.recommended && (
                  <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                    Recommended
                  </span>
                )}
                {method.disabled && (
                  <span className="rounded-full border border-border-secondary bg-bg-primary px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-text-tertiary">
                    Soon
                  </span>
                )}
              </span>
                  <span className="mt-1 block text-[13px] leading-snug text-text-secondary">
                {method.description}
              </span>
            </span>

            {/* Radio */}
            <span
              className={cn(
                "relative h-[21px] w-[21px] shrink-0 rounded-full border-[1.5px] transition-colors",
                isSelected
                  ? "border-transparent bg-accent"
                  : "border-border-secondary",
                method.disabled && "border-dashed",
              )}
            >
              <span
                className={cn(
                  "absolute inset-0 m-auto h-[9px] w-[9px] rounded-full bg-white transition-transform duration-200",
                  isSelected ? "scale-100" : "scale-0",
                )}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
