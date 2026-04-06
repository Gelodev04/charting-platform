import type { Period } from "@klinecharts/pro";

/** Periods shown in the custom toolbar (matches @klinecharts/pro defaults). */
export const CHART_TOOLBAR_PERIODS: Period[] = [
  { multiplier: 1, timespan: "minute", text: "1m" },
  { multiplier: 5, timespan: "minute", text: "5m" },
  { multiplier: 15, timespan: "minute", text: "15m" },
  { multiplier: 1, timespan: "hour", text: "1H" },
  { multiplier: 2, timespan: "hour", text: "2H" },
  { multiplier: 4, timespan: "hour", text: "4H" },
  { multiplier: 1, timespan: "day", text: "D" },
  { multiplier: 1, timespan: "week", text: "W" },
  { multiplier: 1, timespan: "month", text: "M" },
  { multiplier: 1, timespan: "year", text: "Y" },
];
