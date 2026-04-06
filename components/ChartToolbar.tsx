"use client";

import type { Period } from "@klinecharts/pro";

import {
  ToolbarIconCamera,
  ToolbarIconExpand,
  ToolbarIconGear,
  ToolbarIconGlobe,
  ToolbarIconIndicator,
  ToolbarIconLayout1,
  ToolbarIconLayout2,
  ToolbarIconLayout4,
  ToolbarIconMoon,
  ToolbarIconSun,
} from "@/components/chart-toolbar-icons";
import type { ChartLayoutId } from "@/lib/chart-layout";
import { CHART_TOOLBAR_PERIODS } from "@/lib/chart-periods";

export type ChartColorScheme = "light" | "dark";

type ChartToolbarProps = {
  /** Base asset label, e.g. BTC */
  symbolTicker: string;
  /** Quote currency, e.g. USDT (shown after /) */
  symbolQuote?: string;
  /** Full name; tooltip + optional caption under the pair */
  symbolHint: string;
  period: Period;
  onPeriodChange: (p: Period) => void;
  onIndicatorsClick: () => void;
  onTimezoneClick: () => void;
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
  period,
  onPeriodChange,
  onIndicatorsClick,
  onTimezoneClick,
  onSettingsClick,
  onScreenshotClick,
  onFullscreenClick,
  colorScheme,
  onColorSchemeToggle,
  chartLayout,
  onChartLayoutChange,
}: ChartToolbarProps) {
  const label =
    symbolQuote != null && symbolQuote !== ""
      ? `${symbolTicker} / ${symbolQuote}`
      : symbolTicker;

  return (
    <header className="chart-toolbar">
      <div className="chart-toolbar__group chart-toolbar__group--start">
        <div
          className="chart-toolbar__symbol"
          title={symbolHint || label}
          aria-label={label}
        >
          <div className="chart-toolbar__symbol-body">
            <div className="chart-toolbar__symbol-pair">
              <span className="chart-toolbar__symbol-base">{symbolTicker}</span>
              {symbolQuote != null && symbolQuote !== "" ? (
                <>
                  <span className="chart-toolbar__symbol-slash">/</span>
                  <span className="chart-toolbar__symbol-quote">
                    {symbolQuote}
                  </span>
                </>
              ) : null}
            </div>
            {symbolHint ? (
              <span className="chart-toolbar__symbol-caption">{symbolHint}</span>
            ) : null}
          </div>
        </div>
      </div>

      <ToolbarDivider />

      <div className="chart-toolbar__group chart-toolbar__group--tf">
        {CHART_TOOLBAR_PERIODS.map((p) => {
          const active =
            p.text === period.text &&
            p.multiplier === period.multiplier &&
            p.timespan === period.timespan;
          return (
            <button
              key={`${p.timespan}-${p.multiplier}-${p.text}`}
              type="button"
              className={
                active
                  ? "chart-toolbar__tf chart-toolbar__tf--active"
                  : "chart-toolbar__tf"
              }
              onClick={() => onPeriodChange(p)}
            >
              {p.text}
            </button>
          );
        })}
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
          <span>Indicator</span>
        </button>
        <button
          type="button"
          className="chart-toolbar__action"
          onClick={onTimezoneClick}
        >
          <ToolbarIconGlobe className="chart-toolbar__icon-svg" />
          <span>Timezone</span>
        </button>
      </div>

      <div className="chart-toolbar__spacer" />

      <div className="chart-toolbar__group chart-toolbar__group--end">
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title="Screenshot"
          aria-label="Screenshot"
          onClick={onScreenshotClick}
        >
          <ToolbarIconCamera className="chart-toolbar__icon-svg" />
        </button>
        <span className="chart-toolbar__divider chart-toolbar__divider--compact" aria-hidden />
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title="Full screen"
          aria-label="Full screen"
          onClick={onFullscreenClick}
        >
          <ToolbarIconExpand className="chart-toolbar__icon-svg" />
        </button>
        <span
          className="chart-toolbar__divider chart-toolbar__divider--compact"
          aria-hidden
        />
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
    </header>
  );
}
