import type { ChartProOptions, Datafeed, Period } from "@klinecharts/pro";
import { LineType, type DeepPartial, type Styles } from "klinecharts";

import { BinanceDatafeed } from "@/lib/datafeed/binance";
import { CHART_TOOLBAR_PERIODS } from "@/lib/chart/periods";

export const KLINE_PREVIEW_CANDLE_UP = "#089981";
export const KLINE_PREVIEW_CANDLE_DOWN = "#f23645";

const KLINE_PREVIEW_GRID_SIZE = 1;

const KLINE_PREVIEW_LAST_PRICE_DASH = [2, 2] as const;

export function getKlinePreviewChartStyles(theme: string): DeepPartial<Styles> {
  const gridColor =
    theme === "dark"
      ? "rgba(255, 255, 255, 0.045)"
      : "rgba(15, 23, 42, 0.06)";
  const gridLine = {
    show: true,
    style: LineType.Solid,
    color: gridColor,
    size: KLINE_PREVIEW_GRID_SIZE,
  };
  return {
    grid: {
      show: true,
      horizontal: { ...gridLine },
      vertical: { ...gridLine },
    },
    candle: {
      bar: {
        upColor: KLINE_PREVIEW_CANDLE_UP,
        downColor: KLINE_PREVIEW_CANDLE_DOWN,
        upBorderColor: KLINE_PREVIEW_CANDLE_UP,
        downBorderColor: KLINE_PREVIEW_CANDLE_DOWN,
        upWickColor: KLINE_PREVIEW_CANDLE_UP,
        downWickColor: KLINE_PREVIEW_CANDLE_DOWN,
      },
      priceMark: {
        last: {
          upColor: KLINE_PREVIEW_CANDLE_UP,
          downColor: KLINE_PREVIEW_CANDLE_DOWN,
          noChangeColor: "#787b86",
          line: {
            style: LineType.Dashed,
            dashedValue: [...KLINE_PREVIEW_LAST_PRICE_DASH],
            size: 1,
          },
        },
      },
    },
  };
}

export const BTC_USDT_SYMBOL: ChartProOptions["symbol"] = {
  exchange: "BINANCE",
  market: "crypto",
  name: "Bitcoin / TetherUS",
  shortName: "BTC",
  ticker: "BTCUSDT",
  priceCurrency: "usdt",
  pricePrecision: 2,
  volumePrecision: 5,
  type: "crypto",
};

export const DEFAULT_KLINE_PERIOD = {
  multiplier: 15,
  timespan: "minute",
  text: "15m",
} as const;

export function buildKlinePreviewOptions(
  container: HTMLElement,
  locale: string,
  datafeed: Datafeed = new BinanceDatafeed(),
  overrides?: { period?: Period; theme?: string; drawingBarVisible?: boolean }
): ChartProOptions {
  const period = overrides?.period ?? { ...DEFAULT_KLINE_PERIOD };
  return {
    container,
    locale,
    theme: overrides?.theme ?? "light",
    styles: getKlinePreviewChartStyles(overrides?.theme ?? "light"),
    watermark: "",
    symbol: BTC_USDT_SYMBOL,
    period,
    periods: [...CHART_TOOLBAR_PERIODS],
    drawingBarVisible: overrides?.drawingBarVisible ?? true,
    mainIndicators: [],
    subIndicators: [],
    datafeed,
  };
}
