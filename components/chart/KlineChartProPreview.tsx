"use client";

import "@/lib/klinecharts/register-smooth-rect";
import "@/lib/klinecharts/register-adaptive-xaxis";
import "@/lib/klinecharts/register-dense-yaxis";
import { KLineChartPro } from "@klinecharts/pro";
import "@klinecharts/pro/dist/klinecharts-pro.css";
import type { Period } from "@klinecharts/pro";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  clickKlineProFullscreen,
  clickKlineProIndicator,
  clickKlineProScreenshot,
  clickKlineProSettings,
  clickKlineProTimezone,
} from "@/lib/chart/actions";
import { BinanceDatafeed } from "@/lib/datafeed/binance";
import {
  CHART_HISTORY_RANGE_OPTIONS,
  CHART_HISTORY_RANGE_STORAGE_KEY,
  type ChartHistoryRangeId,
  readStoredChartHistoryRange,
} from "@/lib/chart/history-range";
import {
  CHART_LAYOUT_STORAGE_KEY,
  chartLayoutCellCount,
  type ChartLayoutId,
  readStoredChartLayout,
} from "@/lib/chart/layout";
import { injectDrawingBarTools } from "@/lib/chart/drawing-bar";
import { applyPreviewCustomDateFormat } from "@/lib/chart/custom-date-format";
import {
  BTC_USDT_SYMBOL,
  DEFAULT_CHART_CANDLE_TYPE,
  type ChartCandleType,
  type KlinePreviewSymbol,
  buildKlinePreviewOptions,
  DEFAULT_KLINE_PERIOD,
  getKlinePreviewChartStyles,
} from "@/lib/chart/options";
import { useChartTheme } from "@/hooks/chart/useChartTheme";
import { useHashLocale } from "@/hooks/chart/useHashLocale";
import { useLocalClock } from "@/hooks/chart/useLocalClock";
import { ToolbarIconCalendar } from "@/components/ui/icons";

import { ChartToolbar, type ChartColorScheme } from "./ChartToolbar";
import "./KlineChartProPreview.css";

type Locale = "zh-CN" | "en-US";

function resolveLocale(): Locale {
  if (typeof window === "undefined") return "en-US";
  return window.location.hash.includes("zh-CN") ? "zh-CN" : "en-US";
}

const THEME_STORAGE_KEY = "kline-preview-color-scheme";
const SYMBOL_STORAGE_KEY = "kline-preview-symbol-ticker";
const CANDLE_TYPE_STORAGE_KEY = "kline-preview-candle-type";
const BINANCE_EXCHANGE_INFO_URL = "https://api.binance.com/api/v3/exchangeInfo";

const KNOWN_QUOTES = ["USDT", "USDC", "BUSD", "BTC", "ETH", "BNB"] as const;

function splitTicker(ticker: string): { base: string; quote: string } {
  const upper = ticker.toUpperCase();
  for (const quote of KNOWN_QUOTES) {
    if (upper.endsWith(quote) && upper.length > quote.length) {
      return { base: upper.slice(0, upper.length - quote.length), quote };
    }
  }
  return { base: upper, quote: "" };
}

function buildSymbolInfo(ticker: string): KlinePreviewSymbol {
  const safeTicker = ticker.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const { base, quote } = splitTicker(safeTicker);
  return {
    exchange: "BINANCE",
    market: "crypto",
    name: quote ? `${base} / ${quote}` : base,
    shortName: base,
    ticker: safeTicker,
    priceCurrency: quote.toLowerCase(),
    pricePrecision: 6,
    volumePrecision: 5,
    type: "crypto",
  };
}

function symbolTooltipLabel(symbol: KlinePreviewSymbol): string {
  const base = symbol.shortName ?? "";
  const quote = symbol.priceCurrency?.toUpperCase() ?? "";
  return quote ? `${base} / ${quote}` : (symbol.name ?? base);
}

