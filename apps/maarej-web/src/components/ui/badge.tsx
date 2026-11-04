import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "blue" | "mint" | "amber" | "rose" | "violet" | "gold";
export function Badge({ className, tone = "blue", ...props }: React.ComponentProps<"span"> & { tone?: BadgeTone }) {
  return <span data-slot="badge" className={cn("v102-badge", `v102-badge--${tone}`, className)} {...props} />;
}
