import { useEffect, useState } from "react";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatLocalSessionTime(): string {
  const d = new Date();
  const t = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  const tz =
    new Intl.DateTimeFormat(undefined, { timeZoneName: "short" })
      .formatToParts(d)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  return tz ? `${t} ${tz}` : t;
}

export function useLocalClock(): string {
  const [label, setLabel] = useState(() => formatLocalSessionTime());

  useEffect(() => {
    const id = setInterval(() => setLabel(formatLocalSessionTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return label;
}
