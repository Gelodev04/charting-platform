import type { KLineChartPro, Period } from "@klinecharts/pro";
import { FormatDateType, utils } from "klinecharts";

/**
 * Chart Pro defaults X-axis minute labels to HH:mm only. TradingView-style axes
 * include month/day on intraday ticks; we extend via merged customApi.formatDate.
 */
export function createKlinePreviewFormatDate(getPeriod: () => Period) {
  const monthNames = [
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

  const monthLabel = (
    dateTimeFormat: Intl.DateTimeFormat,
    timestamp: number
  ): string => {
    const monthNumber = Number(utils.formatDate(dateTimeFormat, timestamp, "M"));
    if (monthNumber >= 1 && monthNumber <= 12) return monthNames[monthNumber - 1];
    return utils.formatDate(dateTimeFormat, timestamp, "YYYY-MM");
  };

  const monthDayTime = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const monthDay = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
  });

  return (
    dateTimeFormat: Intl.DateTimeFormat,
    timestamp: number,
    format: string,
    type: FormatDateType
  ): string => {
    const timespan = getPeriod().timespan;
    const dayOfMonth = utils.formatDate(dateTimeFormat, timestamp, "D");
    const isMonthBoundary = dayOfMonth === "1";

    if (type === FormatDateType.XAxis) {
      const dayFormat =
        format === "D" ||
        format === "DD" ||
        format === "M-D" ||
        format === "MM-DD";

      if (isMonthBoundary && dayFormat) {
        return monthLabel(dateTimeFormat, timestamp);
      }

      if (
        (timespan === "minute" || timespan === "hour") &&
        format === "HH:mm"
      ) {
        const hourMinute = utils.formatDate(dateTimeFormat, timestamp, "HH:mm");
        if (isMonthBoundary && hourMinute === "00:00") {
          return monthLabel(dateTimeFormat, timestamp);
        }
        return monthDayTime.format(timestamp);
      }

      if (timespan === "day" || timespan === "week") {
        if (isMonthBoundary) return monthLabel(dateTimeFormat, timestamp);
        return monthDay.format(timestamp);
      }

      return utils.formatDate(dateTimeFormat, timestamp, format);
    }

    switch (timespan) {
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
  const setCustomApi = (chart as unknown as ChartProInternals)._chartApi
    ?.setCustomApi;
  if (typeof setCustomApi !== "function") return;
  setCustomApi({
    formatDate: createKlinePreviewFormatDate(getPeriod),
  });
}
