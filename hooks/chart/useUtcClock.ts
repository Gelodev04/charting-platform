import { useEffect, useState } from "react";

function formatUtcTime(): string {
  const d = new Date();
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(
    d.getUTCMinutes()
  ).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")} UTC`;
}

export function useUtcClock(): string {
  const [utcTime, setUtcTime] = useState(() => formatUtcTime());

  useEffect(() => {
    const id = setInterval(() => setUtcTime(formatUtcTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return utcTime;
}
