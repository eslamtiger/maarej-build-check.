"use client";

import { useEffect, useState } from "react";
import type { IdentityStatus } from "@/data/student-v105-identity-view";

export type QaIdentityMode = Extract<IdentityStatus, "active" | "atRisk" | "downgraded">;
const KEY = "maarej-qa-identity-mode";
const DEFAULT: QaIdentityMode = "active";

export function readQaIdentityMode(): QaIdentityMode {
  if (typeof window === "undefined") return DEFAULT;
  const value = window.localStorage.getItem(KEY);
  return value === "atRisk" || value === "downgraded" || value === "active" ? value : DEFAULT;
}

export function writeQaIdentityMode(mode: QaIdentityMode) {
  window.localStorage.setItem(KEY, mode);
  window.dispatchEvent(new Event("maarej-qa-identity-change"));
}

export function resetQaIdentityMode() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("maarej-qa-identity-change"));
}

export function useQaIdentityMode() {
  const [mode, setMode] = useState<QaIdentityMode>(DEFAULT);
  useEffect(() => {
    const sync = () => setMode(readQaIdentityMode());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("maarej-qa-identity-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("maarej-qa-identity-change", sync);
    };
  }, []);
  return mode;
}
