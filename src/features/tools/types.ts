import type React from "react";

export type ToolId =
  | "position"
  | "rr"
  | "profit"
  | "drawdown"
  | "expectancy"
  | "winrate"
  | "ruin"
  | "kelly"
  | "atr";

export interface ToolConfig {
  id: ToolId;
  label: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "coming-soon";
}

import {
  Calculator,
  Target,
  TrendingUp,
  PieChart,
  Activity,
  AlertTriangle,
  DollarSign,
  Zap,
} from "lucide-react";

export const TOOLS: ToolConfig[] = [
  {
    id: "position",
    label: "Position Size",
    description: "Calculate lot size based on account risk and stop loss.",
    icon: Calculator,
    status: "active",
  },
  {
    id: "rr",
    label: "Risk–Reward",
    description: "Visualize potential profit multiples vs risk.",
    icon: Target,
    status: "coming-soon",
  },
  {
    id: "profit",
    label: "Profit",
    description: "Estimate potential returns on open positions.",
    icon: DollarSign,
    status: "coming-soon",
  },
  {
    id: "drawdown",
    label: "Drawdown",
    description: "Calculate recovery needed after a losing streak.",
    icon: TrendingUp,
    status: "coming-soon",
  },
  {
    id: "expectancy",
    label: "Expectancy",
    description: "Determine if your system is mathematically profitable.",
    icon: PieChart,
    status: "coming-soon",
  },
  {
    id: "winrate",
    label: "Win Rate",
    description: "Analyze your strike rate needed to break even.",
    icon: Activity,
    status: "coming-soon",
  },
  {
    id: "ruin",
    label: "Risk of Ruin",
    description: "Probability of blowing your account based on performance.",
    icon: AlertTriangle,
    status: "coming-soon",
  },
  {
    id: "kelly",
    label: "Kelly",
    description: "Optimal bet sizing strategy for your edge.",
    icon: Zap,
    status: "coming-soon",
  },
  {
    id: "atr",
    label: "ATR Size",
    description: "Volatility-based sizing using Average True Range.",
    icon: Activity,
    status: "coming-soon",
  },
];
