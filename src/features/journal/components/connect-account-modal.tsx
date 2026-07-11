"use client";

/* eslint-disable no-restricted-syntax -- intentional brand violet→blue gradient
   (matches the Add-trades design); the app's tokens don't express this gradient. */

import { useState } from "react";
import Image from "next/image";
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
      overlayClassName="bg-[#F6F6F9] dark:bg-[#0B0B11]"
      className="fixed inset-0 left-0 top-0 z-modal grid h-screen w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_1fr] gap-0 rounded-none border-0 bg-[#F6F6F9] p-0 ring-0 sm:max-w-none dark:bg-[#0B0B11]"
    >
      {/* Top bar: back + close */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="rounded-lg p-2 text-[#8E8E9A] transition-colors hover:bg-[#EAEAF0] hover:text-[#15151C] dark:text-[#67677A] dark:hover:bg-[#1E1E27] dark:hover:text-[#ECECF1]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="rounded-lg p-2 text-[#8E8E9A] transition-colors hover:bg-[#EAEAF0] hover:text-[#15151C] dark:text-[#67677A] dark:hover:bg-[#1E1E27] dark:hover:text-[#ECECF1]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto scrollbar-thin">
        {step === "method" ? (
          <div className="mx-auto flex w-full max-w-[548px] flex-col px-6 pb-16 pt-6">
            <div className="mb-[18px] flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase text-[#8E8E9A] dark:text-[#67677A]">
              <span>Step 1 of 2</span>
            </div>

            <DialogTitle className="text-[27px] font-semibold leading-[1.15] text-[#15151C] dark:text-[#ECECF1]">
              Add trades
            </DialogTitle>
            <p className="mt-1.5 text-[15px] text-[#5A5A67] dark:text-[#9C9CAB]">
              Choose how you&apos;d like to bring your trades into the app.
            </p>

            {/* Platform support note — informational, not an option.
                Flat on the canvas (no card chrome) so it reads apart from the
                selectable rows below. */}
            <div className="mt-5 flex items-center gap-3 border-b border-[#EAEAF0] pb-5 dark:border-[#23232C]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F2F2F6] dark:bg-[#1E1E27]">
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
                  <span className="text-[13px] font-semibold text-[#15151C] dark:text-[#ECECF1]">
                    MetaTrader 5
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercaser text-[#6C4DF2] dark:text-[#8E72FF]">
                    <BadgeCheck className="h-3 w-3" />
                    Supported
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-[#8E8E9A] dark:text-[#67677A]">
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
                className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#6C4DF2] px-5 py-3 text-[14.5px] font-semibold text-white transition-all hover:-translate-y-px hover:bg-[#5A3CE0] focus-visible:outline-none dark:bg-[#8E72FF] dark:hover:bg-[#7E61F5]"
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
              <div className="mb-[18px] flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase text-[#8E8E9A] dark:text-[#67677A]">
                <span>Step 2 of 2</span>
              </div>
            )}

            <DialogTitle className="text-[27px] font-semibold leading-[1.15] text-[#15151C] dark:text-[#ECECF1]">
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
              "group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border bg-[#FFFFFF] p-4 pl-5 text-left shadow-[0_1px_2px_rgba(20,20,40,0.04),0_6px_20px_rgba(20,20,40,0.04)] transition-all duration-150 focus-visible:border-[#6C4DF2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(108,77,242,0.16)] dark:bg-[#141419] dark:shadow-none dark:focus-visible:border-[#8E72FF] dark:focus-visible:ring-[rgba(142,114,255,0.26)]",
              !method.disabled && "cursor-pointer",
              isSelected
                ? "border-[#6C4DF2]/55 bg-[#FFFFFF] shadow-[0_2px_4px_rgba(108,77,242,0.10),0_12px_32px_rgba(108,77,242,0.12)] dark:border-[#8E72FF]/55 dark:bg-[#17151F] dark:shadow-[0_0_0_1px_rgba(142,114,255,0.35),0_10px_34px_rgba(108,90,230,0.20)]"
                : "border-[#EAEAF0] hover:-translate-y-px hover:border-[#DCDCE5] hover:bg-[#FCFCFE] dark:border-[#23232C] dark:hover:border-[#30303C] dark:hover:bg-[#191920]",
              method.disabled &&
                "cursor-not-allowed opacity-60 shadow-none hover:translate-y-0 hover:border-[#EAEAF0] hover:bg-[#FFFFFF] dark:hover:border-[#23232C] dark:hover:bg-[#141419]",
            )}
          >
            {/* Left accent bar */}
            <span
              className={cn(
                "absolute inset-y-3.5 left-0 w-[3px] rounded-full bg-[#6C4DF2] transition-all duration-200 dark:bg-[#8E72FF]",
                isSelected ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0",
              )}
            />

            {/* Icon */}
            <span
              className={cn(
                "flex h-[42px] w-[42px] items-center justify-center rounded-[11px] transition-colors",
                isSelected
                  ? "bg-[#6C4DF2] text-white dark:bg-[#8E72FF]"
                  : "bg-[#F2F2F6] text-[#5A5A67] dark:bg-[#1E1E27] dark:text-[#9C9CAB]",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>

            {/* Text */}
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[15.5px] font-semibold text-[#15151C] dark:text-[#ECECF1]">
                  {method.title}
                </span>
                {method.recommended && (
                  <span className="rounded-md bg-[#2E7CF6] px-2 py-0.5 text-[11px] font-semibold text-white">
                    Recommended
                  </span>
                )}
                {method.disabled && (
                  <span className="rounded-full border border-[#DCDCE5] bg-[#F6F6F9] px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercaser text-[#8E8E9A] dark:border-[#30303C] dark:bg-[#1E1E27] dark:text-[#67677A]">
                    Soon
                  </span>
                )}
              </span>
              <span className="mt-1 block text-[13px] leading-snug text-[#5A5A67] dark:text-[#9C9CAB]">
                {method.description}
              </span>
            </span>

            {/* Radio */}
            <span
              className={cn(
                "relative h-[21px] w-[21px] shrink-0 rounded-full border-[1.5px] transition-colors",
                isSelected
                  ? "border-transparent bg-[#6C4DF2] dark:bg-[#8E72FF]"
                  : "border-[#DCDCE5] dark:border-[#30303C]",
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
