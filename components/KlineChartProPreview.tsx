"use client";

import "@/lib/register-klinecharts-dense-grid";
import "@/lib/register-smooth-klinecharts-rect";
import { KLineChartPro } from "@klinecharts/pro";
import "@klinecharts/pro/dist/klinecharts-pro.css";
import type { Period } from "@klinecharts/pro";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  ChartToolbar,
  type ChartColorScheme,
} from "@/components/ChartToolbar";
import {
  clickKlineProFullscreen,
  clickKlineProIndicator,
  clickKlineProScreenshot,
  clickKlineProSettings,
  clickKlineProTimezone,
} from "@/components/kline-pro-chart-actions";
import { BinanceDatafeed } from "@/lib/binance-datafeed";
import {
  CHART_LAYOUT_STORAGE_KEY,
  chartLayoutCellCount,
  type ChartLayoutId,
  readStoredChartLayout,
} from "@/lib/chart-layout";
import {
  BTC_USDT_SYMBOL,
  buildKlinePreviewOptions,
  DEFAULT_KLINE_PERIOD,
  getKlinePreviewChartStyles,
} from "@/lib/klinechart-preview-options";

import "./kline-chart-pro-preview.css";

type Locale = "zh-CN" | "en-US";

function resolveLocale(): Locale {
  if (typeof window === "undefined") return "en-US";
  return window.location.hash.includes("zh-CN") ? "zh-CN" : "en-US";
}

const THEME_STORAGE_KEY = "kline-preview-color-scheme";

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

function destroyPane(el: HTMLDivElement | null) {
  if (!el) return;
  el.replaceChildren();
  el.classList.remove("klinecharts-pro");
  el.removeAttribute("data-theme");
}

export function KlineChartProPreview() {
  const chartsRef = useRef<KLineChartPro[]>([]);
  const periodRef = useRef<Period>({ ...DEFAULT_KLINE_PERIOD });
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const primaryChartHostRef = useRef<HTMLDivElement | null>(null);

  const [locale, setLocale] = useState<Locale>(() => resolveLocale());
  const [period, setPeriod] = useState<Period>(() => ({ ...DEFAULT_KLINE_PERIOD }));
  const [colorScheme, setColorScheme] = useState<ChartColorScheme>("light");
  const [chartLayout, setChartLayout] = useState<ChartLayoutId>("1");
  const colorSchemeRef = useRef<ChartColorScheme>(colorScheme);
  const themeHydratedRef = useRef(false);
  const layoutHydratedRef = useRef(false);
  colorSchemeRef.current = colorScheme;
  periodRef.current = period;

  useLayoutEffect(() => {
    if (themeHydratedRef.current) return;
    themeHydratedRef.current = true;
    const t = readInitialColorScheme();
    colorSchemeRef.current = t;
    setColorScheme(t);
  }, []);

  useLayoutEffect(() => {
    if (layoutHydratedRef.current) return;
    layoutHydratedRef.current = true;
    setChartLayout(readStoredChartLayout());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", colorScheme === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, colorScheme);
    } catch {
      /* ignore */
    }
    return () => {
      root.classList.remove("dark");
    };
  }, [colorScheme]);

  useEffect(() => {
    const onHash = () => setLocale(resolveLocale());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

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
        const datafeed = new BinanceDatafeed();
        createdDatafeeds.push(datafeed);
        const chart = new KLineChartPro(
          buildKlinePreviewOptions(el, locale, datafeed, {
            period: periodRef.current,
            theme: colorSchemeRef.current,
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

      const previewStyles = getKlinePreviewChartStyles(colorSchemeRef.current);
      charts.forEach((c) => c.setStyles(previewStyles));

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
        df.unsubscribe(BTC_USDT_SYMBOL, { ...p });
      }
      chartsRef.current = [];
      for (const host of createdHosts) {
        destroyPane(host);
      }
    };
  }, [locale, chartLayout]);

  useEffect(() => {
    chartsRef.current.forEach((c) => {
      c.setTheme(colorScheme);
      c.setStyles(getKlinePreviewChartStyles(colorScheme));
    });
  }, [colorScheme]);

  const applyPeriod = useCallback((p: Period) => {
    periodRef.current = p;
    setPeriod(p);
    chartsRef.current.forEach((c) => c.setPeriod(p));
  }, []);

  const onChartLayoutChange = useCallback((id: ChartLayoutId) => {
    setChartLayout(id);
    try {
      localStorage.setItem(CHART_LAYOUT_STORAGE_KEY, id);
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
    <div
      className={`kline-preview-root kline-preview-root--${colorScheme}`}
    >
      <ChartToolbar
        symbolTicker={BTC_USDT_SYMBOL.shortName ?? "BTC"}
        symbolQuote={BTC_USDT_SYMBOL.priceCurrency?.toUpperCase() ?? "USDT"}
        symbolHint={BTC_USDT_SYMBOL.name ?? ""}
        period={period}
        onPeriodChange={applyPeriod}
        onIndicatorsClick={() => {
          const root = primaryRoot();
          if (root) clickKlineProIndicator(root);
        }}
        onTimezoneClick={() => {
          const root = primaryRoot();
          if (root) clickKlineProTimezone(root);
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
    </div>
  );
}
