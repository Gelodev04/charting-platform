"use client";

import type { Period } from "@klinecharts/pro";
import { useEffect, useMemo, useState } from "react";

import {
  ToolbarIconAlert,
  ToolbarIconCamera,
  ToolbarIconChartType,
  ToolbarIconChevronDown,
  ToolbarIconCopy,
  ToolbarIconCreate,
  ToolbarIconDownload,
  ToolbarIconOpenLayout,
  ToolbarIconRename,
  ToolbarIconSearch,
  ToolbarIconExpand,
  ToolbarIconGear,
  ToolbarIconIndicator,
  ToolbarIconLayout1,
  ToolbarIconLayout2,
  ToolbarIconLayout4,
  ToolbarIconMoon,
  ToolbarIconRedo,
  ToolbarIconReplay,
  ToolbarIconSun,
  ToolbarIconUndo,
} from "@/components/ui/icons";
import type { ChartCandleType } from "@/lib/chart/options";
import type { ChartLayoutId } from "@/lib/chart/layout";
import { CHART_TOOLBAR_PERIODS } from "@/lib/chart/periods";

import { PeriodDropdown } from "./PeriodDropdown";
import "./ChartToolbar.css";

export type ChartColorScheme = "light" | "dark";

type ChartToolbarProps = {
  symbolTicker: string;
  symbolQuote?: string;
  symbolHint: string;
  symbolOptions: Array<{ ticker: string; label: string }>;
  onSymbolChange: (ticker: string) => void;
  period: Period;
  onPeriodChange: (p: Period) => void;
  candleType: ChartCandleType;
  onCandleTypeChange: (type: ChartCandleType) => void;
  onIndicatorsClick: () => void;
  onSettingsClick: () => void;
  onScreenshotClick: () => void;
  onFullscreenClick: () => void;
  colorScheme: ChartColorScheme;
  onColorSchemeToggle: () => void;
  chartLayout: ChartLayoutId;
  onChartLayoutChange: (layout: ChartLayoutId) => void;
};

function ToolbarDivider() {
  return <span className="chart-toolbar__divider" aria-hidden />;
}

