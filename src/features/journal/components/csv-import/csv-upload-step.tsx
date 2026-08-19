"use client";

import React, { useState, useRef, useMemo } from "react";
import { Upload, FileCode, AlertCircle, Calendar } from "lucide-react";
import { useCSVPlatforms } from "../../hooks/use-csv-import";
import { toast } from "sonner";

interface CSVUploadStepProps {
  timezone: string;
  setTimezone: (tz: string) => void;
  onFileSelect: (file: File) => void;
  isPending: boolean;
}

const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Nicosia", label: "Cyprus / Nicosia (EET/EEST - MT5 Server Time)" },
  { value: "Europe/Athens", label: "Athens / Greece (EET/EEST)" },
  { value: "Europe/Berlin", label: "Berlin / Frankfurt (CET/CEST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
];

export function CSVUploadStep({
  timezone,
  setTimezone,
  onFileSelect,
  isPending,
}: CSVUploadStepProps) {
  const { data: platforms = [] } = useCSVPlatforms();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect browser timezone if not in list
  const timezoneOptions = useMemo(() => {
    const options = [...COMMON_TIMEZONES];
    if (timezone && !options.some((opt) => opt.value === timezone)) {
      options.unshift({ value: timezone, label: `${timezone} (Auto-detected)` });
    }
    return options;
  }, [timezone]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    const isXlsx = file.name.endsWith(".xlsx");
    const isUnderLimit = file.size <= 10 * 1024 * 1024; // 10MB

    if (!isXlsx) {
      toast.error("Invalid file format", {
        description: "Please upload a valid MetaTrader 5 Excel report (.xlsx).",
      });
      return;
    }

    if (!isUnderLimit) {
      toast.error("File too large", {
        description: "Maximum file upload size is 10MB.",
      });
      return;
    }

    onFileSelect(file);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const mt5Platform = platforms.find((p) => p.id === "mt5");

  return (
    <div className="space-y-6">
      {/* Timezone Selection Card */}
      <div className="rounded-xl border border-border-primary bg-bg-secondary/40 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">
            Broker Server Timezone
          </h3>
        </div>
        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
          MT5 report files contain naive timestamps from your broker&apos;s server clock.
          Select your broker&apos;s timezone to ensure trade durations and daily statistics are converted to UTC accurately.
        </p>
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-secondary uppercase">
            Timezone
          </label>
          <select
            className="flex h-10 w-full rounded-md border border-border-primary bg-bg-input px-3 py-2 text-sm text-text-primary ring-offset-bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={isPending}
          >
            {timezoneOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary uppercase">
          Upload Report
        </label>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx"
          onChange={handleFileChange}
          disabled={isPending}
        />

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={isPending ? undefined : onButtonClick}
          className={`flex flex-col items-center justify-center min-h-[220px] rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-[background-color,border-color] duration-200 ${
            dragActive
              ? "border-accent bg-accent/5 scale-[0.99]"
              : "border-border-primary bg-bg-secondary/20 hover:border-accent/40 hover:bg-bg-secondary/40"
          } ${isPending ? "pointer-events-none opacity-50" : ""}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mb-4">
            <Upload className="h-6 w-6" />
          </div>

          <h3 className="text-sm font-semibold text-text-primary mb-1">
            Drag and drop your MT5 report here
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            or click to browse your files
          </p>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-border-primary bg-bg-secondary px-3 py-1 text-[10px] font-bold text-text-secondary uppercase">
            <FileCode className="h-3 w-3 text-accent" />
            MetaTrader 5 (.xlsx) • Max 10MB
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      {mt5Platform && (
        <div className="rounded-xl border border-border-primary bg-bg-secondary/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">
              How to export from MetaTrader 5
            </h3>
          </div>
          
          <div className="text-xs text-text-secondary leading-relaxed space-y-2 whitespace-pre-line font-medium">
            {mt5Platform.export_instructions}
          </div>
        </div>
      )}
    </div>
  );
}
