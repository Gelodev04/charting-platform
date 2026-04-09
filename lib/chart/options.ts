import type { ChartProOptions, Datafeed, Period } from "@klinecharts/pro";
import {
  LineType,
  type CandleTooltipCustomCallbackData,
  type DeepPartial,
  type Styles,
} from "klinecharts";

import { BinanceDatafeed } from "@/lib/datafeed/binance";
import { CHART_TOOLBAR_PERIODS } from "@/lib/chart/periods";

export const KLINE_PREVIEW_CANDLE_UP = "#089981";
export const KLINE_PREVIEW_CANDLE_DOWN = "#f23645";
export type ChartCandleType =
  | "candle_solid"
  | "candle_stroke"
  | "candle_up_stroke"
  | "candle_down_stroke"
  | "ohlc";
export const DEFAULT_CHART_CANDLE_TYPE: ChartCandleType = "candle_solid";

const KLINE_PREVIEW_GRID_SIZE = 1;

const KLINE_PREVIEW_LAST_PRICE_DASH = [2, 2] as const;

function fmt(v: number, precision = 2): string {
  return v.toFixed(precision);
}

export function getKlinePreviewChartStyles(
  theme: string,
  candleType: ChartCandleType = DEFAULT_CHART_CANDLE_TYPE,
  symbolLabel = "BTC / USDT"
): DeepPartial<Styles> {
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
      type: candleType as Styles["candle"]["type"],
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
      tooltip: {
        text: {
          size: 15,
          weight: 500,
        },
        custom: (data: CandleTooltipCustomCallbackData) => {
          const current = data.current;
          const up = current.close >= current.open;
          const ohlcColor = up
            ? KLINE_PREVIEW_CANDLE_UP
            : KLINE_PREVIEW_CANDLE_DOWN;
          return [
            {
              title: { text: "", color: "#8b9199" },
              value: { text: symbolLabel, color: "#e8eaed" },
            },
            {
              title: { text: "O", color: "#8b9199" },
              value: { text: fmt(current.open), color: ohlcColor },
            },
            {
              title: { text: "H", color: "#8b9199" },
              value: { text: fmt(current.high), color: ohlcColor },
            },
            {
              title: { text: "L", color: "#8b9199" },
              value: { text: fmt(current.low), color: ohlcColor },
            },
            {
              title: { text: "C", color: "#8b9199" },
              value: { text: fmt(current.close), color: ohlcColor },
            },
          ];
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

export type KlinePreviewSymbol = ChartProOptions["symbol"];

export const DEFAULT_KLINE_PERIOD = {
  multiplier: 15,
  timespan: "minute",
  text: "15m",
} as const;

export function buildKlinePreviewOptions(
  container: HTMLElement,
  locale: string,
  datafeed: Datafeed = new BinanceDatafeed(),
  overrides?: {
    period?: Period;
    theme?: string;
    drawingBarVisible?: boolean;
    symbol?: KlinePreviewSymbol;
    symbolLabel?: string;
  }
): ChartProOptions {
  const period = overrides?.period ?? { ...DEFAULT_KLINE_PERIOD };
  return {
    container,
    locale,
    theme: overrides?.theme ?? "light",
    styles: getKlinePreviewChartStyles(
      overrides?.theme ?? "light",
      DEFAULT_CHART_CANDLE_TYPE,
      overrides?.symbolLabel ?? "BTC / USDT"
    ),
    watermark: "",
    symbol: overrides?.symbol ?? BTC_USDT_SYMBOL,
    period,
    periods: [...CHART_TOOLBAR_PERIODS],
    drawingBarVisible: overrides?.drawingBarVisible ?? true,
    mainIndicators: [],
    subIndicators: [],
    datafeed,
  };
}
