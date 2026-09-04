import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * 觀測元素尺寸，回傳 [ref, { width, height, min }]。
 * min = Math.min(width, height)，適合用來做「正方形圓桌」的等比縮放基準。
 */
export const useElementSize = <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0, min: 0 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    setSize((prev) =>
      prev.width === w && prev.height === h ? prev : { width: w, height: h, min: Math.min(w, h) },
    );
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return [ref, size] as const;
};
