"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "./journal-day-modal.utils";
import type { MetricRow } from "./journal-day-chat.types";
import { useUpdateTradeRating, useUpdateTradeAssessment } from "../hooks/use-journal-tags";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface JournalTradeChatStatsCardProps {
  metrics: MetricRow[];
  netPnl: number;
  tradeId: string;
  rating?: number;
  executionQuality?: number;
  setupQuality?: number;
  disciplineScore?: number;
  accountId?: string;
}

interface AssessmentSliderProps {
  label: string;
  subtitle: string;
  value: number;
  onChange: (val: number) => void;
  onCommit: (val: number) => void;
  isPending?: boolean;
}

function AssessmentSlider({
  label,
  subtitle,
  value,
  onChange,
  onCommit,
  isPending = false,
}: AssessmentSliderProps) {
  const tickArray = Array.from({ length: 11 });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-secondary">{label}</span>
        <div className="flex h-6 min-w-[1.75rem] items-center justify-center rounded bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent ring-1 ring-accent/25 text-center">
          {value}
        </div>
      </div>

      <div className="relative flex h-6 items-center">
        {/* Customized Track ticks visual background (under the main slider) */}
        <div className="absolute left-0 right-0 w-full flex items-center justify-between px-1 pointer-events-none">
          {tickArray.map((_, i) => {
            const isActive = i <= value;
            return (
              <div
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-200",
                  isActive ? "bg-accent shadow-[0_0_6px_var(--accent)]" : "bg-neutral-700"
                )}
              />
            );
          })}
        </div>

        {/* Real sturdy Radix Slider sitting on top */}
        <Slider
          value={[value]}
          onValueChange={(val: number[]) => onChange(val[0])}
          onValueCommit={(val: number[]) => onCommit(val[0])}
          min={0}
          max={10}
          step={1}
          disabled={isPending}
          className="w-full relative z-10"
        />
      </div>

      <p className="text-xs leading-normal text-text-tertiary">
        {subtitle}
      </p>
    </div>
  );
}

