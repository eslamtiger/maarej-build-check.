"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost";
export type ButtonProps = HTMLMotionProps<"button"> & { variant?: ButtonVariant };

export function Button({ className, variant = "default", disabled, ...props }: ButtonProps) {
  return <motion.button data-slot="button" disabled={disabled} whileTap={disabled ? undefined : { scale: .98 }} transition={{ duration: .14 }} className={cn("v102-button", `v102-button--${variant}`, className)} {...props} />;
}
