"use client";

import type { Period } from "@klinecharts/pro";
import { useCallback, useEffect, useRef, useState } from "react";

import { ToolbarIconChevronDown } from "@/components/ui/icons";

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

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, close]);

  return (
    <div className="chart-toolbar__tf-dropdown" ref={ref}>
      <button
        type="button"
        className="chart-toolbar__tf chart-toolbar__tf--active chart-toolbar__tf-dropdown__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {active.text}
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
                  onChange(p);
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
