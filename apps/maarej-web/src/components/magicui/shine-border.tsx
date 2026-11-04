import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

// V1.03 Android-safe variant: static emphasis only.
// No CSS mask, mask-composite, animated background-position, filter, or backdrop-filter.
export function ShineBorder({
  className,
  shineColor = ["#7857d8", "#e5b94e", "#4a89e8"],
  borderWidth = 1,
  style,
}: {
  className?: string;
  duration?: number;
  shineColor?: string | string[];
  borderWidth?: number;
  style?: CSSProperties;
}) {
  const colors = Array.isArray(shineColor) ? shineColor : [shineColor];
  return (
    <div
      aria-hidden="true"
      className={cn("v102-shine-border", className)}
      style={{
        "--shine-color-a": colors[0] ?? "#7857d8",
        "--shine-color-b": colors[1] ?? colors[0] ?? "#e5b94e",
        "--shine-color-c": colors[2] ?? colors[0] ?? "#4a89e8",
        "--shine-width": `${borderWidth}px`,
        ...style,
      } as CSSProperties}
    />
  );
}
