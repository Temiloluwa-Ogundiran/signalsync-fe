import type { JournalWidgetConfig, JournalWidgetId } from "../types";

const DEFAULT_WIDGET_ORDER: JournalWidgetId[] = [
  "toolbar",
  "kpiStrip",
  "calendar",
  "tradesPanel",
  "symbols",
  "timePerformance",
];

export function getDefaultJournalWidgetRegistry(): JournalWidgetConfig[] {
  return DEFAULT_WIDGET_ORDER.map((id, index) => ({
    id,
    order: index,
    visible: true,
  }));
}

