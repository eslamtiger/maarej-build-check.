"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function Progress({ className, value = 0, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const reduce = useReducedMotion();
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return <ProgressPrimitive.Root data-slot="progress" className={cn("v102-progress", className)} value={safe} {...props}>
    <ProgressPrimitive.Indicator asChild>
      <motion.div className="v102-progress__indicator" initial={reduce ? { width: `${safe}%` } : { width: 0 }} animate={{ width: `${safe}%` }} transition={reduce ? { duration: 0 } : { duration: .72, ease: [.2,.8,.2,1] }} />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>;
}
