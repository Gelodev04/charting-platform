import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  ArrowUpRight,
  ChevronRight,
  Crosshair,
  GitBranch,
  MoveRight,
  Paintbrush,
  Ruler,
  Smile,
  Type,
  Waves,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";
import {
  BRUSHES_MENU,
  FIBONACCI_MENU,
  FORECAST_MENU,
  LINES_MENU,
  PATTERNS_MENU,
  TEXT_NOTES_MENU,
  type DrawingMenuSection,
} from "@/lib/chart/drawing-menus";

const ICON_PROPS = { size: 24, strokeWidth: 1.5 } as const;
const INJECTED_ATTR = "data-injected-tool";

function icon(Icon: LucideIcon, size: number = ICON_PROPS.size): string {
  return renderToStaticMarkup(
    createElement(Icon, { size, strokeWidth: ICON_PROPS.strokeWidth })
  );
}

type ToolEntry = { id: string; svg: string; title: string };

const TOOL_SECTIONS: ToolEntry[][] = [
  [
    { id: "brush", svg: icon(Paintbrush), title: "Brush" },
    { id: "text", svg: icon(Type), title: "Text" },
    { id: "emoji", svg: icon(Smile), title: "Sticker" },
  ],
  [
    { id: "ruler", svg: icon(Ruler), title: "Measure" },
    { id: "zoom", svg: icon(ZoomIn), title: "Zoom In" },
  ],
];

const ICONS_BY_KEY = {
  ArrowUpRight,
  Crosshair,
  GitBranch,
  MoveRight,
  Paintbrush,
  Ruler,
  Waves,
} as const;

function createToolButton(entry: ToolEntry): HTMLDivElement {
  const item = document.createElement("div");
  item.className = "item";
  item.setAttribute(INJECTED_ATTR, entry.id);
  item.title = entry.title;

  const overlay = document.createElement("div");
  overlay.className = "icon-overlay";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.innerHTML = entry.svg;
  item.appendChild(overlay);

  if (entry.id === "brush" || entry.id === "text" || entry.id === "emoji") {
    const arrow = document.createElement("span");
    arrow.className = "kline-preview-drawing-toggle-arrow";
    arrow.innerHTML = icon(ChevronRight, 12);
    item.appendChild(arrow);
  }

  return item;
}

function createSplitLine(): HTMLSpanElement {
  const s = document.createElement("span");
  s.className = "split-line";
  s.setAttribute(INJECTED_ATTR, "sep");
  return s;
}

function createDrawingMenu(
  sections: DrawingMenuSection[],
  attrId: string
): HTMLDivElement {
  const menu = document.createElement("div");
  menu.className = "kline-preview-drawing-menu";
  menu.setAttribute(INJECTED_ATTR, attrId);
  menu.hidden = true;

  sections.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) {
      const divider = document.createElement("div");
      divider.className = "kline-preview-drawing-menu__divider";
      menu.appendChild(divider);
    }
    const title = document.createElement("div");
    title.className = "kline-preview-drawing-menu__section-title";
    title.textContent = section.title;
    menu.appendChild(title);

    section.items.forEach((item) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = item.active
        ? "kline-preview-drawing-menu__item kline-preview-drawing-menu__item--active"
        : "kline-preview-drawing-menu__item";
      row.title = item.label;

      const left = document.createElement("span");
      left.className = "kline-preview-drawing-menu__left";
      const iconWrap = document.createElement("span");
      iconWrap.className = "kline-preview-drawing-menu__icon";
      iconWrap.innerHTML = icon(ICONS_BY_KEY[item.iconKey], 16);
      const label = document.createElement("span");
      label.textContent = item.label;
      left.append(iconWrap, label);
      row.appendChild(left);

      if (item.shortcut) {
        const shortcut = document.createElement("span");
        shortcut.className = "kline-preview-drawing-menu__shortcut";
        shortcut.textContent = item.shortcut;
        row.appendChild(shortcut);
      }
      menu.appendChild(row);
    });
  });

  return menu;
}

