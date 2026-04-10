import type { AxisCreateTicksParams, AxisTick } from "klinecharts";
import { registerXAxis } from "klinecharts";

let registered = false;

const HOUR_MS = 3600000;

function utcDay(ts: number): number {
  return new Date(ts).getUTCDate();
}

function isSameUtcMonth(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth()
  );
}

function isSameUtcYear(a: number, b: number): boolean {
  return new Date(a).getUTCFullYear() === new Date(b).getUTCFullYear();
}

function isSameUtcDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
}

function utcYear(ts: number): string {
  return String(new Date(ts).getUTCFullYear());
}

function utcMonthShort(ts: number): string {
  const m = new Date(ts).getUTCMonth();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
  return months[Math.max(0, Math.min(11, m))];
}

function medianDeltaMs(sorted: AxisTick[]): number {
  if (sorted.length < 2) return 0;
  const deltas: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const a = Number(sorted[i - 1].value);
    const b = Number(sorted[i].value);
    if (Number.isFinite(a) && Number.isFinite(b) && b > a) deltas.push(b - a);
  }
  if (deltas.length === 0) return 0;
  deltas.sort((a, b) => a - b);
  return deltas[Math.floor(deltas.length / 2)];
}

function adaptTicks(ticks: AxisTick[]): AxisTick[] {
  const sorted = [...ticks].sort((a, b) => a.coord - b.coord);
  const step = medianDeltaMs(sorted);
  if (step < 8 * HOUR_MS) return ticks;

  return sorted.map((t, i) => {
    const ts = Number(t.value);
    if (!Number.isFinite(ts)) return t;
    const day = String(utcDay(ts));
    if (i === 0) return { ...t, text: day };
    const prev = Number(sorted[i - 1].value);
    if (!Number.isFinite(prev)) return { ...t, text: day };
    // Keep engine-generated same-day label so timezone/locale stays consistent
    // with crosshair/hover time formatting.
    if (isSameUtcDay(ts, prev)) return t;
    if (!isSameUtcYear(ts, prev)) {
      return { ...t, text: utcYear(ts) };
    }
    if (!isSameUtcMonth(ts, prev)) {
      return { ...t, text: utcMonthShort(ts) };
    }
    return { ...t, text: day };
  });
}

function registerAdaptiveXAxis() {
  if (registered) return;
  registered = true;

  registerXAxis({
    name: "default",
    createTicks(params: AxisCreateTicksParams) {
      return adaptTicks(params.defaultTicks);
    },
  });
}

registerAdaptiveXAxis();
