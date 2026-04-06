export type ChartHistoryRangeId =
  | "1D"
  | "5D"
  | "1M"
  | "3M"
  | "6M"
  | "YTD"
  | "1Y"
  | "5Y"
  | "All";

export const CHART_HISTORY_RANGE_STORAGE_KEY = "kline-preview-history-range";

export const CHART_HISTORY_RANGE_OPTIONS: ChartHistoryRangeId[] = [
  "1D",
  "5D",
  "1M",
  "3M",
  "6M",
  "YTD",
  "1Y",
  "5Y",
  "All",
];

const DAY_MS = 86400000;

export type HistorySpanMode =
  | { kind: "ms"; ms: number }
  | { kind: "ytd" }
  | { kind: "all" };

export function historyRangeToMode(id: ChartHistoryRangeId): HistorySpanMode {
  switch (id) {
    case "1D":
      return { kind: "ms", ms: DAY_MS };
    case "5D":
      return { kind: "ms", ms: 5 * DAY_MS };
    case "1M":
      return { kind: "ms", ms: 30 * DAY_MS };
    case "3M":
      return { kind: "ms", ms: 90 * DAY_MS };
    case "6M":
      return { kind: "ms", ms: 180 * DAY_MS };
    case "YTD":
      return { kind: "ytd" };
    case "1Y":
      return { kind: "ms", ms: 365 * DAY_MS };
    case "5Y":
      return { kind: "ms", ms: 5 * 365 * DAY_MS };
    case "All":
      return { kind: "all" };
  }
}

/**
 * Oldest timestamp to request. Pro passes `requestedFrom` (~500 bars); user range may be
 * shorter (1D -> crop) or longer (3M -> extend). Timestamps: older = smaller.
 */
export function effectiveHistoryFromMs(
  to: number,
  requestedFrom: number,
  id: ChartHistoryRangeId
): number {
  const mode = historyRangeToMode(id);
  if (mode.kind === "all") {
    const deep = to - 10 * 365 * DAY_MS;
    return Math.min(requestedFrom, deep);
  }
  let wantStart: number;
  if (mode.kind === "ytd") {
    const y = new Date(to).getUTCFullYear();
    wantStart = Date.UTC(y, 0, 1);
  } else {
    wantStart = to - mode.ms;
  }
  return requestedFrom < wantStart
    ? Math.max(requestedFrom, wantStart)
    : Math.min(requestedFrom, wantStart);
}

const VALID_HISTORY_RANGE = new Set<string>(CHART_HISTORY_RANGE_OPTIONS);

export function readStoredChartHistoryRange(): ChartHistoryRangeId {
  if (typeof window === "undefined") return "1D";
  try {
    const s = localStorage.getItem(CHART_HISTORY_RANGE_STORAGE_KEY);
    if (s && VALID_HISTORY_RANGE.has(s)) return s as ChartHistoryRangeId;
  } catch {
    /* ignore */
  }
  return "1D";
}
