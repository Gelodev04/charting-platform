import type { AxisCreateTicksParams, AxisTick } from "klinecharts";
import { registerYAxis, utils } from "klinecharts";

let registered = false;

function decimalsFromTickText(a: string, b: string): number {
  const da = (a.split(".")[1] || "").length;
  const db = (b.split(".")[1] || "").length;
  return Math.max(da, db);
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
    const prec = Math.min(Math.max(decimalsFromTickText(a.text, b.text), 2), 8);
    out.push({
      coord: midCoord,
      value: mid,
      text: utils.formatPrecision(mid, prec),
    });
  }
  out.push(sorted[sorted.length - 1]);
  return out;
}

function registerDenseYAxis() {
  if (registered) return;
  registered = true;
  registerYAxis({
    name: "default",
    createTicks(params: AxisCreateTicksParams) {
      return densifyTicksOnce(params.defaultTicks);
    },
  });
}

registerDenseYAxis();
