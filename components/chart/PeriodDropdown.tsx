"use client";

import type { Period } from "@klinecharts/pro";
import { useCallback, useRef, useState } from "react";

import { ToolbarIconChevronDown } from "@/components/ui/icons";
import { useOutsideClick } from "@/hooks/useOutsideClick";

type PeriodDropdownProps = {
  periods: Period[];
  active: Period;
  onChange: (p: Period) => void;
};

export function PeriodDropdown({
  periods,
  active,
  onChange,
}: PeriodDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useOutsideClick(ref, {
    enabled: open,
    onOutsideClick: close,
    onEscape: close,
  });

  const activeLabel =
    periods.find(
      (p) =>
        p.multiplier === active.multiplier && p.timespan === active.timespan
    )?.text ?? active.text;

  return (
    <div className="chart-toolbar__tf-dropdown" ref={ref}>
      <button
        type="button"
        className="chart-toolbar__tf chart-toolbar__tf--active chart-toolbar__tf-dropdown__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {activeLabel}
        <ToolbarIconChevronDown
          className="chart-toolbar__tf-dropdown__chevron"
          size={12}
        />
      </button>
      {open && (
        <div className="chart-toolbar__tf-dropdown__menu" role="listbox">
          {periods.map((p) => {
            const isActive =
              p.text === active.text &&
              p.multiplier === active.multiplier &&
              p.timespan === active.timespan;
            return (
              <button
                key={`${p.timespan}-${p.multiplier}-${p.text}`}
                type="button"
                role="option"
                aria-selected={isActive}
                className={
                  isActive
                    ? "chart-toolbar__tf-dropdown__item chart-toolbar__tf-dropdown__item--active"
                    : "chart-toolbar__tf-dropdown__item"
                }
                onClick={() => {
                  onChange({ ...p });
                  close();
                }}
              >
                {p.text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
