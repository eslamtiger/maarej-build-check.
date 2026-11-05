"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

// Copied from Magic UI registry and restyled for Maarej locale/tokens.
export interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
  locale?: string;
}

export function NumberTicker({ value, startValue = 0, direction = "up", delay = 0, className, decimalPlaces = 0, locale = "ar-EG-u-nu-latn", ...props }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "0px" });
  useEffect(() => {
    if (!isInView) return;
    const timer = window.setTimeout(() => motionValue.set(direction === "down" ? startValue : value), delay * 1000);
    return () => window.clearTimeout(timer);
  }, [motionValue, isInView, delay, value, direction, startValue]);
  useEffect(() => springValue.on("change", latest => {
    if (!ref.current) return;
    ref.current.textContent = new Intl.NumberFormat(locale, { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(Number(latest.toFixed(decimalPlaces)));
  }), [springValue, decimalPlaces, locale]);
  return <span ref={ref} className={cn("v102-number-ticker", className)} {...props}>{new Intl.NumberFormat(locale).format(startValue)}</span>;
}