function readInitialColorScheme(): ChartColorScheme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readInitialCandleType(): ChartCandleType {
  if (typeof window === "undefined") return DEFAULT_CHART_CANDLE_TYPE;
  try {
    const stored = localStorage.getItem(CANDLE_TYPE_STORAGE_KEY);
    if (
      stored === "candle_solid" ||
      stored === "candle_stroke" ||
      stored === "candle_up_stroke" ||
      stored === "candle_down_stroke" ||
      stored === "ohlc"
    ) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_CHART_CANDLE_TYPE;
}

function destroyPane(el: HTMLDivElement | null) {
  if (!el) return;
  el.replaceChildren();
  el.classList.remove("klinecharts-pro");
  el.removeAttribute("data-theme");
}

function historyRangeBarSpace(id: ChartHistoryRangeId): number {
  switch (id) {
    case "1D":
      return 11;
    case "5D":
      return 8;
    case "1M":
      return 6;
    case "3M":
      return 4;
    case "6M":
      return 3;
    case "YTD":
    case "1Y":
      return 2;
    case "5Y":
    case "All":
      return 1.2;
  }
}

/** Wider bars (higher space) ≈ more zoomed in; scales with timeframe like TradingView. */
function periodBarSpaceFactor(period: Period): number {
  if (period.timespan === "minute") {
    if (period.multiplier <= 1) return 1.45;
    if (period.multiplier <= 3) return 1.18;
    if (period.multiplier <= 5) return 1.1;
    if (period.multiplier >= 30) return 0.78;
    if (period.multiplier >= 15) return 0.9;
  }
  if (period.timespan === "hour") {
    if (period.multiplier >= 8) return 0.88;
    return 0.95;
  }
  return 1;
}

function clampChartBarSpace(n: number): number {
  return Math.min(50, Math.max(1, n));
}

function applyHistoryRangeViewport(
  charts: KLineChartPro[],
  historyRangeId: ChartHistoryRangeId,
  period: Period
) {
  const base = historyRangeBarSpace(historyRangeId);
  const barSpace = clampChartBarSpace(base * periodBarSpaceFactor(period));
  for (const chart of charts) {
    const chartApi = (chart as unknown as { _chartApi?: unknown })._chartApi as
      | {
        setBarSpace?: (space: number) => void;
        setOffsetRightDistance?: (distance: number) => void;
        setLeftMinVisibleBarCount?: (barCount: number) => void;
        setRightMinVisibleBarCount?: (barCount: number) => void;
        scrollToRealTime?: (animationDuration?: number) => void;
      }
      | undefined;
    if (!chartApi) continue;
    chartApi.setBarSpace?.(barSpace);
    chartApi.setLeftMinVisibleBarCount?.(1);
    chartApi.setRightMinVisibleBarCount?.(1);
    chartApi.setOffsetRightDistance?.(8);
    chartApi.scrollToRealTime?.(0);
  }
}

export function KlineChartProPreview() {
  const chartsRef = useRef<KLineChartPro[]>([]);
  const periodRef = useRef<Period>({ ...DEFAULT_KLINE_PERIOD });
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const primaryChartHostRef = useRef<HTMLDivElement | null>(null);

  const locale = useHashLocale(resolveLocale);
  const [period, setPeriod] = useState<Period>(() => ({ ...DEFAULT_KLINE_PERIOD }));
  const [colorScheme, setColorScheme] = useState<ChartColorScheme>(() =>
    readInitialColorScheme()
  );
  const [chartLayout, setChartLayout] = useState<ChartLayoutId>(() =>
    readStoredChartLayout()
  );
  const [historyRange, setHistoryRange] = useState<ChartHistoryRangeId>(() =>
    readStoredChartHistoryRange()
  );
  const [selectedSymbol, setSelectedSymbol] =
    useState<KlinePreviewSymbol>(BTC_USDT_SYMBOL);
  const [candleType, setCandleType] = useState<ChartCandleType>(() =>
    readInitialCandleType()
  );
  const [symbolOptions, setSymbolOptions] = useState<
    Array<{ ticker: string; label: string }>
  >(() => [{ ticker: "BTCUSDT", label: "BTC / USDT" }]);
  const sessionClockLabel = useLocalClock();
  const colorSchemeRef = useRef<ChartColorScheme>(colorScheme);
  const historyRangeRef = useRef<ChartHistoryRangeId>(historyRange);

  useEffect(() => {
    colorSchemeRef.current = colorScheme;
    periodRef.current = period;
    historyRangeRef.current = historyRange;
  }, [colorScheme, period, historyRange]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SYMBOL_STORAGE_KEY);
      if (stored) setSelectedSymbol(buildSymbolInfo(stored));
    } catch {
      /* ignore */
    }

    let cancelled = false;
    const loadSymbols = async () => {
      try {
        const res = await fetch(BINANCE_EXCHANGE_INFO_URL);
        if (!res.ok) return;
        const payload = (await res.json()) as {
          symbols?: Array<{
            symbol?: string;
            status?: string;
            quoteAsset?: string;
            isSpotTradingAllowed?: boolean;
          }>;
        };
        const symbols = (payload.symbols ?? [])
          .filter((item) => {
            if (!item.symbol || item.status !== "TRADING") return false;
            if (!item.isSpotTradingAllowed) return false;
            return item.quoteAsset === "USDT";
          })
          .map((item) => item.symbol as string)
          .sort((a, b) => a.localeCompare(b))
          .slice(0, 120);
        if (!symbols.includes("BTCUSDT")) symbols.unshift("BTCUSDT");
        const options = symbols.map((ticker) => {
          const { base, quote } = splitTicker(ticker);
          return {
            ticker,
            label: quote ? `${base} / ${quote}` : base,
          };
        });
        if (!cancelled && options.length > 0) setSymbolOptions(options);
      } catch {
        /* ignore network failures and keep fallback list */
      }
    };

    void loadSymbols();
    return () => {
      cancelled = true;
    };
  }, []);

  useChartTheme(colorScheme, THEME_STORAGE_KEY);

  useLayoutEffect(() => {
    let cancelled = false;
    const resizeObservers: ResizeObserver[] = [];
    const createdDatafeeds: BinanceDatafeed[] = [];
    const createdHosts: HTMLDivElement[] = [];

    const notifyChartResize = () => {
      window.dispatchEvent(new Event("resize"));
    };

    const count = chartLayoutCellCount(chartLayout);

    const frame = requestAnimationFrame(() => {
      if (cancelled) return;

      const charts: KLineChartPro[] = [];
      for (let i = 0; i < count; i++) {
        const el = cellRefs.current[i];
        if (!el) continue;
        createdHosts.push(el);
        const datafeed = new BinanceDatafeed(() => historyRangeRef.current);
        createdDatafeeds.push(datafeed);
        const drawingBarVisible = count === 1 || i === 0;
        const chart = new KLineChartPro(
          buildKlinePreviewOptions(el, locale, datafeed, {
            period: periodRef.current,
            theme: colorSchemeRef.current,
            symbol: selectedSymbol,
            symbolLabel: symbolTooltipLabel(selectedSymbol),
            drawingBarVisible,
          })
        );
        charts.push(chart);
        const ro = new ResizeObserver(() => {
          if (!cancelled) notifyChartResize();
        });
        ro.observe(el);
        resizeObservers.push(ro);
      }
      chartsRef.current = charts;

      const previewStyles = getKlinePreviewChartStyles(
        colorSchemeRef.current,
        candleType,
        symbolTooltipLabel(selectedSymbol)
      );
      charts.forEach((c) => {
        c.setStyles(previewStyles);
        applyPreviewCustomDateFormat(c, () => periodRef.current);
      });
      applyHistoryRangeViewport(
        charts,
        historyRangeRef.current,
        periodRef.current
      );

      const injectedCleanups: (() => void)[] = [];
      const primaryHost = createdHosts[0];
      if (primaryHost) {
        injectedCleanups.push(injectDrawingBarTools(primaryHost));
      }

      notifyChartResize();
      queueMicrotask(notifyChartResize);
      requestAnimationFrame(notifyChartResize);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObservers.forEach((ro) => ro.disconnect());
      const p = periodRef.current;
      for (const df of createdDatafeeds) {
        df.unsubscribe(selectedSymbol, { ...p });
      }
      chartsRef.current = [];
      for (const host of createdHosts) {
        destroyPane(host);
      }
    };
  }, [locale, chartLayout, historyRange, selectedSymbol, candleType]);

  useEffect(() => {
    chartsRef.current.forEach((c) => {
      c.setTheme(colorScheme);
      c.setStyles(
        getKlinePreviewChartStyles(
          colorScheme,
          candleType,
          symbolTooltipLabel(selectedSymbol)
        )
      );
    });
  }, [colorScheme, candleType, selectedSymbol]);

  const applyPeriod = useCallback((p: Period) => {
    const nextPeriod = { ...p };
    periodRef.current = nextPeriod;
    setPeriod(nextPeriod);
    chartsRef.current.forEach((c) => {
      c.setPeriod({ ...nextPeriod });
      applyPreviewCustomDateFormat(c, () => periodRef.current);
    });
    applyHistoryRangeViewport(
      chartsRef.current,
      historyRangeRef.current,
      nextPeriod
    );
  }, []);

  const onChartLayoutChange = useCallback((id: ChartLayoutId) => {
    setChartLayout(id);
    try {
      localStorage.setItem(CHART_LAYOUT_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const onHistoryRangeChange = useCallback((id: ChartHistoryRangeId) => {
    setHistoryRange(id);
    try {
      localStorage.setItem(CHART_HISTORY_RANGE_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const onSymbolChange = useCallback((ticker: string) => {
    const next = buildSymbolInfo(ticker);
    setSelectedSymbol(next);
    try {
      localStorage.setItem(SYMBOL_STORAGE_KEY, next.ticker);
    } catch {
      /* ignore */
    }
  }, []);

  const count = chartLayoutCellCount(chartLayout);
  const gridClass =
    chartLayout === "1"
      ? "kline-preview-chart-grid kline-preview-chart-grid--1"
      : chartLayout === "2"
        ? "kline-preview-chart-grid kline-preview-chart-grid--2"
        : "kline-preview-chart-grid kline-preview-chart-grid--4";

  const primaryRoot = () => primaryChartHostRef.current;

  return (
    <div className={`kline-preview-root kline-preview-root--${colorScheme}`}>
      <ChartToolbar
        symbolTicker={selectedSymbol.shortName ?? "BTC"}
        symbolQuote={selectedSymbol.priceCurrency?.toUpperCase() ?? "USDT"}
        symbolHint={selectedSymbol.name ?? ""}
        symbolOptions={symbolOptions}
        onSymbolChange={onSymbolChange}
        period={period}
        onPeriodChange={applyPeriod}
        candleType={candleType}
        onCandleTypeChange={(type) => {
          setCandleType(type);
          try {
            localStorage.setItem(CANDLE_TYPE_STORAGE_KEY, type);
          } catch {
            /* ignore */
          }
        }}
        onIndicatorsClick={() => {
          const root = primaryRoot();
          if (root) clickKlineProIndicator(root);
        }}
        onSettingsClick={() => {
          const root = primaryRoot();
          if (root) clickKlineProSettings(root);
        }}
        onScreenshotClick={() => {
          const root = primaryRoot();
          if (root) clickKlineProScreenshot(root);
        }}
        onFullscreenClick={() => {
          const root = primaryRoot();
          if (root) clickKlineProFullscreen(root);
        }}
        colorScheme={colorScheme}
        onColorSchemeToggle={() =>
          setColorScheme((s) => (s === "light" ? "dark" : "light"))
        }
        chartLayout={chartLayout}
        onChartLayoutChange={onChartLayoutChange}
      />
      <div className="kline-preview-chart-wrapper">
        <div className={`${gridClass} kline-preview-chart-host--fill`}>
          {Array.from({ length: count }, (_, i) => (
            <div
              key={i}
              ref={(el) => {
                cellRefs.current[i] = el;
                if (i === 0) primaryChartHostRef.current = el;
              }}
              className="kline-preview-chart-cell"
            />
          ))}
        </div>
        <div
          className="kline-preview-range-bar"
          role="group"
          aria-label="Visible history range"
        >
          {CHART_HISTORY_RANGE_OPTIONS.map((id) => (
            <button
              key={id}
              type="button"
              className={
                historyRange === id
                  ? "kline-preview-range-bar__btn kline-preview-range-bar__btn--active"
                  : "kline-preview-range-bar__btn"
              }
              aria-pressed={historyRange === id}
              onClick={() => onHistoryRangeChange(id)}
            >
              {id}
            </button>
          ))}
          <span className="kline-preview-range-bar__divider" aria-hidden />
          <button
            type="button"
            className="kline-preview-range-bar__goto"
            title="Go to date"
            aria-label="Go to date"
            onClick={() => { }}
          >
            <ToolbarIconCalendar />
          </button>
          <button
            type="button"
            className="kline-preview-range-bar__clock"
            title="Local time — click to open timezone settings"
            aria-label="Local session clock, opens timezone settings"
            onClick={() => {
              const root = primaryRoot();
              if (root) clickKlineProTimezone(root);
            }}
          >
            {sessionClockLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
