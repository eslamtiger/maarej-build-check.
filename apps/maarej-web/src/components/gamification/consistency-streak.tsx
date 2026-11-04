"use client";

import { Flame } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function ConsistencyStreak({ value, unit = "أيام متتالية", compact = false }: { value?: number | null; unit?: string; compact?: boolean }) {
  const reduce = useReducedMotion();
  if (!value || value <= 0) return null;
  return <motion.div
    className={compact ? "v102-streak v102-streak--compact" : "v102-streak"}
    initial={reduce ? false : { opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reduce ? 0 : .2 }}
    aria-label={`${value} ${unit}`}
  >
    <Flame size={compact ? 14 : 17}/><strong>{value}</strong><span>{unit}</span>
  </motion.div>;
}
