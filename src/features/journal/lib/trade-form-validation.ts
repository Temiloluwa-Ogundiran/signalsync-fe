import * as z from "zod";
import { ManualTradeCreatePayload } from "../types";

/**
 * Shared zod schema + form-values type for the unified trade form modal
 * (create + edit). The form keeps number fields as `number | ""` so empty
 * inputs round-trip cleanly through controlled inputs; the cross-field
 * semantics (required-when-executed, SL/TP relative to entry, close-after-open)
 * are enforced by {@link validateManualTrade} which is reused by the resolver.
 */
export const tradeFormSchema = z.object({
  isMissed: z.boolean(),
  symbol: z.string(),
  direction: z.enum(["buy", "sell"]),
  openedAt: z.string(),
  closedAt: z.string(),
  volume: z.union([z.number(), z.literal("")]),
  openPrice: z.union([z.number(), z.literal("")]),
  netProfit: z.union([z.number(), z.literal("")]),
  closePrice: z.union([z.number(), z.literal("")]),
  commission: z.number(),
  swap: z.number(),
  sl: z.union([z.number(), z.literal("")]),
  tp: z.union([z.number(), z.literal("")]),
  missedDate: z.string(),
});

export type TradeFormValues = z.infer<typeof tradeFormSchema>;

export const emptyTradeFormValues: TradeFormValues = {
  isMissed: false,
  symbol: "",
  direction: "buy",
  openedAt: "",
  closedAt: "",
  volume: "",
  openPrice: "",
  netProfit: "",
  closePrice: "",
  commission: 0,
  swap: 0,
  sl: "",
  tp: "",
  missedDate: "",
};

export interface ValidationErrors {
  symbol?: string;
  open_price?: string;
  opened_at?: string;
  close_price?: string;
  closed_at?: string;
  volume?: string;
  net_profit?: string;
  commission?: string;
  swap?: string;
  sl?: string;
  tp?: string;
  [key: string]: string | undefined;
}

export function validateManualTrade(
  values: Partial<ManualTradeCreatePayload>
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!values.symbol || values.symbol.trim().length === 0) {
    errors.symbol = "Symbol/Pair is required";
  } else if (values.symbol.length > 20) {
    errors.symbol = "Symbol must be 20 characters or less";
  }

  if (!values.is_missed) {
    // Executed trade validation
    if (values.open_price === undefined || values.open_price <= 0) {
      errors.open_price = "Entry price must be greater than 0";
    }

    if (!values.opened_at) {
      errors.opened_at = "Open date and time is required";
    }

    if (values.volume === undefined || values.volume <= 0) {
      errors.volume = "Lot size (volume) must be greater than 0";
    }

    if (!values.closed_at) {
      errors.closed_at = "Close date and time is required";
    }

    if (values.close_price === undefined || values.close_price <= 0) {
      errors.close_price = "Close price must be greater than 0";
    }

    if (values.net_profit === undefined) {
      errors.net_profit = "Net P&L is required";
    }

    if (values.opened_at && values.closed_at) {
      const openTime = new Date(values.opened_at).getTime();
      const closeTime = new Date(values.closed_at).getTime();
      if (openTime >= closeTime) {
        errors.closed_at = "Close time must be after open time";
      }
    }
  } else {
    // Missed trade validation: entry, sl, and tp are strictly required
    if (values.open_price === undefined || values.open_price <= 0) {
      errors.open_price = "Intended entry price is required";
    }

    if (values.sl === undefined || values.sl <= 0) {
      errors.sl = "Stop Loss price is required";
    }

    if (values.tp === undefined || values.tp <= 0) {
      errors.tp = "Take Profit price is required";
    }

    if (values.open_price && values.sl && values.tp) {
      if (values.direction === "buy") {
        if (values.sl >= values.open_price) {
          errors.sl = "Stop Loss must be below Entry price for a Buy";
        }
        if (values.tp <= values.open_price) {
          errors.tp = "Take Profit must be above Entry price for a Buy";
        }
      } else if (values.direction === "sell") {
        if (values.sl <= values.open_price) {
          errors.sl = "Stop Loss must be above Entry price for a Sell";
        }
        if (values.tp >= values.open_price) {
          errors.tp = "Take Profit must be below Entry price for a Sell";
        }
      }
    }
  }

  return errors;
}

export interface HypotheticalPreview {
  rMultiple: number | null;
  outcome: "win" | "loss" | "neutral" | null;
  description: string;
}

export function computeHypotheticalPreview(
  direction: "buy" | "sell",
  openPrice: number,
  sl?: number,
  tp?: number,
  defaultRiskAmount = 100
): HypotheticalPreview {
  if (!openPrice || !sl || !tp) {
    return {
      rMultiple: null,
      outcome: null,
      description: "Define both Stop Loss and Take Profit to calculate the setup preview.",
    };
  }

  const riskPerUnit = Math.abs(openPrice - sl);
  if (riskPerUnit === 0) {
    return {
      rMultiple: null,
      outcome: null,
      description: "Invalid Stop Loss level.",
    };
  }

  const rewardPerUnit = Math.abs(tp - openPrice);
  const rMultiple = Number((rewardPerUnit / riskPerUnit).toFixed(2));

  let outcome: "win" | "loss" | "neutral" = "neutral";
  if (direction === "buy") {
    if (sl < openPrice && tp > openPrice) outcome = "win";
    else outcome = "loss";
  } else {
    if (sl > openPrice && tp < openPrice) outcome = "win";
    else outcome = "loss";
  }

  const winAmount = (rMultiple * defaultRiskAmount).toFixed(2);
  const desc =
    outcome === "win"
      ? `This setup has a ${rMultiple}R risk-reward ratio. If it hits Take Profit, it would yield a profit of $${winAmount} based on a standard 1% risk of your account balance ($${defaultRiskAmount.toFixed(2)} risk).`
      : `Stop Loss configuration is invalid for a ${direction.toUpperCase()} setup.`;

  return {
    rMultiple,
    outcome,
    description: desc,
  };
}
