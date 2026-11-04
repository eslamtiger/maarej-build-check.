"use client";

import type { CSSProperties } from "react";
import type { IdentityStatus, IdentityVisualThemeConfig } from "@/data/student-v105-identity-view";

export type IdentityVisualConfig = IdentityVisualThemeConfig;

function IdentityGlyph({ variant }: { variant: IdentityVisualConfig["symbol"] }) {
  if (variant === "compass") return <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="20"/><path d="M39 23 34 35 22 40l5-12 12-5Z"/><circle cx="32" cy="32" r="3"/></svg>;
  if (variant === "diamond") return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 10 51 28 32 54 13 28 32 10Z"/><path d="M20 28h24M32 11v43"/></svg>;
  return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M15 39c7-8 14-11 22-9 5 1 9 4 12 8"/><path d="M18 20h13c6 0 11 5 11 11v18"/><path d="M18 20v21h10c7 0 14 4 14 8"/><circle cx="46" cy="18" r="5"/></svg>;
}

export function IdentityEmblem({ config, status, size = 104 }: { config: IdentityVisualConfig; status: IdentityStatus; size?: number }) {
  const shape = config.shapeVariant ?? "hex";
  return <div
    className={`v1052-identity-emblem shape-${shape} status-${status}`}
    style={{ "--emblem-size": `${size}px`, "--emblem-a": config.primaryAccent, "--emblem-b": config.secondaryAccent } as CSSProperties}
    aria-label="رمز الهوية الحالي"
  >
    <span className="v1052-emblem-frame"/>
    <span className="v1052-emblem-core"><IdentityGlyph variant={config.symbol}/></span>
    <span className="v1052-emblem-track"/>
    <i className="v1052-emblem-status"/>
  </div>;
}
