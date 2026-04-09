import { useEffect, useState } from "react";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatUtcOffset(d: Date): string {
  const totalMinutes = -d.getTimezoneOffset();
  const sign = totalMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  return `UTC${sign}${hours}:${pad2(minutes)}`;
}

function formatLocalSessionTime(): string {
  const d = new Date();
  const t = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  return `${t} ${formatUtcOffset(d)}`;
}

export function useLocalClock(): string {
  const [label, setLabel] = useState(() => formatLocalSessionTime());

  useEffect(() => {
    const id = setInterval(() => setLabel(formatLocalSessionTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return label;
}
