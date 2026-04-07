import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Crosshair, Paintbrush, Ruler, Smile, Type, ZoomIn } from "lucide-react";

const ICON_PROPS = { size: 24, strokeWidth: 1.5 } as const;
const INJECTED_ATTR = "data-injected-tool";

function icon(Icon: typeof Crosshair): string {
  return renderToStaticMarkup(createElement(Icon, ICON_PROPS));
}

type ToolEntry = { id: string; svg: string; title: string };

const TOOL_SECTIONS: ToolEntry[][] = [
  [
    { id: "crosshair", svg: icon(Crosshair), title: "Crosshair" },
    { id: "brush", svg: icon(Paintbrush), title: "Brush" },
    { id: "text", svg: icon(Type), title: "Text" },
    { id: "emoji", svg: icon(Smile), title: "Sticker" },
  ],
  [
    { id: "ruler", svg: icon(Ruler), title: "Measure" },
    { id: "zoom", svg: icon(ZoomIn), title: "Zoom In" },
  ],
];

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

  return item;
}

function createSplitLine(): HTMLSpanElement {
  const s = document.createElement("span");
  s.className = "split-line";
  s.setAttribute(INJECTED_ATTR, "sep");
  return s;
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
  const insertionPoint = firstBuiltInSplit ?? null;

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

  return () => {
    for (const el of injected) el.remove();
  };
}