export function JournalTradeChatStatsCard({
  metrics,
  netPnl,
  tradeId,
  rating = 0,
  executionQuality = 0,
  setupQuality = 0,
  disciplineScore = 0,
  accountId,
}: JournalTradeChatStatsCardProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const updateTradeRating = useUpdateTradeRating(accountId);
  const updateTradeAssessment = useUpdateTradeAssessment(accountId);

  // Local state for smooth sliding micro-interactions of primary sliders
  const [localExecution, setLocalExecution] = useState<number>(executionQuality);
  const [localSetup, setLocalSetup] = useState<number>(setupQuality);
  const [localDiscipline, setLocalDiscipline] = useState<number>(disciplineScore);

  // Custom metrics created dynamically by the user and stored in localStorage
  const [customMetrics, setCustomMetrics] = useState<{ id: string; label: string; subtitle: string }[]>([]);
  const [customScores, setCustomScores] = useState<Record<string, number>>({});
  
  // Custom metrics modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");

  // Synchronize local states when prop values change (e.g. user toggles trade)
  useEffect(() => {
    setLocalExecution(executionQuality);
  }, [executionQuality]);

  useEffect(() => {
    setLocalSetup(setupQuality);
  }, [setupQuality]);

  useEffect(() => {
    setLocalDiscipline(disciplineScore);
  }, [disciplineScore]);

  // Load custom metrics from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("journal:custom-metrics");
    if (stored) {
      try {
        setCustomMetrics(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse custom metrics", e);
      }
    }
  }, []);

  // Synchronize custom scores when tradeId changes
  useEffect(() => {
    if (typeof window === "undefined" || !tradeId) return;
    const stored = window.localStorage.getItem(`journal:custom-scores:${tradeId}`);
    if (stored) {
      try {
        setCustomScores(JSON.parse(stored));
      } catch (e) {
        setCustomScores({});
      }
    } else {
      setCustomScores({});
    }
  }, [tradeId]);

  const handleRatingClick = async (selectedRating: number) => {
    if (updateTradeRating.isPending) return;
    try {
      await updateTradeRating.mutateAsync({
        tradeId,
        rating: selectedRating,
      });
    } catch (error) {
      console.error("Failed to update rating:", error);
    }
  };

  const handleCommitAssessment = async (field: "execution" | "setup" | "discipline", val: number) => {
    if (updateTradeAssessment.isPending) return;
    try {
      await updateTradeAssessment.mutateAsync({
        tradeId,
        execution_quality: field === "execution" ? val : undefined,
        setup_quality: field === "setup" ? val : undefined,
        discipline_score: field === "discipline" ? val : undefined,
      });
    } catch (error) {
      console.error("Failed to update assessment:", error);
    }
  };

  const handleCreateCustomMetric = () => {
    if (!newLabel.trim()) return;
    const newMetric = {
      id: "custom-" + Date.now(),
      label: newLabel.trim(),
      subtitle: newSubtitle.trim(),
    };
    const updated = [...customMetrics, newMetric];
    setCustomMetrics(updated);
    window.localStorage.setItem("journal:custom-metrics", JSON.stringify(updated));
    setNewLabel("");
    setNewSubtitle("");
    setIsModalOpen(false);
  };

  const handleCustomScoreChange = (metricId: string, val: number) => {
    setCustomScores((prev) => ({ ...prev, [metricId]: val }));
  };

  const handleCommitCustomScore = (metricId: string, val: number) => {
    const updated = { ...customScores, [metricId]: val };
    setCustomScores(updated);
    window.localStorage.setItem(`journal:custom-scores:${tradeId}`, JSON.stringify(updated));
  };

  const activeRating = hoverRating ?? rating;

  return (
    <>
      <Card className="h-full border-0 bg-card-bg flex flex-col xl:max-h-[calc(100vh-6rem)] overflow-hidden">
        {/* Sticky Card Header */}
        <CardHeader className="border-b border-border-secondary p-6 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`h-12 w-1 rounded-full ${
                netPnl >= 0 ? "bg-kpi-metric-positive" : "bg-danger"
              }`}
            />
            <div>
              <p className="mb-1 text-sm font-semibold text-text-secondary">
                Net P&L
              </p>
              <CardTitle
                className={
                  netPnl >= 0 ? "text-kpi-metric-positive" : "text-danger"
                }
              >
                {formatCurrency(netPnl)}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        {/* Scrollable Card Content */}
        <CardContent className="space-y-6 p-6 overflow-y-auto scrollbar-thin flex-1 min-h-0">
          {/* Core trade metrics */}
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-center justify-between text-sm font-semibold"
            >
              <span className="text-text-secondary">{metric.label}</span>
              <span className={metric.valueClassName ?? "text-text-primary"}>
                {metric.value}
              </span>
            </div>
          ))}

          {/* Trade rating */}
          <div className="flex items-center justify-between border-t border-border-secondary pt-6 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Trade Rating</span>
              {updateTradeRating.isPending && (
                <Loader2 className="h-3 w-3 animate-spin text-text-tertiary" />
              )}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= activeRating;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleRatingClick(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    disabled={updateTradeRating.isPending}
                    className="focus:outline-none transition-transform duration-150 hover:scale-125 disabled:opacity-50"
                    aria-label={`Rate ${starValue} stars`}
                  >
                    <Star
                      className={`h-5 w-5 transition-all duration-200 ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]"
                          : "text-text-tertiary hover:text-amber-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Self Assessment Sliders */}
          <div className="space-y-6 border-t border-border-secondary pt-6">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-text-primary">Self Assessment</span>
              <div className="flex items-center gap-2">
                {updateTradeAssessment.isPending && (
                  <Loader2 className="h-3 w-3 animate-spin text-text-tertiary" />
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                  aria-label="Create self assessment"
                >
                  + Create
                </button>
              </div>
            </div>

            {/* Hardcoded DB assessment metrics */}
            <AssessmentSlider
              label="Execution Quality"
              subtitle="How well did you execute the trade? (Entry timing, stop placement, position sizing)"
              value={localExecution}
              onChange={setLocalExecution}
              onCommit={(val) => handleCommitAssessment("execution", val)}
              isPending={updateTradeAssessment.isPending}
            />

            <AssessmentSlider
              label="Setup Quality"
              subtitle="How good was the trade setup? (Chart pattern, confluence, risk/reward)"
              value={localSetup}
              onChange={setLocalSetup}
              onCommit={(val) => handleCommitAssessment("setup", val)}
              isPending={updateTradeAssessment.isPending}
            />

            <AssessmentSlider
              label="Discipline Score"
              subtitle="How disciplined were you? (Followed rules, emotional control, patience)"
              value={localDiscipline}
              onChange={setLocalDiscipline}
              onCommit={(val) => handleCommitAssessment("discipline", val)}
              isPending={updateTradeAssessment.isPending}
            />

            {/* Custom assessment metrics created dynamically */}
            {customMetrics.map((metric) => (
              <AssessmentSlider
                key={metric.id}
                label={metric.label}
                subtitle={metric.subtitle}
                value={customScores[metric.id] ?? 0}
                onChange={(val) => handleCustomScoreChange(metric.id, val)}
                onCommit={(val) => handleCommitCustomScore(metric.id, val)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Floating portal-like modal overlay to create custom metric */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border-primary bg-card-bg p-6 shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border-secondary pb-3">
              <h3 className="text-lg font-bold text-text-primary">Create Custom Assessment</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-text-tertiary hover:bg-bg-hover hover:text-text-primary transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Assessment Name</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., Emotional Control"
                  className="w-full rounded border border-border-primary bg-bg-input px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Subtitle / Description</label>
                <textarea
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="e.g., How well did you manage fear or greed during this trade?"
                  rows={3}
                  className="w-full rounded border border-border-primary bg-bg-input px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomMetric}
                disabled={!newLabel.trim()}
                className="rounded px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Slider
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
