"use client";

import { useState } from "react";
import {
  Calculator,
  PieChart,
  DollarSign,
  Percent,
  RefreshCw,
  ArrowRight,
  Save,
  Info,
  Zap,
} from "lucide-react";

export function PositionSizeCalculator() {
  const [inputs, setInputs] = useState({
    balance: 10000,
    riskPercent: 1.0,
    entryPrice: 1.085,
    stopLoss: 1.083,
    instrument: "Forex",
    lotType: "Standard",
  });
  const dollarRisk = (inputs.balance * inputs.riskPercent) / 100;
  const pipRisk =
    Math.abs(inputs.entryPrice - inputs.stopLoss) *
    (inputs.entryPrice > 50 ? 100 : 10000);
  const pipValue =
    inputs.lotType === "Standard" ? 10 : inputs.lotType === "Mini" ? 1 : 0.1;
  const lots = pipRisk > 0 ? dollarRisk / (pipRisk * pipValue) : 0;
  const unitMultiplier =
    inputs.lotType === "Standard"
      ? 100000
      : inputs.lotType === "Mini"
        ? 10000
        : 1000;

  const results = {
    lots: Number(lots.toFixed(2)),
    units: Math.round(lots * unitMultiplier),
    dollarRisk: Number(dollarRisk.toFixed(2)),
    pipRisk: Number(pipRisk.toFixed(1)),
  };

  const calculate = () => {};

  const handleChange = (field: string, value: string | number) =>
    setInputs((prev) => ({ ...prev, [field]: value }));

  const inputClass =
    "w-full px-4 py-2.5 bg-bg-tertiary border border-border-primary rounded-xl focus:bg-card-bg focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all font-mono text-sm text-text-primary";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="bg-card-bg rounded-2xl border border-border-primary shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">
              Trade Parameters
            </h3>
            <button
              onClick={() =>
                setInputs({ ...inputs, entryPrice: 0, stopLoss: 0 })
              }
              className="text-xs font-medium text-text-tertiary hover:text-accent flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Reset
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                Account Balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-text-tertiary">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  value={inputs.balance}
                  onChange={(e) =>
                    handleChange("balance", parseFloat(e.target.value))
                  }
                  className={`${inputClass} pl-9`}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-text-tertiary">
                Total capital available for trading.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                Risk per Trade
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-text-tertiary">
                  <Percent className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.riskPercent}
                  onChange={(e) =>
                    handleChange("riskPercent", parseFloat(e.target.value))
                  }
                  className={`${inputClass} pl-9`}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-text-tertiary">
                Recommended: 1-2% for sustainable growth.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                Instrument
              </label>
              <select
                value={inputs.instrument}
                onChange={(e) => handleChange("instrument", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option>Forex Pairs (USD Base)</option>
                <option>Forex Pairs (Non-USD)</option>
                <option>Indices (US30/NAS100)</option>
                <option>Crypto (BTC/ETH)</option>
                <option>Metals (XAU/XAG)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                Lot Type
              </label>
              <select
                value={inputs.lotType}
                onChange={(e) => handleChange("lotType", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option>Standard (100,000 units)</option>
                <option>Mini (10,000 units)</option>
                <option>Micro (1,000 units)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                Entry Price
              </label>
              <input
                type="number"
                step="0.0001"
                value={inputs.entryPrice}
                onChange={(e) =>
                  handleChange("entryPrice", parseFloat(e.target.value))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                Stop Loss
              </label>
              <input
                type="number"
                step="0.0001"
                value={inputs.stopLoss}
                onChange={(e) =>
                  handleChange("stopLoss", parseFloat(e.target.value))
                }
                className={`${inputClass} focus:ring-danger/30 focus:border-danger`}
              />
            </div>
          </div>
          <div className="mt-8 flex items-center justify-end">
            <button
              onClick={calculate}
              className="bg-accent text-white font-bold py-3 px-8 rounded-xl hover:bg-accent-hover transition-colors flex items-center"
            >
              <Calculator className="h-5 w-5 mr-2" /> Calculate Size
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <div className="bg-gradient-to-br from-accent to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-accent-light text-xs font-bold uppercase tracking-wider mb-1">
              Recommended Position Size
            </h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl md:text-5xl font-bold tracking-tight">
                {results.lots}
              </span>
              <span className="text-lg text-blue-200 font-medium">Lots</span>
            </div>
            <div className="space-y-4">
              {[
                { label: "Total Units", value: results.units.toLocaleString() },
                {
                  label: "Dollar Risk",
                  value: `-$${results.dollarRisk}`,
                  extra: "text-danger",
                },
                {
                  label: "Stop Loss Distance",
                  value: `${results.pipRisk} Pips`,
                },
              ].map(({ label, value, extra }, i) => (
                <div
                  key={label}
                  className={`flex justify-between items-center ${i < 2 ? "border-b border-white/10 pb-3" : ""}`}
                >
                  <span className="text-sm text-blue-100">{label}</span>
                  <span className={`font-mono font-bold ${extra || ""}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <PieChart className="absolute -bottom-10 -right-10 h-48 w-48 opacity-10" />
        </div>

        <div className="bg-card-bg rounded-2xl border border-border-primary shadow-sm p-5">
          <h4 className="text-sm font-bold text-text-primary mb-4">Actions</h4>
          <div className="space-y-3">
            {[
              {
                icon: Save,
                label: "Save Calculation to Journal",
                hover: "hover:bg-accent-light hover:border-accent/20",
              },
              {
                icon: Zap,
                label: "Use for New Trade",
                hover: "hover:bg-success-light hover:border-success/20",
              },
            ].map(({ icon: Icon, label, hover }) => (
              <button
                key={label}
                className={`w-full flex items-center justify-between p-3 bg-bg-tertiary border border-border-primary rounded-xl transition-all group ${hover}`}
              >
                <div className="flex items-center text-text-secondary group-hover:text-text-primary">
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-text-primary" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-yellow-500/10 rounded-2xl border border-yellow-500/20 p-5 flex items-start gap-3">
          <Info className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-sm font-bold text-yellow-400 mb-1">
              Did you know?
            </h5>
            <p className="text-xs text-yellow-500/80 leading-relaxed">
              Position sizing is the only variable you have 100% control over.
              Professional traders adjust size based on the quality of the
              setup, not just the account balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
