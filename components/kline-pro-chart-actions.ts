/**
 * @klinecharts/pro keeps indicator / settings / drawing toggles on the built-in
 * period bar. We hide that bar visually but still trigger the same handlers via DOM.
 */

function dispatchUiClick(el: Element | null | undefined): void {
  if (!el) return;
  if (typeof (el as HTMLElement).click === "function") {
    (el as HTMLElement).click();
    return;
  }
  el.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
  );
}

/** Hamburger in period bar: toggles left drawing toolbar visibility. */
export function clickKlineProMenu(root: HTMLElement): void {
  const svg = root.querySelector(
    ".klinecharts-pro-period-bar .menu-container svg"
  );
  dispatchUiClick(svg);
}

export function clickKlineProIndicator(root: HTMLElement): void {
  const bar = root.querySelector(".klinecharts-pro-period-bar");
  const firstTools = bar?.querySelector(".item.tools");
  (firstTools as HTMLElement | undefined)?.click();
}

/** Order in period bar: 0 indicator, 1 timezone, 2 settings, 3 screenshot. */
export function clickKlineProTimezone(root: HTMLElement): void {
  const tools = root.querySelectorAll(".klinecharts-pro-period-bar .item.tools");
  (tools[1] as HTMLElement | undefined)?.click();
}

export function clickKlineProSettings(root: HTMLElement): void {
  const tools = root.querySelectorAll(".klinecharts-pro-period-bar .item.tools");
  (tools[2] as HTMLElement | undefined)?.click();
}

export function clickKlineProScreenshot(root: HTMLElement): void {
  const tools = root.querySelectorAll(".klinecharts-pro-period-bar .item.tools");
  (tools[3] as HTMLElement | undefined)?.click();
}

export function clickKlineProFullscreen(root: HTMLElement): void {
  const bar = root.querySelector(".klinecharts-pro-period-bar");
  const tools = bar?.querySelectorAll(".item.tools");
  const shot = tools?.[3];
  const next = shot?.nextElementSibling;
  (next as HTMLElement | undefined)?.click();
}
