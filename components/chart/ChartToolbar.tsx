"use client";

import type { Period } from "@klinecharts/pro";

import {
  ToolbarIconAlert,
  ToolbarIconCamera,
  ToolbarIconChartType,
  ToolbarIconChevronDown,
  ToolbarIconProfile,
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
import type { ChartLayoutId } from "@/lib/chart/layout";
import { CHART_TOOLBAR_PERIODS } from "@/lib/chart/periods";

import { PeriodDropdown } from "./PeriodDropdown";
import "./ChartToolbar.css";

export type ChartColorScheme = "light" | "dark";

type ChartToolbarProps = {
  symbolTicker: string;
  symbolQuote?: string;
  symbolHint: string;
  period: Period;
  onPeriodChange: (p: Period) => void;
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
  period,
  onPeriodChange,
  onIndicatorsClick,
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
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title="Profile"
          aria-label="Profile"
          onClick={() => {}}
        >
          <ToolbarIconProfile className="chart-toolbar__icon-svg" />
        </button>
        <button
          type="button"
          className="chart-toolbar__symbol-btn"
          title={symbolHint || label}
          aria-label={label}
          onClick={() => {}}
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

      <button
        type="button"
        className="chart-toolbar__action chart-toolbar__action--icon-only"
        title="Chart type"
        aria-label="Chart type"
        onClick={() => {}}
      >
        <ToolbarIconChartType className="chart-toolbar__icon-svg" />
      </button>

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
        <button
          type="button"
          className="chart-toolbar__action chart-toolbar__action--icon-only"
          title="Search"
          aria-label="Search symbol"
          onClick={() => {}}
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
    </header>
  );
}
