import { useEffect } from "react";

export function useChartTheme(
  colorScheme: "light" | "dark",
  storageKey: string
) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", colorScheme === "dark");
    try {
      localStorage.setItem(storageKey, colorScheme);
    } catch {
      /* ignore */
    }
    return () => {
      root.classList.remove("dark");
    };
  }, [colorScheme, storageKey]);
}