export function injectDrawingBarTools(root: HTMLElement): () => void {
  const bar = root.querySelector<HTMLElement>(
    ".klinecharts-pro-drawing-bar"
  );
  if (!bar) return () => { };
  if (bar.querySelector(`[${INJECTED_ATTR}]`)) return () => { };

  const injected: HTMLElement[] = [];
  const firstBuiltInSplit = bar.querySelector(
    ".split-line:not([data-injected-tool])"
  );
  const builtInTools = Array.from(
    bar.querySelectorAll<HTMLDivElement>(`.item:not([${INJECTED_ATTR}])`)
  );
  const hiddenBuiltInTool = builtInTools[2] ?? null;
  const topInsertionPoint = bar.firstElementChild ?? null;
  const insertionPoint = firstBuiltInSplit ?? null;
  const originalHiddenBuiltInDisplay = hiddenBuiltInTool?.style.display ?? "";

  if (hiddenBuiltInTool) {
    hiddenBuiltInTool.style.display = "none";
  }

  const crosshairBtn = createToolButton({
    id: "crosshair",
    svg: icon(Crosshair),
    title: "Crosshair",
  });
  bar.insertBefore(crosshairBtn, topInsertionPoint);
  injected.push(crosshairBtn);

  TOOL_SECTIONS.forEach((section, sectionIdx) => {
    if (sectionIdx > 0) {
      const sep = createSplitLine();
      bar.insertBefore(sep, insertionPoint);
      injected.push(sep);
    }

    for (const entry of section) {
      const btn = createToolButton(entry);
      bar.insertBefore(btn, insertionPoint);
      injected.push(btn);
    }
  });

  const visibleItems = Array.from(
    bar.querySelectorAll<HTMLDivElement>(".item")
  ).filter((el) => el.style.display !== "none");
  const crosshairIndex = visibleItems.indexOf(crosshairBtn);
  const linesToggleButton =
    crosshairIndex >= 0 ? (visibleItems[crosshairIndex + 1] ?? null) : null;
  const fibToggleButton =
    crosshairIndex >= 0 ? (visibleItems[crosshairIndex + 2] ?? null) : null;
  const patternsToggleButton =
    crosshairIndex >= 0 ? (visibleItems[crosshairIndex + 3] ?? null) : null;
  const forecastToggleButton =
    crosshairIndex >= 0 ? (visibleItems[crosshairIndex + 4] ?? null) : null;
  const brushesToggleButton =
    crosshairIndex >= 0 ? (visibleItems[crosshairIndex + 5] ?? null) : null;
  const textNotesToggleButton =
    crosshairIndex >= 0 ? (visibleItems[crosshairIndex + 6] ?? null) : null;

  const linesMenu = createDrawingMenu(LINES_MENU, "lines-menu");
  const fibMenu = createDrawingMenu(FIBONACCI_MENU, "fib-menu");
  const patternsMenu = createDrawingMenu(PATTERNS_MENU, "patterns-menu");
  const forecastMenu = createDrawingMenu(FORECAST_MENU, "forecast-menu");
  const brushesMenu = createDrawingMenu(BRUSHES_MENU, "brushes-menu");
  const textNotesMenu = createDrawingMenu(TEXT_NOTES_MENU, "text-notes-menu");
  root.appendChild(linesMenu);
  root.appendChild(fibMenu);
  root.appendChild(patternsMenu);
  root.appendChild(forecastMenu);
  root.appendChild(brushesMenu);
  root.appendChild(textNotesMenu);

  const placeMenu = (menu: HTMLDivElement, toggleBtn: HTMLDivElement | null) => {
    if (!toggleBtn || menu.hidden) return;
    const rootRect = root.getBoundingClientRect();
    const rect = toggleBtn.getBoundingClientRect();
    menu.style.left = `${rect.right - rootRect.left + 8}px`;
    menu.style.top = `${rect.top - rootRect.top}px`;
  };
  const placeLinesMenu = () => placeMenu(linesMenu, linesToggleButton);
  const placeFibMenu = () => placeMenu(fibMenu, fibToggleButton);
  const placePatternsMenu = () => placeMenu(patternsMenu, patternsToggleButton);
  const placeForecastMenu = () => placeMenu(forecastMenu, forecastToggleButton);
  const placeBrushesMenu = () => placeMenu(brushesMenu, brushesToggleButton);
  const placeTextNotesMenu = () => placeMenu(textNotesMenu, textNotesToggleButton);
  const placeAllMenus = () => {
    placeLinesMenu();
    placeFibMenu();
    placePatternsMenu();
    placeForecastMenu();
    placeBrushesMenu();
    placeTextNotesMenu();
  };

  const closeLinesMenu = () => {
    linesMenu.hidden = true;
  };
  const closeFibMenu = () => {
    fibMenu.hidden = true;
  };
  const closePatternsMenu = () => {
    patternsMenu.hidden = true;
  };
  const closeForecastMenu = () => {
    forecastMenu.hidden = true;
  };
  const closeBrushesMenu = () => {
    brushesMenu.hidden = true;
  };
  const closeTextNotesMenu = () => {
    textNotesMenu.hidden = true;
  };

  const toggleLinesMenu = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    closeFibMenu();
    closePatternsMenu();
    closeForecastMenu();
    closeBrushesMenu();
    closeTextNotesMenu();
    linesMenu.hidden = !linesMenu.hidden;
    placeLinesMenu();
  };
  const toggleFibMenu = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    closeLinesMenu();
    closePatternsMenu();
    closeForecastMenu();
    closeBrushesMenu();
    closeTextNotesMenu();
    fibMenu.hidden = !fibMenu.hidden;
    placeFibMenu();
  };
  const togglePatternsMenu = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    closeLinesMenu();
    closeFibMenu();
    closeForecastMenu();
    closeBrushesMenu();
    closeTextNotesMenu();
    patternsMenu.hidden = !patternsMenu.hidden;
    placePatternsMenu();
  };
  const toggleForecastMenu = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    closeLinesMenu();
    closeFibMenu();
    closePatternsMenu();
    closeBrushesMenu();
    closeTextNotesMenu();
    forecastMenu.hidden = !forecastMenu.hidden;
    placeForecastMenu();
  };
  const toggleBrushesMenu = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    closeLinesMenu();
    closeFibMenu();
    closePatternsMenu();
    closeForecastMenu();
    closeTextNotesMenu();
    brushesMenu.hidden = !brushesMenu.hidden;
    placeBrushesMenu();
  };
  const toggleTextNotesMenu = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    closeLinesMenu();
    closeFibMenu();
    closePatternsMenu();
    closeForecastMenu();
    closeBrushesMenu();
    textNotesMenu.hidden = !textNotesMenu.hidden;
    placeTextNotesMenu();
  };

  const onDocumentMouseDown = (event: MouseEvent) => {
    const target = event.target as Node | null;
    if (!target) return;
    if (linesToggleButton?.contains(target)) return;
    if (fibToggleButton?.contains(target)) return;
    if (patternsToggleButton?.contains(target)) return;
    if (forecastToggleButton?.contains(target)) return;
    if (brushesToggleButton?.contains(target)) return;
    if (textNotesToggleButton?.contains(target)) return;
    if (linesMenu.contains(target)) return;
    if (fibMenu.contains(target)) return;
    if (patternsMenu.contains(target)) return;
    if (forecastMenu.contains(target)) return;
    if (brushesMenu.contains(target)) return;
    if (textNotesMenu.contains(target)) return;
    closeLinesMenu();
    closeFibMenu();
    closePatternsMenu();
    closeForecastMenu();
    closeBrushesMenu();
    closeTextNotesMenu();
  };

  const onEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeLinesMenu();
      closeFibMenu();
      closePatternsMenu();
      closeForecastMenu();
      closeBrushesMenu();
      closeTextNotesMenu();
    }
  };

  if (linesToggleButton) {
    linesToggleButton.addEventListener("click", toggleLinesMenu);
  }
  if (fibToggleButton) fibToggleButton.addEventListener("click", toggleFibMenu);
  if (patternsToggleButton)
    patternsToggleButton.addEventListener("click", togglePatternsMenu);
  if (forecastToggleButton)
    forecastToggleButton.addEventListener("click", toggleForecastMenu);
  if (brushesToggleButton)
    brushesToggleButton.addEventListener("click", toggleBrushesMenu);
  if (textNotesToggleButton)
    textNotesToggleButton.addEventListener("click", toggleTextNotesMenu);
  window.addEventListener("resize", placeAllMenus);
  window.addEventListener("scroll", placeAllMenus, true);
  document.addEventListener("mousedown", onDocumentMouseDown);
  document.addEventListener("keydown", onEscape);

  return () => {
    if (linesToggleButton)
      linesToggleButton.removeEventListener("click", toggleLinesMenu);
    if (fibToggleButton) fibToggleButton.removeEventListener("click", toggleFibMenu);
    if (patternsToggleButton)
      patternsToggleButton.removeEventListener("click", togglePatternsMenu);
    if (forecastToggleButton)
      forecastToggleButton.removeEventListener("click", toggleForecastMenu);
    if (brushesToggleButton)
      brushesToggleButton.removeEventListener("click", toggleBrushesMenu);
    if (textNotesToggleButton)
      textNotesToggleButton.removeEventListener("click", toggleTextNotesMenu);
    window.removeEventListener("resize", placeAllMenus);
    window.removeEventListener("scroll", placeAllMenus, true);
    document.removeEventListener("mousedown", onDocumentMouseDown);
    document.removeEventListener("keydown", onEscape);
    linesMenu.remove();
    fibMenu.remove();
    patternsMenu.remove();
    forecastMenu.remove();
    brushesMenu.remove();
    textNotesMenu.remove();
    if (hiddenBuiltInTool) {
      hiddenBuiltInTool.style.display = originalHiddenBuiltInDisplay;
    }
    for (const el of injected) el.remove();
  };
}
