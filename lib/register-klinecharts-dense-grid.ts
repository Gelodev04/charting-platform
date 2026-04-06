import type {
  AxisCreateTicksParams,
  AxisTick,
  Bounding,
} from "klinecharts";
import { registerXAxis, registerYAxis, utils } from "klinecharts";

let registered = false;

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
  let i = 0;
  const base = Number(last.value);
  const baseNum = Number.isFinite(base) ? base : 0;
  while (x < right - 0.5) {
    i += 1;
    pad.push({
      coord: x,
      value: baseNum + i,
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
      return padXTicksToRightEdge(t, params.bounding);
    },
  });
}

registerDenseGridAxes();
