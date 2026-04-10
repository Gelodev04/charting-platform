import type { KLineChartPro, Period } from "@klinecharts/pro";
import { FormatDateType, utils } from "klinecharts";

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function monthShortLabel(
  dateTimeFormat: Intl.DateTimeFormat,
  timestamp: number
): string {
  const m = Number(utils.formatDate(dateTimeFormat, timestamp, "M"));
  if (m >= 1 && m <= 12) return MONTH_SHORT[m - 1];
  return utils.formatDate(dateTimeFormat, timestamp, "YYYY-MM");
}

function isIntradayPeriod(p: Period): boolean {
  return p.timespan === "minute" || p.timespan === "hour";
}

function formatXAxis(
  dateTimeFormat: Intl.DateTimeFormat,
  timestamp: number,
  format: string,
  period: Period
): string {
  const dayOfMonth = String(
    Number(utils.formatDate(dateTimeFormat, timestamp, "D"))
  );

  if (format === "YYYY") {
    return utils.formatDate(dateTimeFormat, timestamp, "YYYY");
  }

  if (format === "YYYY-MM") {
    const y = utils.formatDate(dateTimeFormat, timestamp, "YYYY");
    return `${monthShortLabel(dateTimeFormat, timestamp)} ${y}`;
  }

  if (format === "MM-DD" || format === "M-D") {
    if (isIntradayPeriod(period)) {
      return `${monthShortLabel(dateTimeFormat, timestamp)} ${dayOfMonth}`;
    }
    return utils.formatDate(dateTimeFormat, timestamp, format);
  }

  if (format === "HH:mm") {
    return utils.formatDate(dateTimeFormat, timestamp, "HH:mm");
  }

  if (format === "YYYY-MM-DD HH:mm") {
    const mon = monthShortLabel(dateTimeFormat, timestamp);
    const y = utils.formatDate(dateTimeFormat, timestamp, "YYYY");
    const hm = utils.formatDate(dateTimeFormat, timestamp, "HH:mm");
    return `${mon} ${dayOfMonth}, ${y} ${hm}`;
  }

  return utils.formatDate(dateTimeFormat, timestamp, format);
}

function formatTooltipCrosshair(
  dateTimeFormat: Intl.DateTimeFormat,
  timestamp: number,
  period: Period
): string {
  switch (period.timespan) {
    case "minute":
    case "hour":
      return utils.formatDate(dateTimeFormat, timestamp, "YYYY-MM-DD HH:mm");
    case "day":
    case "week":
    case "month":
    case "year":
      return utils.formatDate(dateTimeFormat, timestamp, "YYYY-MM-DD");
    default:
      return utils.formatDate(dateTimeFormat, timestamp, "YYYY-MM-DD HH:mm");
  }
}

/**
 * Chart Pro defaults X-axis minute labels to HH:mm only. TradingView-style axes
 * use day-of-month when zoomed out on intraday; we extend via merged customApi.formatDate.
 */
export function createKlinePreviewFormatDate(getPeriod: () => Period) {
  return (
    dateTimeFormat: Intl.DateTimeFormat,
    timestamp: number,
    format: string,
    type: FormatDateType
  ): string => {
    const period = getPeriod();
    if (type === FormatDateType.XAxis) {
      return formatXAxis(dateTimeFormat, timestamp, format, period);
    }
    return formatTooltipCrosshair(dateTimeFormat, timestamp, period);
  };
}

type ChartProInternals = {
  _chartApi?: {
    setCustomApi?: (a: {
      formatDate: ReturnType<typeof createKlinePreviewFormatDate>;
    }) => void;
  };
};

/**
 * KLineChart Pro's public `_chartApi` is normally a thin facade without
 * `setCustomApi`. We patch `node_modules/@klinecharts/pro` (see `patches/`)
 * to forward it to the real klinecharts instance.
 */
export function applyPreviewCustomDateFormat(
  chart: KLineChartPro,
  getPeriod: () => Period
): void {
  const formatDate = createKlinePreviewFormatDate(getPeriod);
  const tryApply = (): boolean => {
    const setCustomApi = (chart as unknown as ChartProInternals)._chartApi
      ?.setCustomApi;
    if (typeof setCustomApi !== "function") return false;
    setCustomApi({ formatDate });
    return true;
  };

  if (tryApply()) return;

  let attempts = 0;
  const maxAttempts = 30;
  const pump = () => {
    attempts += 1;
    if (tryApply()) return;
    if (attempts < maxAttempts) requestAnimationFrame(pump);
  };
  requestAnimationFrame(pump);
}
