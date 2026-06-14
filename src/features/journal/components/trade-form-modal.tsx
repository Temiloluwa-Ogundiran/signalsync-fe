"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Save,
  Info,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useForm, type PathValue } from "react-hook-form";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useJournalUiStore } from "../store/journal-ui-store";
import {
  useCreateManualTrade,
  useUpdateManualTrade,
} from "../hooks/use-manual-trade";
import { useJournalSummaryAnalytics } from "../hooks/use-journal-analytics";
import {
  validateManualTrade,
  computeHypotheticalPreview,
  ValidationErrors,
  TradeFormValues,
  emptyTradeFormValues,
} from "../lib/trade-form-validation";
import {
  JournalTrade,
  ManualTradeCreatePayload,
  ManualTradeUpdatePayload,
} from "../types";

// Standard formatting for datetime-local input
function formatToDatetimeLocal(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/** Build default form values for the create flow honoring a prefilled date. */
function buildCreateDefaults(prefilledDate: string | null): TradeFormValues {
  const now = new Date();
  let openedAt: string;
  let closedAt: string;

  if (prefilledDate) {
    // e.g. "2026-05-28" -> prefill open and close to that local date at 9:00 and 10:00
    const pDate = new Date(prefilledDate);
    pDate.setHours(9, 0, 0, 0);
    openedAt = formatToDatetimeLocal(pDate);

    const pDateClose = new Date(prefilledDate);
    pDateClose.setHours(10, 0, 0, 0);
    closedAt = formatToDatetimeLocal(pDateClose);
  } else {
    openedAt = formatToDatetimeLocal(now);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    closedAt = formatToDatetimeLocal(oneHourLater);
  }

  return {
    ...emptyTradeFormValues,
    openedAt,
    closedAt,
    missedDate: prefilledDate || "",
  };
}

/** Build default form values for the edit flow from an existing trade entity. */
function buildEditDefaults(trade: JournalTrade): TradeFormValues {
  return {
    isMissed: !!trade.is_missed,
    symbol: trade.symbol,
    direction: trade.direction,
    volume: trade.volume !== undefined ? trade.volume : "",
    openPrice: trade.open_price !== undefined ? Number(trade.open_price) : "",
    netProfit: trade.net_profit !== undefined ? Number(trade.net_profit) : "",
    closePrice: trade.close_price !== undefined ? Number(trade.close_price) : "",
    commission: trade.commission !== undefined ? Number(trade.commission) : 0,
    swap: trade.swap !== undefined ? Number(trade.swap) : 0,
    sl: trade.sl !== undefined ? Number(trade.sl) : "",
    tp: trade.tp !== undefined ? Number(trade.tp) : "",
    missedDate:
      trade.is_missed && trade.opened_at ? trade.opened_at.slice(0, 10) : "",
    openedAt: trade.opened_at
      ? formatToDatetimeLocal(new Date(trade.opened_at))
      : "",
    closedAt: trade.closed_at
      ? formatToDatetimeLocal(new Date(trade.closed_at))
      : "",
  };
}

type TradeFormModalProps =
  | {
      mode: "create";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      /** Optional date (YYYY-MM-DD) prefilled into the create form. */
      prefilledDate?: string | null;
    }
  | {
      mode: "edit";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      /** Existing trade being edited (resolved by the caller). */
      trade: JournalTrade | null;
      /** Id of the trade being edited (used by the update mutation). */
      tradeId: string | null;
    };

/**
 * Unified create/edit manual-trade modal. A single `react-hook-form` instance
 * backs all fields; per-step validation reuses {@link validateManualTrade} so
 * the create and edit flows stay behaviorally identical to the originals.
 */
export function TradeFormModal(props: TradeFormModalProps) {
  const { mode, open, onOpenChange } = props;
  const router = useRouter();
  const activeAccountId = useJournalUiStore((s) => s.activeAccountId);

  const createManualTrade = useCreateManualTrade(activeAccountId);
  const updateManualTrade = useUpdateManualTrade(activeAccountId);
  const mutation = mode === "create" ? createManualTrade : updateManualTrade;

  const summaryQuery = useJournalSummaryAnalytics({
    accountId: activeAccountId || undefined,
    fromDate: "1970-01-01",
    toDate: "2030-12-31",
  });
  const currentBalance =
    (summaryQuery.data?.starting_balance ?? 10000) +
    (summaryQuery.data?.total_net_pnl ?? 0);
  const onePercentRisk = currentBalance * 0.01;

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const { watch, reset, setValue, getValues } = useForm<TradeFormValues>({
    defaultValues: emptyTradeFormValues,
  });

  // Subscribe to all values for rendering (single source of truth).
  const values = watch();
  const {
    isMissed,
    symbol,
    direction,
    openedAt,
    closedAt,
    volume,
    openPrice,
    netProfit,
    closePrice,
    commission,
    swap,
    sl,
    tp,
    missedDate,
  } = values;

  const prefilledDate = mode === "create" ? props.prefilledDate ?? null : null;
  const trade = mode === "edit" ? props.trade : null;
  const tradeId = mode === "edit" ? props.tradeId : null;

  // Prefill / reset handler — mirrors the original modals' open effect.
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setErrors({});
    if (mode === "create") {
      reset(buildCreateDefaults(prefilledDate));
    } else if (trade) {
      reset(buildEditDefaults(trade));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, prefilledDate, trade]);

  const handleDateSelect = (d: Date | undefined) => {
    if (d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setValue("missedDate", `${year}-${month}-${day}`);
    } else {
      setValue("missedDate", "");
    }
  };

  const parsedDate = missedDate
    ? new Date(`${missedDate}T12:00:00`)
    : undefined;

  const getPayload = (): Partial<ManualTradeCreatePayload> => {
    const v = getValues();

    let targetDateIso: string;
    if (mode === "create") {
      targetDateIso = new Date().toISOString();
      if (v.isMissed) {
        if (v.missedDate) {
          targetDateIso = new Date(`${v.missedDate}T09:00:00`).toISOString();
        } else if (prefilledDate) {
          targetDateIso = new Date(`${prefilledDate}T09:00:00`).toISOString();
        }
      }
    } else {
      targetDateIso = trade?.opened_at
        ? new Date(trade.opened_at).toISOString()
        : new Date().toISOString();
      if (v.isMissed && v.missedDate) {
        targetDateIso = new Date(`${v.missedDate}T09:00:00`).toISOString();
      }
    }

    return {
      is_missed: v.isMissed,
      symbol: v.symbol.toUpperCase(),
      direction: v.direction,
      opened_at: v.isMissed
        ? targetDateIso
        : v.openedAt
          ? new Date(v.openedAt).toISOString()
          : "",
      open_price: v.openPrice !== "" ? Number(v.openPrice) : undefined,
      volume: v.volume !== "" ? Number(v.volume) : undefined,
      closed_at: v.isMissed
        ? targetDateIso
        : v.closedAt
          ? new Date(v.closedAt).toISOString()
          : undefined,
      close_price: v.closePrice !== "" ? Number(v.closePrice) : undefined,
      net_profit: v.netProfit !== "" ? Number(v.netProfit) : undefined,
      commission: v.commission !== undefined ? Number(v.commission) : 0,
      swap: v.swap !== undefined ? Number(v.swap) : 0,
      sl: v.sl !== "" ? Number(v.sl) : undefined,
      tp: v.tp !== "" ? Number(v.tp) : undefined,
    };
  };

  const handleNext = () => {
    const payload = getPayload();
    const currentErrors = validateManualTrade(payload);

    if (step === 1) {
      const step1Errors: Record<string, string> = {};
      if (currentErrors.symbol) step1Errors.symbol = currentErrors.symbol;
      if (currentErrors.open_price)
        step1Errors.open_price = currentErrors.open_price;
      if (currentErrors.opened_at)
        step1Errors.opened_at = currentErrors.opened_at;
      if (!isMissed && currentErrors.volume)
        step1Errors.volume = currentErrors.volume;
      if (!isMissed && currentErrors.closed_at)
        step1Errors.closed_at = currentErrors.closed_at;

      if (Object.keys(step1Errors).length > 0) {
        setErrors(step1Errors);
        return;
      }
    } else if (step === 2) {
      const step2Errors: Record<string, string> = {};
      if (!isMissed) {
        if (currentErrors.close_price)
          step2Errors.close_price = currentErrors.close_price;
        if (currentErrors.net_profit)
          step2Errors.net_profit = currentErrors.net_profit;
        if (currentErrors.commission)
          step2Errors.commission = currentErrors.commission;
        if (currentErrors.swap) step2Errors.swap = currentErrors.swap;
      } else {
        if (currentErrors.sl) step2Errors.sl = currentErrors.sl;
        if (currentErrors.tp) step2Errors.tp = currentErrors.tp;
      }

      if (Object.keys(step2Errors).length > 0) {
        setErrors(step2Errors);
        return;
      }
    }

    setErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const payload = getPayload();
    const currentErrors = validateManualTrade(payload);
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    try {
      if (mode === "create") {
        const createdTrade = await createManualTrade.mutateAsync(
          payload as ManualTradeCreatePayload,
        );
        toast.success(isMissed ? "Missed Setup Saved" : "Trade Saved", {
          description: isMissed
            ? "Logged your missed trade for journaling reflection."
            : "Your manual trade has been saved and logged successfully.",
        });
        onOpenChange(false);

        // Post-creation flow: router.push to the trade chat page!
        const closedDate = createdTrade.closed_at.split("T")[0];
        router.push(
          `/journal/trade?tradeId=${createdTrade.id}&date=${closedDate}`,
        );
      } else {
        if (!trade) return;
        await updateManualTrade.mutateAsync({
          tradeId: tradeId!,
          payload: payload as ManualTradeUpdatePayload,
        });
        toast.success(isMissed ? "Missed Setup Updated" : "Trade Updated", {
          description: "Your changes have been saved successfully.",
        });
        onOpenChange(false);

        // Invalidate page or soft reload the page
        router.refresh();
      }
    } catch (err) {
      const verb = mode === "create" ? "saving the manual trade" : "updating the trade";
      const msg =
        (err as { message?: string })?.message ||
        `An error occurred while ${verb}.`;
      setErrors({ root: msg });
      toast.error(
        mode === "create" ? "Failed to save trade" : "Failed to update trade",
        { description: msg },
      );
    }
  };

  const hypothetical = isMissed
    ? computeHypotheticalPreview(
        direction,
        Number(openPrice || 0),
        sl !== "" ? Number(sl) : undefined,
        tp !== "" ? Number(tp) : undefined,
        onePercentRisk,
      )
    : null;

  const isCreate = mode === "create";
  const title = isCreate ? "Add Trade Manually" : "Edit Trade Details";
  const receiptTitle = isCreate
    ? isMissed
      ? "Missed Trade Setup"
      : "Manual Trade Receipt"
    : isMissed
      ? "Edit Missed Trade Setup"
      : "Edit Manual Trade";
  const missedDateHelp = isCreate
    ? "Defaults to today or selected calendar day if left blank."
    : "Defaults to today or original logged day if left blank.";
  const savingLabel = isCreate ? "Saving..." : "Saving Changes...";
  const saveLabel = isCreate ? "Save Setup" : "Save Changes";

  // Number-field change helper preserving original number | "" parsing.
  const onNumOrEmpty =
    (field: keyof TradeFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(
        field,
        (e.target.value !== "" ? Number(e.target.value) : "") as PathValue<
          TradeFormValues,
          typeof field
        >,
      );
  const onNum =
    (field: keyof TradeFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(
        field,
        Number(e.target.value) as PathValue<TradeFormValues, typeof field>,
      );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-border-primary bg-card-bg p-0 overflow-hidden rounded-2xl shadow-2xl">
        <DialogHeader className="bg-bg-tertiary px-6 py-4 border-b border-border-secondary flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-semibold text-text-primary">
              {title}
            </DialogTitle>
            <p className="text-xs text-text-secondary mt-0.5">
              Step {step} of 3 ·{" "}
              {step === 1
                ? "Trade Details"
                : step === 2
                  ? "Risk & Outcome"
                  : "Review Summary"}
            </p>
          </div>
        </DialogHeader>

        {/* Steps Progress Indicator */}
        <div className="flex h-1 bg-border-secondary">
          <div
            className="bg-accent transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Trade Type pill toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary">
                  Trade Entry Type
                </label>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-bg-tertiary p-1 border border-border-secondary">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("isMissed", false);
                      setErrors({});
                    }}
                    className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      !isMissed
                        ? "bg-accent text-white shadow-lg shadow-accent/15"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Executed ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("isMissed", true);
                      setErrors({});
                    }}
                    className={`flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      isMissed
                        ? "bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/25 shadow-md shadow-amber-500/5"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Missed Setup ✗
                  </button>
                </div>
              </div>

              {/* Symbol & Direction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary">
                    Symbol / Pair
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EURUSD"
                    value={symbol}
                    onChange={(e) => setValue("symbol", e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm uppercase font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {errors.symbol && (
                    <span className="text-xs font-medium text-danger">
                      {errors.symbol}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary">
                    Side
                  </label>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-bg-tertiary p-1 border border-border-secondary h-11 items-center">
                    <button
                      type="button"
                      onClick={() => setValue("direction", "buy")}
                      className={`flex items-center justify-center py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        direction === "buy"
                          ? "bg-kpi-metric-positive/15 text-kpi-metric-positive border border-kpi-metric-positive/20"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("direction", "sell")}
                      className={`flex items-center justify-center py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        direction === "sell"
                          ? "bg-danger/15 text-danger border border-danger/20"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>

              {/* Opened and Closed datetimes */}
              {!isMissed ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-text-secondary">
                      Opened At Time
                    </label>
                    <input
                      type="datetime-local"
                      value={openedAt}
                      onChange={(e) => setValue("openedAt", e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {errors.opened_at && (
                      <span className="text-xs font-medium text-danger">
                        {errors.opened_at}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-text-secondary">
                      Closed At Time
                    </label>
                    <input
                      type="datetime-local"
                      value={closedAt}
                      onChange={(e) => setValue("closedAt", e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {errors.closed_at && (
                      <span className="text-xs font-medium text-danger">
                        {errors.closed_at}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary">
                    Missed Date (Optional)
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className={cn(
                          "flex h-11 w-full justify-start text-left font-normal border border-border-primary bg-bg-input px-3.5 rounded-xl text-sm text-text-primary hover:bg-bg-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer",
                          !missedDate && "text-text-tertiary",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-text-secondary" />
                        {parsedDate ? (
                          format(parsedDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-card-bg border border-border-primary rounded-xl"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={parsedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-[10px] text-text-tertiary">
                    {missedDateHelp}
                  </p>
                </div>
              )}

              {/* Lot size & Open Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isMissed ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-text-secondary">
                      Lot Size (Volume)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 0.10, 1.00"
                      value={volume}
                      onChange={onNumOrEmpty("volume")}
                      className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {errors.volume && (
                      <span className="text-xs font-medium text-danger">
                        {errors.volume}
                      </span>
                    )}
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary">
                    {isMissed ? "Intended Entry Price" : "Entry Price"}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1.08540, 68450"
                    value={openPrice}
                    onChange={onNumOrEmpty("openPrice")}
                    className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {errors.open_price && (
                    <span className="text-xs font-medium text-danger">
                      {errors.open_price}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {!isMissed ? (
                /* EXECUTED OUTCOME FIELDS */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-text-secondary">
                        Net P&L ($ Profit/Loss)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Positive for gain, negative for loss"
                        value={netProfit}
                        onChange={onNumOrEmpty("netProfit")}
                        className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {errors.net_profit && (
                        <span className="text-xs font-medium text-danger">
                          {errors.net_profit}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-text-secondary">
                        Exit Price (Close Price)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 1.09120"
                        value={closePrice}
                        onChange={onNumOrEmpty("closePrice")}
                        className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {errors.close_price && (
                        <span className="text-xs font-medium text-danger">
                          {errors.close_price}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-text-secondary">
                        Commission (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={commission}
                        onChange={onNum("commission")}
                        className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-text-secondary">
                        Swap Fee (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={swap}
                        onChange={onNum("swap")}
                        className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border-secondary pt-4">
                    <p className="text-xs font-semibold text-text-secondary mb-3">
                      Risk Management Levels (Optional)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-text-secondary">
                          Stop Loss (SL) Price
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={sl}
                          onChange={onNumOrEmpty("sl")}
                          className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-text-secondary">
                          Take Profit (TP) Price
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={tp}
                          onChange={onNumOrEmpty("tp")}
                          className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* MISSED SETUP RISK FIELDS */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-text-secondary">
                        Stop Loss (SL) Price
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 1.08200"
                        value={sl}
                        onChange={onNumOrEmpty("sl")}
                        className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {errors.sl && (
                        <span className="text-xs font-medium text-danger">
                          {errors.sl}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-text-secondary">
                        Take Profit (TP) Price
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 1.09500"
                        value={tp}
                        onChange={onNumOrEmpty("tp")}
                        className="flex h-11 w-full rounded-xl border border-border-primary bg-bg-input px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {errors.tp && (
                        <span className="text-xs font-medium text-danger">
                          {errors.tp}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informational preview callout */}
                  <div className="rounded-xl border border-border-primary bg-bg-tertiary p-4 flex gap-3 text-sm text-text-secondary leading-relaxed">
                    <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-text-primary">
                        What would have happened?
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {hypothetical?.description ||
                          "Enter both Stop Loss and Take Profit levels to see hypothetical P&L preview and risk metrics."}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="rounded-xl border border-border-secondary bg-bg-tertiary overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-border-secondary bg-accent/10 text-accent">
                  <span className="text-xs font-bold">{receiptTitle}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/25 text-accent">
                    Manual Entry
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-text-secondary font-semibold">
                        Symbol
                      </p>
                      <p className="text-lg font-bold text-text-primary tracking-wide uppercase mt-0.5">
                        {symbol}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary font-semibold">
                        Direction / Side
                      </p>
                      <span
                        className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-md mt-1 ${
                          direction === "buy"
                            ? "bg-kpi-metric-positive/10 text-kpi-metric-positive"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {direction === "buy" ? "Buy" : "Sell"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border-secondary/40 pt-3">
                    <div>
                      <p className="text-[10px] text-text-secondary font-semibold">
                        Open Price
                      </p>
                      <p className="text-sm font-semibold text-text-primary mt-0.5">
                        {Number(openPrice || 0).toFixed(5)}
                      </p>
                    </div>
                    {!isMissed ? (
                      <div>
                        <p className="text-[10px] text-text-secondary font-semibold">
                          Close Price
                        </p>
                        <p className="text-sm font-semibold text-text-primary mt-0.5">
                          {Number(closePrice || 0).toFixed(5)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[10px] text-text-secondary font-semibold">
                          Lot Size
                        </p>
                        <p className="text-sm text-text-tertiary mt-0.5">—</p>
                      </div>
                    )}
                  </div>

                  {!isMissed && (
                    <div className="grid grid-cols-2 gap-4 border-t border-border-secondary/40 pt-3">
                      <div>
                        <p className="text-[10px] text-text-secondary font-semibold">
                          Net P&L ($)
                        </p>
                        <p
                          className={`text-base font-bold mt-0.5 ${
                            Number(netProfit || 0) >= 0
                              ? "text-kpi-metric-positive"
                              : "text-danger"
                          }`}
                        >
                          {Number(netProfit || 0) >= 0
                            ? `+$${Number(netProfit || 0).toFixed(2)}`
                            : `-$${Math.abs(Number(netProfit || 0)).toFixed(2)}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-secondary font-semibold">
                          Lot Size
                        </p>
                        <p className="text-sm font-semibold text-text-primary mt-0.5">
                          {Number(volume || 0).toFixed(2)} Lots
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 border-t border-border-secondary/40 pt-3">
                    <div>
                      <p className="text-[10px] text-text-secondary font-semibold">
                        Stop Loss
                      </p>
                      <p className="text-sm font-semibold text-text-primary mt-0.5">
                        {sl !== "" ? Number(sl).toFixed(5) : "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary font-semibold">
                        Take Profit
                      </p>
                      <p className="text-sm font-semibold text-text-primary mt-0.5">
                        {tp !== "" ? Number(tp).toFixed(5) : "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {errors.root && (
                <div className="rounded-lg bg-danger/10 border border-danger/25 p-3 text-xs font-semibold text-danger">
                  {errors.root}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-bg-tertiary px-6 py-4 border-t border-border-secondary flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={mutation.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border-primary bg-card-bg px-4 text-xs font-bold text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            ) : null}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
              className="inline-flex h-10 items-center rounded-xl bg-transparent px-4 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-bold text-white hover:bg-accent-hover transition-colors cursor-pointer shadow-md"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-bold text-white hover:bg-accent-hover transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {savingLabel}
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    {saveLabel}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
