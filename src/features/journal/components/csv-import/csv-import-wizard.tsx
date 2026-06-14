"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCSVPreview, useCSVConfirm } from "../../hooks/use-csv-import";
import { useJournalAccounts } from "../../hooks/use-journal-accounts";
import { CSVUploadStep } from "./csv-upload-step";
import { CSVPreviewStep } from "./csv-preview-step";
import { CSVConfirmStep } from "./csv-confirm-step";
import type { CSVPreviewResponse, JournalAccount } from "../../types";
import { toast } from "sonner";

interface CSVImportWizardProps {
  reimportAccountId?: string | null;
  onSuccess?: (account: JournalAccount) => void;
  onStepChange?: (step: WizardStep) => void;
}

type WizardStep = "upload" | "preview" | "confirm";

function getBrowserTimezone() {
  if (typeof window === "undefined") {
    return "UTC";
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function CSVImportWizard({
  reimportAccountId,
  onSuccess,
  onStepChange,
}: CSVImportWizardProps) {
  const [step, setStep] = useState<WizardStep>("upload");

  // Sync step change with parent component to adjust modal width dynamically
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);
  const [timezone, setTimezone] = useState(getBrowserTimezone);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CSVPreviewResponse | null>(null);
  const [displayName, setDisplayName] = useState("");

  const previewMutation = useCSVPreview();
  const confirmMutation = useCSVConfirm();

  const { data: accounts = [] } = useJournalAccounts();

  // Find re-import account if id is provided
  const reimportAccount = reimportAccountId
    ? accounts.find((acc) => acc.id === reimportAccountId)
    : null;

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    
    // Auto trigger preview parsing
    try {
      const data = await previewMutation.mutateAsync({
        file,
        platformId: "mt5",
        timezone,
      });
      
      setPreviewData(data);
      
      // Prefill display name from broker details if not re-importing
      if (reimportAccount) {
        setDisplayName(reimportAccount.display_name || "");
      } else {
        const broker = data.account_meta.broker_name || "MT5 Import";
        const login = data.account_meta.account_number ? ` (${data.account_meta.account_number})` : "";
        setDisplayName(`${broker}${login}`);
      }

      setStep("preview");
    } catch (err) {
      setSelectedFile(null);
      const error = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      const msg =
        error.response?.data?.detail ||
        error.message ||
        "Failed to parse the file. Please verify its format.";
      toast.error("Parsing failed", {
        description: msg,
      });
    }
  };

  const handleBack = () => {
    if (step === "preview") {
      setPreviewData(null);
      setSelectedFile(null);
      setStep("upload");
    } else if (step === "confirm") {
      setStep("preview");
    }
  };

  const handleNext = () => {
    if (step === "preview") {
      if (!displayName.trim() && !reimportAccount) {
        toast.error("Validation error", {
          description: "Please provide an account display name.",
        });
        return;
      }
      setStep("confirm");
    }
  };

  const handleConfirm = async () => {
    if (!selectedFile || (!reimportAccount && !displayName.trim())) return;

    try {
      const result = await confirmMutation.mutateAsync({
        file: selectedFile,
        platformId: "mt5",
        timezone,
        displayName: reimportAccount ? (reimportAccount.display_name || "") : displayName,
        accountId: reimportAccountId || undefined,
      });

      toast.success("Import complete", {
        description: reimportAccountId
          ? `Successfully imported ${result.inserted} new trades. (${result.skipped} duplicates skipped)`
          : `Account connected and ${result.inserted} trades imported.`,
      });

      onSuccess?.(result.account);
    } catch (err) {
      const error = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      const msg =
        error.response?.data?.detail ||
        error.message ||
        "An unexpected error occurred during database ingest.";
      toast.error("Import failed", {
        description: msg,
      });
    }
  };

  const isPending = previewMutation.isPending || confirmMutation.isPending;

  return (
    <div className="flex flex-col min-h-[400px]">
      {/* Wizard Step Progress Tracker */}
      <div className="flex items-center justify-between px-1 mb-6 border-b border-border-primary/40 pb-4 text-xs font-semibold text-text-tertiary">
        <div className={`flex items-center gap-1.5 ${step === "upload" ? "text-accent font-bold" : ""}`}>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
            step === "upload" ? "border-accent bg-accent-light text-accent" : "border-border-primary"
          }`}>
            1
          </span>
          Upload
        </div>
        <div className="h-px bg-border-primary flex-1 mx-3" />
        <div className={`flex items-center gap-1.5 ${step === "preview" ? "text-accent font-bold" : ""}`}>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
            step === "preview" ? "border-accent bg-accent-light text-accent" : "border-border-primary"
          }`}>
            2
          </span>
          Preview
        </div>
        <div className="h-px bg-border-primary flex-1 mx-3" />
        <div className={`flex items-center gap-1.5 ${step === "confirm" ? "text-accent font-bold" : ""}`}>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
            step === "confirm" ? "border-accent bg-accent-light text-accent" : "border-border-primary"
          }`}>
            3
          </span>
          Confirm
        </div>
      </div>

      {/* Main Form Body based on current step */}
      <div className="flex-1 min-h-[280px]">
        {previewMutation.isPending ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-3 text-text-secondary">
            <RefreshCw className="h-8 w-8 animate-spin text-accent" />
            <span className="text-sm font-semibold">Parsing trade history report...</span>
            <p className="text-xs text-text-tertiary text-center max-w-xs">
              Reading worksheet formulas, localizing broker timezone offsets, and building preview breakdown.
            </p>
          </div>
        ) : (
          <>
            {step === "upload" && (
              <CSVUploadStep
                timezone={timezone}
                setTimezone={setTimezone}
                onFileSelect={handleFileSelect}
                isPending={isPending}
              />
            )}
            {step === "preview" && previewData && (
              <CSVPreviewStep
                preview={previewData}
                displayName={displayName}
                setDisplayName={setDisplayName}
              />
            )}
            {step === "confirm" && previewData && (
              <CSVConfirmStep
                preview={previewData}
                displayName={displayName}
                isPending={confirmMutation.isPending}
                reimportAccountName={reimportAccount?.display_name}
              />
            )}
          </>
        )}
      </div>

      {/* Stepper Footer Action Buttons */}
      {step !== "upload" && !previewMutation.isPending && (
        <div className="flex items-center justify-between border-t border-border-primary pt-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isPending}
            className="border-border-primary text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>

          {step === "preview" ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isPending || previewData?.errors.some((e) => e.severity === "error")}
              className="bg-brand text-white hover:bg-brand-hover shadow-lg hover:shadow-brand/20 transition-all font-semibold"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-brand text-white hover:bg-brand-hover shadow-lg hover:shadow-brand/20 transition-all font-semibold"
            >
              {confirmMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Confirm Import
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
