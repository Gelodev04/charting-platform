export type ChartLayoutId = "1" | "2" | "4";

export const CHART_LAYOUT_STORAGE_KEY = "kline-preview-chart-layout";

export function chartLayoutCellCount(id: ChartLayoutId): number {
  if (id === "2") return 2;
  if (id === "4") return 4;
  return 1;
}

export function readStoredChartLayout(): ChartLayoutId {
  if (typeof window === "undefined") return "1";
  try {
    const s = localStorage.getItem(CHART_LAYOUT_STORAGE_KEY);
    if (s === "1" || s === "2" || s === "4") return s;
  } catch {
    /* ignore */
  }
  return "1";
}
