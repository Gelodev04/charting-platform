import type { KLineChartPro, Period } from "@klinecharts/pro";
import { FormatDateType, utils } from "klinecharts";

/**
 * Chart Pro defaults X-axis minute labels to HH:mm only. TradingView-style axes
 * include month/day on intraday ticks; we extend via merged customApi.formatDate.
 */
export function createKlinePreviewFormatDate(getPeriod: () => Period) {
  return (
    dateTimeFormat: Intl.DateTimeFormat,
    timestamp: number,
    format: string,
    type: FormatDateType
  ): string => {
    const timespan = getPeriod().timespan;

    if (type === FormatDateType.XAxis) {
      if (
        (timespan === "minute" || timespan === "hour") &&
        format === "HH:mm"
      ) {
        return utils.formatDate(dateTimeFormat, timestamp, "MM-DD HH:mm");
      }
      return utils.formatDate(dateTimeFormat, timestamp, format);
    }

    switch (timespan) {
      case "minute":
      case "hour":
        return utils.formatDate(dateTimeFormat, timestamp, "YYYY-MM-DD HH:mm");
      case "day":
      case "week":
        return utils.formatDate(dateTimeFormat, timestamp, "YYYY-MM-DD");
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