export function ChartToolbar({
  symbolTicker,
  symbolQuote,
  symbolHint,
  symbolOptions,
  onSymbolChange,
  period,
  onPeriodChange,
  candleType,
  onCandleTypeChange,
  onIndicatorsClick,
  onSettingsClick,
  onScreenshotClick,
  onFullscreenClick,
  colorScheme,
  onColorSchemeToggle,
  chartLayout,
  onChartLayoutChange,
}: ChartToolbarProps) {
  const [symbolModalOpen, setSymbolModalOpen] = useState(false);
  const [symbolSearch, setSymbolSearch] = useState("");
  const [candleMenuOpen, setCandleMenuOpen] = useState(false);
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(false);

  const label =
    symbolQuote != null && symbolQuote !== ""
      ? `${symbolTicker} / ${symbolQuote}`
      : symbolTicker;
  const selectedTicker = `${symbolTicker}${(symbolQuote ?? "").toUpperCase()}`;

  const filteredSymbolOptions = useMemo(() => {
    const q = symbolSearch.trim().toUpperCase();
    if (!q) return symbolOptions;
    return symbolOptions.filter((option) => {
      return (
        option.ticker.includes(q) || option.label.toUpperCase().includes(q)
      );
    });
  }, [symbolOptions, symbolSearch]);

  useEffect(() => {
    if (!symbolModalOpen && !candleMenuOpen && !layoutMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSymbolModalOpen(false);
        setCandleMenuOpen(false);
        setLayoutMenuOpen(false);
      }
    };
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(".chart-toolbar__candle-dropdown") != null ||
        target?.closest(".chart-toolbar__layout-dropdown") != null
      ) {
        return;
      }
      setCandleMenuOpen(false);
      setLayoutMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [symbolModalOpen, candleMenuOpen, layoutMenuOpen]);

  return (
    <header className="chart-toolbar">
      <div className="chart-toolbar__group chart-toolbar__group--start">
        <button
          type="button"
          className="chart-toolbar__symbol-btn"
          title={symbolHint || label}
          aria-label={label}
          onClick={() => setSymbolModalOpen(true)}
        >
          <span className="chart-toolbar__symbol-label">
            {symbolTicker}
            {symbolQuote ?? ""}
          </span>
          <ToolbarIconChevronDown
            className="chart-toolbar__symbol-chevron"
            size={14}
          />
        </button>
      </div>

      <ToolbarDivider />

      <PeriodDropdown
        periods={CHART_TOOLBAR_PERIODS}
        active={period}
        onChange={onPeriodChange}
      />

      <ToolbarDivider />

      <div className="chart-toolbar__candle-dropdown">
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title="Chart type"
          aria-label="Chart type"
          aria-expanded={candleMenuOpen}
          onClick={() => setCandleMenuOpen((open) => !open)}
        >
          <ToolbarIconChartType className="chart-toolbar__icon-svg" />
        </button>
        {candleMenuOpen ? (
          <div className="chart-toolbar__candle-dropdown__menu" role="menu">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={candleType === "candle_solid"}
              className={
                candleType === "candle_solid"
                  ? "chart-toolbar__candle-dropdown__item chart-toolbar__candle-dropdown__item--active"
                  : "chart-toolbar__candle-dropdown__item"
              }
              onClick={() => {
                onCandleTypeChange("candle_solid");
                setCandleMenuOpen(false);
              }}
            >
              Candles
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={candleType === "candle_stroke"}
              className={
                candleType === "candle_stroke"
                  ? "chart-toolbar__candle-dropdown__item chart-toolbar__candle-dropdown__item--active"
                  : "chart-toolbar__candle-dropdown__item"
              }
              onClick={() => {
                onCandleTypeChange("candle_stroke");
                setCandleMenuOpen(false);
              }}
            >
              Hollow candles
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={candleType === "candle_up_stroke"}
              className={
                candleType === "candle_up_stroke"
                  ? "chart-toolbar__candle-dropdown__item chart-toolbar__candle-dropdown__item--active"
                  : "chart-toolbar__candle-dropdown__item"
              }
              onClick={() => {
                onCandleTypeChange("candle_up_stroke");
                setCandleMenuOpen(false);
              }}
            >
              Up hollow candles
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={candleType === "candle_down_stroke"}
              className={
                candleType === "candle_down_stroke"
                  ? "chart-toolbar__candle-dropdown__item chart-toolbar__candle-dropdown__item--active"
                  : "chart-toolbar__candle-dropdown__item"
              }
              onClick={() => {
                onCandleTypeChange("candle_down_stroke");
                setCandleMenuOpen(false);
              }}
            >
              Down hollow candles
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={candleType === "ohlc"}
              className={
                candleType === "ohlc"
                  ? "chart-toolbar__candle-dropdown__item chart-toolbar__candle-dropdown__item--active"
                  : "chart-toolbar__candle-dropdown__item"
              }
              onClick={() => {
                onCandleTypeChange("ohlc");
                setCandleMenuOpen(false);
              }}
            >
              OHLC
            </button>
          </div>
        ) : null}
      </div>

      <ToolbarDivider />

      <div
        className="chart-toolbar__group chart-toolbar__group--layout"
        role="group"
        aria-label="Chart layout"
      >
        <button
          type="button"
          className={
            chartLayout === "1"
              ? "chart-toolbar__tf chart-toolbar__tf--active chart-toolbar__tf--icon"
              : "chart-toolbar__tf chart-toolbar__tf--icon"
          }
          title="Single chart"
          aria-label="Single chart layout"
          aria-pressed={chartLayout === "1"}
          onClick={() => onChartLayoutChange("1")}
        >
          <ToolbarIconLayout1 className="chart-toolbar__icon-svg" />
        </button>
        <button
          type="button"
          className={
            chartLayout === "2"
              ? "chart-toolbar__tf chart-toolbar__tf--active chart-toolbar__tf--icon"
              : "chart-toolbar__tf chart-toolbar__tf--icon"
          }
          title="Two charts"
          aria-label="Two chart layout"
          aria-pressed={chartLayout === "2"}
          onClick={() => onChartLayoutChange("2")}
        >
          <ToolbarIconLayout2 className="chart-toolbar__icon-svg" />
        </button>
        <button
          type="button"
          className={
            chartLayout === "4"
              ? "chart-toolbar__tf chart-toolbar__tf--active chart-toolbar__tf--icon"
              : "chart-toolbar__tf chart-toolbar__tf--icon"
          }
          title="Four charts"
          aria-label="Four chart grid layout"
          aria-pressed={chartLayout === "4"}
          onClick={() => onChartLayoutChange("4")}
        >
          <ToolbarIconLayout4 className="chart-toolbar__icon-svg" />
        </button>
      </div>

      <ToolbarDivider />

      <div className="chart-toolbar__group chart-toolbar__group--actions">
        <button
          type="button"
          className="chart-toolbar__action"
          onClick={onIndicatorsClick}
        >
          <ToolbarIconIndicator className="chart-toolbar__icon-svg" />
          <span>Indicators</span>
        </button>
        <button
          type="button"
          className="chart-toolbar__action"
          onClick={() => {}}
        >
          <ToolbarIconAlert className="chart-toolbar__icon-svg" />
          <span>Alert</span>
        </button>
        <button
          type="button"
          className="chart-toolbar__action"
          onClick={() => {}}
        >
          <ToolbarIconReplay className="chart-toolbar__icon-svg" />
          <span>Replay</span>
        </button>
      </div>

      <div className="chart-toolbar__spacer" />

      <div className="chart-toolbar__group chart-toolbar__group--end">
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title="Undo"
          aria-label="Undo"
          onClick={() => {}}
        >
          <ToolbarIconUndo className="chart-toolbar__icon-svg" />
        </button>
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title="Redo"
          aria-label="Redo"
          onClick={() => {}}
        >
          <ToolbarIconRedo className="chart-toolbar__icon-svg" />
        </button>
        <span
          className="chart-toolbar__divider chart-toolbar__divider--compact"
          aria-hidden
        />
        <div className="chart-toolbar__layout-dropdown">
          <button
            type="button"
            className="chart-toolbar__layout-btn"
            title="Chart layout menu"
            aria-label="Chart layout menu"
            aria-expanded={layoutMenuOpen}
            onClick={() => setLayoutMenuOpen((open) => !open)}
          >
            <span>Unnamed</span>
            <ToolbarIconChevronDown size={14} />
          </button>
          {layoutMenuOpen ? (
            <div className="chart-toolbar__layout-menu" role="menu">
              <button type="button" className="chart-toolbar__layout-menu__item">
                <span>Save layout</span>
                <span className="chart-toolbar__layout-menu__muted">Ctrl + S</span>
              </button>
              <div className="chart-toolbar__layout-menu__item chart-toolbar__layout-menu__item--toggle">
                <span>Autosave</span>
                <span className="chart-toolbar__layout-menu__switch" aria-hidden />
              </div>
              <div className="chart-toolbar__layout-menu__item chart-toolbar__layout-menu__item--toggle">
                <span>
                  Share layout{" "}
                  <span className="chart-toolbar__layout-menu__info">i</span>
                </span>
                <span
                  className="chart-toolbar__layout-menu__switch chart-toolbar__layout-menu__switch--off"
                  aria-hidden
                />
              </div>
              <button type="button" className="chart-toolbar__layout-menu__item">
                <span className="chart-toolbar__layout-menu__left">
                  <ToolbarIconCopy className="chart-toolbar__layout-menu__icon" />
                  <span>Make a copy...</span>
                </span>
              </button>
              <button type="button" className="chart-toolbar__layout-menu__item">
                <span className="chart-toolbar__layout-menu__left">
                  <ToolbarIconRename className="chart-toolbar__layout-menu__icon" />
                  <span>Rename...</span>
                </span>
              </button>
              <button type="button" className="chart-toolbar__layout-menu__item">
                <span className="chart-toolbar__layout-menu__left">
                  <ToolbarIconDownload className="chart-toolbar__layout-menu__icon" />
                  <span>Download chart data...</span>
                </span>
              </button>
              <div className="chart-toolbar__layout-menu__divider" />
              <button type="button" className="chart-toolbar__layout-menu__item">
                <span className="chart-toolbar__layout-menu__left">
                  <ToolbarIconCreate className="chart-toolbar__layout-menu__icon" />
                  <span>Create new layout...</span>
                </span>
              </button>
              <div className="chart-toolbar__layout-menu__caption">RECENTLY USED</div>
              <button
                type="button"
                className="chart-toolbar__layout-menu__item chart-toolbar__layout-menu__item--recent"
              >
                <span>Unnamed</span>
                <span className="chart-toolbar__layout-menu__subtle">OGUSDT, 15</span>
              </button>
              <button type="button" className="chart-toolbar__layout-menu__item">
                <span className="chart-toolbar__layout-menu__left">
                  <ToolbarIconOpenLayout className="chart-toolbar__layout-menu__icon" />
                  <span>Open layout...</span>
                </span>
                <span className="chart-toolbar__layout-menu__muted">Dot</span>
              </button>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title="Search"
          aria-label="Search symbol"
          onClick={() => setSymbolModalOpen(true)}
        >
          <ToolbarIconSearch className="chart-toolbar__icon-svg" />
        </button>
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title="Screenshot"
          aria-label="Screenshot"
          onClick={onScreenshotClick}
        >
          <ToolbarIconCamera className="chart-toolbar__icon-svg" />
        </button>
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title="Full screen"
          aria-label="Full screen"
          onClick={onFullscreenClick}
        >
          <ToolbarIconExpand className="chart-toolbar__icon-svg" />
        </button>
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title={colorScheme === "light" ? "Dark mode" : "Light mode"}
          aria-label={
            colorScheme === "light"
              ? "Switch to dark mode"
              : "Switch to light mode"
          }
          onClick={onColorSchemeToggle}
        >
          {colorScheme === "light" ? (
            <ToolbarIconMoon className="chart-toolbar__icon-svg" />
          ) : (
            <ToolbarIconSun className="chart-toolbar__icon-svg" />
          )}
        </button>
        <span
          className="chart-toolbar__divider chart-toolbar__divider--compact"
          aria-hidden
        />
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title="Settings"
          aria-label="Settings"
          onClick={onSettingsClick}
        >
          <ToolbarIconGear className="chart-toolbar__icon-svg" />
        </button>
      </div>
      {symbolModalOpen ? (
        <div
          className="chart-toolbar__symbol-modal-backdrop"
          onClick={() => setSymbolModalOpen(false)}
        >
          <div
            className="chart-toolbar__symbol-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Symbol search"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="chart-toolbar__symbol-modal__header">
              <span>Symbol search</span>
              <button
                type="button"
                className="chart-toolbar__symbol-modal__close"
                aria-label="Close symbol search"
                onClick={() => setSymbolModalOpen(false)}
              >
                ×
              </button>
            </div>
            <input
              className="chart-toolbar__symbol-modal__search"
              placeholder="Search pair (e.g. BTCUSDT)"
              value={symbolSearch}
              onChange={(event) => setSymbolSearch(event.target.value)}
              autoFocus
            />
            <div className="chart-toolbar__symbol-modal__list">
              {filteredSymbolOptions.map((option) => (
                <button
                  key={option.ticker}
                  type="button"
                  className={
                    option.ticker === selectedTicker
                      ? "chart-toolbar__symbol-modal__item chart-toolbar__symbol-modal__item--active"
                      : "chart-toolbar__symbol-modal__item"
                  }
                  onClick={() => {
                    onSymbolChange(option.ticker);
                    setSymbolModalOpen(false);
                    setSymbolSearch("");
                  }}
                >
                  <span>{option.label}</span>
                  <span>{option.ticker}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
