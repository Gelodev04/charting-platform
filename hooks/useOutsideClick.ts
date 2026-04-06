import { useEffect } from "react";

type OutsideClickOptions = {
  enabled?: boolean;
  onOutsideClick: () => void;
  onEscape?: () => void;
};

export function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { enabled = true, onOutsideClick, onEscape }: OutsideClickOptions
) {
  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape?.();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onEscape, onOutsideClick, ref]);
}
