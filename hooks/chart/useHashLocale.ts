import { useEffect, useState } from "react";

export function useHashLocale<TLocale>(resolveLocale: () => TLocale): TLocale {
  const [locale, setLocale] = useState<TLocale>(() => resolveLocale());

  useEffect(() => {
    const onHash = () => setLocale(resolveLocale());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [resolveLocale]);

  return locale;
}
