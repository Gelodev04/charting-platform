import type {
  AxisCreateTicksParams,
  AxisTick,
  Bounding,
} from "klinecharts";
import { registerXAxis, registerYAxis, utils } from "klinecharts";

let registered = false;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function utcHM(ts: number): string {
  const d = new Date(ts);
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

function utcDayOfMonth(ts: number): string {
  return String(new Date(ts).getUTCDate());
}

function utcMonYear(ts: number): string {
  const d = new Date(ts);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function sameUtcDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
}

function sameUtcMonth(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth()
  );
}

type XLabelMode = "intraday" | "day" | "month";

function inferXLabelMode(sorted: AxisTick[]): XLabelMode {
  if (sorted.length < 2) return "intraday";
  const i = Math.max(1, Math.floor(sorted.length / 2));
  const dt = Math.abs(Number(sorted[i].value) - Number(sorted[i - 1].value));
  const hour = 3600000;
  const day = 86400000;
  if (dt >= 25 * day) return "month";
  if (dt >= 16 * hour) return "day";
  return "intraday";
}

/** TradingView-like: time under each grid; date when UTC day (or coarser) changes. */
function formatXAxisTick(ts: number, prev: number | null, mode: XLabelMode): string {
  if (mode === "intraday") {
    if (prev == null || sameUtcDay(ts, prev)) return utcHM(ts);
    return utcDayOfMonth(ts);
  }
  if (mode === "day") {
    if (prev == null || !sameUtcDay(ts, prev)) return utcDayOfMonth(ts);
    return utcHM(ts);
  }
  if (prev == null || !sameUtcMonth(ts, prev)) return utcMonYear(ts);
  return utcDayOfMonth(ts);
}

function unifyXAxisLabels(ticks: AxisTick[]): AxisTick[] {
  const sorted = [...ticks].sort((a, b) => a.coord - b.coord);
  const mode = inferXLabelMode(sorted);
  let prev: number | null = null;
  return sorted.map((t) => {
    const ts = Number(t.value);
    if (!Number.isFinite(ts)) return t;
    const text = formatXAxisTick(ts, prev, mode);
    prev = ts;
    return { ...t, text };
  });
}

function densifyTicksOnce(ticks: AxisTick[]): AxisTick[] {
  if (ticks.length < 2) return ticks;
  const sorted = [...ticks].sort((a, b) => a.coord - b.coord);
  const out: AxisTick[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    out.push(a);
    const na = Number(a.value);
    const nb = Number(b.value);
    if (!Number.isFinite(na) || !Number.isFinite(nb)) continue;
    const mid = (na + nb) / 2;
    const midCoord = (a.coord + b.coord) / 2;
    const prec = Math.min(
      Math.max(decimalsFromTickText(a.text, b.text), 2),
      8
    );
    out.push({
      coord: midCoord,
      value: mid,
      text: utils.formatPrecision(mid, prec),
    });
  }
  out.push(sorted[sorted.length - 1]);
  return out;
}

function decimalsFromTickText(a: string, b: string): number {
  const da = (a.split(".")[1] || "").length;
  const db = (b.split(".")[1] || "").length;
  return Math.max(da, db);
}

function densifyTimeTicksOnce(ticks: AxisTick[]): AxisTick[] {
  if (ticks.length < 2) return ticks;
  const sorted = [...ticks].sort((a, b) => a.coord - b.coord);
  const out: AxisTick[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    out.push(a);
    const na = Number(a.value);
    const nb = Number(b.value);
    if (!Number.isFinite(na) || !Number.isFinite(nb)) continue;
    const mid = (na + nb) / 2;
    const midCoord = (a.coord + b.coord) / 2;
    out.push({ coord: midCoord, value: mid, text: "" });
  }
  out.push(sorted[sorted.length - 1]);
  return out;
}

function medianXSpacing(sortedByX: AxisTick[]): number {
  if (sortedByX.length < 2) return 72;
  const gaps: number[] = [];
  for (let i = 1; i < sortedByX.length; i++) {
    const g = sortedByX[i].coord - sortedByX[i - 1].coord;
    if (g > 1) gaps.push(g);
  }
  if (gaps.length === 0) return 72;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}

function extrapolateTimestamp(sorted: AxisTick[], x: number): number {
  if (sorted.length === 0) return x;
  if (sorted.length === 1) return Number(sorted[0].value);
  const a = sorted[sorted.length - 2];
  const b = sorted[sorted.length - 1];
  const ta = Number(a.value);
  const tb = Number(b.value);
  const dx = b.coord - a.coord;
  if (dx <= 0 || !Number.isFinite(ta) || !Number.isFinite(tb)) return tb;
  return tb + ((x - b.coord) * (tb - ta)) / dx;
}

function padXTicksToRightEdge(ticks: AxisTick[], bounding: Bounding): AxisTick[] {
  if (ticks.length === 0 || bounding.width <= 1) return ticks;
  const sorted = [...ticks].sort((a, b) => a.coord - b.coord);
  const last = sorted[sorted.length - 1];
  const right = bounding.width;
  const gap = right - last.coord;
  if (gap < 4) return sorted;

  const step = Math.max(20, Math.min(medianXSpacing(sorted), gap));
  const pad: AxisTick[] = [];
  let x = last.coord + step;
  while (x < right - 0.5) {
    const ts = extrapolateTimestamp(sorted, x);
    pad.push({
      coord: x,
      value: ts,
      text: "",
    });
    x += step;
  }
  return [...sorted, ...pad].sort((a, b) => a.coord - b.coord);
}

function registerDenseGridAxes() {
  if (registered) return;
  registered = true;

  const PASSES = 1;

  registerYAxis({
    name: "default",
    createTicks(params: AxisCreateTicksParams) {
      let t = params.defaultTicks;
      for (let p = 0; p < PASSES; p++) t = densifyTicksOnce(t);
      return t;
    },
  });

  registerXAxis({
    name: "default",
    createTicks(params: AxisCreateTicksParams) {
      let t = params.defaultTicks;
      for (let p = 0; p < PASSES; p++) t = densifyTimeTicksOnce(t);
      t = padXTicksToRightEdge(t, params.bounding);
      return unifyXAxisLabels(t);
    },
  });
}

registerDenseGridAxes();
