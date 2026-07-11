"use client";

import React from "react";
import { AlertTriangle, Server, ArrowUpRight, ArrowDownRight, Coins, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { CSVPreviewResponse } from "../../types";
import { formatCurrency } from "../journal-day-modal.utils";

interface CSVPreviewStepProps {
  preview: CSVPreviewResponse;
  displayName: string;
  setDisplayName: (name: string) => void;
}

export function CSVPreviewStep({
  preview,
  displayName,
  setDisplayName,
}: CSVPreviewStepProps) {
  const { account_meta, trades, trade_count, errors, warnings, summary } = preview;

  const hasBlockingErrors = errors.some((err) => err.severity === "error");

  const formatDate = (isoStr: string) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSimpleDate = (isoStr: string) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Account Info Name Input */}
      {!hasBlockingErrors && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-secondary uppercaser">
            Account Display Name
          </label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. My MT5 Live Account"
            maxLength={120}
          />
          <p className="text-[10px] text-text-tertiary">
            This name will be shown in your journal dashboards.
          </p>
        </div>
      )}

      {/* Blocking Errors Alert */}
      {hasBlockingErrors && (
        <div className="rounded-xl border border-danger/20 bg-danger-light p-4 text-danger flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold uppercaser">
              Import Blocked
            </h3>
            <p className="text-xs leading-relaxed text-text-primary">
              The file contains critical parsing errors that prevent trade import. Please fix the report or upload a valid history export.
            </p>
            <ul className="list-disc pl-4 text-xs space-y-1 mt-2 text-text-secondary">
              {errors
                .filter((e) => e.severity === "error")
                .map((e, idx) => (
                  <li key={idx}>
                    Row {e.row_number} {e.column ? `(${e.column})` : ""}: {e.message}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* Warnings Panel */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-warning/20 bg-warning-light p-3 text-warning-text flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercaser">
              Import Warnings
            </h4>
            <ul className="list-disc pl-4 text-[11px] space-y-0.5 text-text-primary leading-normal">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      {!hasBlockingErrors && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Trades Count */}
          <div className="rounded-xl border border-border-primary bg-bg-secondary/40 p-3 shadow-sm flex flex-col justify-between min-h-[5.5rem]">
            <span className="text-[10px] font-bold text-text-tertiary uppercaser">
              Total Trades
            </span>
            <span className="font-heading text-xl font-bold text-text-primary mt-1.5 tabular-nums">
              {trade_count}
            </span>
            <span className="text-[10px] text-text-secondary font-medium">
              parsed from position sheet
            </span>
          </div>

          {/* Date Range */}
          <div className="rounded-xl border border-border-primary bg-bg-secondary/40 p-3 shadow-sm flex flex-col justify-between min-h-[5.5rem] col-span-1 md:col-span-1">
            <span className="text-[10px] font-bold text-text-tertiary uppercaser">
              Date Range
            </span>
            <div className="text-sm font-bold text-text-primary mt-1.5 leading-snug">
              {summary.date_range ? (
                <>
                  <div>{formatSimpleDate(summary.date_range.from)}</div>
                  <div className="text-text-tertiary text-[10px]">to</div>
                  <div>{formatSimpleDate(summary.date_range.to)}</div>
                </>
              ) : (
                "N/A"
              )}
            </div>
          </div>

          {/* Net Profit */}
          <div className="rounded-xl border border-border-primary bg-bg-secondary/40 p-3 shadow-sm flex flex-col justify-between min-h-[5.5rem]">
            <span className="text-[10px] font-bold text-text-tertiary uppercaser">
              Net profit
            </span>
            <span
              className={`font-heading text-xl font-bold mt-1.5 tabular-nums flex items-center gap-0.5 ${
                summary.total_profit >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {summary.total_profit >= 0 ? (
                <ArrowUpRight className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ArrowDownRight className="h-4 w-4 flex-shrink-0" />
              )}
              {formatCurrency(summary.total_profit)}
            </span>
            <span className="text-[10px] text-text-secondary font-medium">
              including swap & comm.
            </span>
          </div>
        </div>
      )}

      {/* Account Info Details Grid */}
      <div className="rounded-xl border border-border-primary bg-bg-secondary/30 overflow-hidden">
        <div className="border-b border-border-primary bg-bg-secondary/60 px-4 py-2 flex items-center gap-2">
          <Server className="h-3.5 w-3.5 text-accent" />
          <span className="text-[11px] font-bold uppercaser text-text-secondary">
            Account Specifications
          </span>
        </div>
        
        <div className="grid grid-cols-2 border-collapse">
          {/* Account Number */}
          <div className="border-r border-b border-border-primary p-3 space-y-1">
            <span className="text-[10px] text-text-tertiary uppercaser">Account ID</span>
            <div className="text-sm font-semibold text-text-primary tabular-nums">
              {account_meta.account_number || "Unknown"}
            </div>
          </div>

          {/* Currency */}
          <div className="border-b border-border-primary p-3 space-y-1 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-text-tertiary uppercaser">Base Currency</span>
              <div className="text-sm font-semibold text-text-primary">
                {account_meta.currency || "USD"}
              </div>
            </div>
            <Coins className="h-3.5 w-3.5 text-text-secondary" />
          </div>

          {/* Broker Server */}
          <div className="border-r border-border-primary p-3 space-y-1">
            <span className="text-[10px] text-text-tertiary uppercaser">Server Name</span>
            <div className="text-sm font-semibold text-text-primary truncate">
              {account_meta.broker_server || "Unknown"}
            </div>
          </div>

          {/* Account Class */}
          <div className="p-3 space-y-1">
            <span className="text-[10px] text-text-tertiary uppercaser">Account Type</span>
            <div>
              {account_meta.account_type === "live" ? (
                <span className="inline-flex rounded bg-badge-info-bg px-2 py-0.5 text-[9px] font-extrabold uppercaser text-badge-info-fg">
                  Live
                </span>
              ) : (
                <span className="inline-flex rounded bg-badge-warn-bg px-2 py-0.5 text-[9px] font-extrabold uppercaser text-badge-warn-fg">
                  Demo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trades Preview List */}
      {!hasBlockingErrors && trades.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-secondary uppercaser">
              Parsed Trades Preview
            </label>
            <span className="text-[10px] text-text-tertiary font-medium">
              Showing first {trades.length} of {trade_count} trades
            </span>
          </div>

          <div className="rounded-xl border border-border-primary bg-bg-secondary/20 overflow-hidden">
            <div className="max-h-[220px] overflow-y-auto overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[600px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-primary bg-bg-secondary/40 text-text-tertiary text-[10px] uppercase font-boldr sticky top-0 z-10">
                    <th className="px-3 py-2">Symbol</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Lots</th>
                    <th className="px-3 py-2">Open Price</th>
                    <th className="px-3 py-2">Close Price</th>
                    <th className="px-3 py-2">Net P&L</th>
                    <th className="px-3 py-2">Close Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary/40 font-medium text-text-secondary tabular-nums">
                  {trades.map((t, idx) => {
                    const netPnl = Number(t.profit) + Number(t.commission) + Number(t.swap);
                    return (
                      <tr key={idx} className="hover:bg-bg-primary/30 transition-colors">
                        <td className="px-3 py-1.5 text-text-primary font-bold">{t.symbol}</td>
                        <td className="px-3 py-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                              t.direction === "buy"
                                ? "bg-success-light text-success"
                                : "bg-danger-light text-danger"
                            }`}
                          >
                            {t.direction}
                          </span>
                        </td>
                        <td className="px-3 py-1.5">{t.volume}</td>
                        <td className="px-3 py-1.5">{t.open_price}</td>
                        <td className="px-3 py-1.5">{t.close_price}</td>
                        <td
                          className={`px-3 py-1.5 font-bold ${
                            netPnl >= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {netPnl >= 0 ? "+" : ""}
                          {formatCurrency(netPnl)}
                        </td>
                        <td className="px-3 py-1.5 text-[10px] text-text-tertiary">
                          {formatDate(t.closed_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
