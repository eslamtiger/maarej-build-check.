"use client";
import { DAYS, hhmmAr } from "@/lib/format";
import type { GroupCard } from "@/lib/types";
import { useCallback, useEffect, useState, type ReactNode } from "react";

export function notify(msg: string, kind: "ok" | "err" = "ok") {
  window.dispatchEvent(new CustomEvent("maarej-toast", { detail: { msg, kind } }));
}

export function Toast() {
  const [t, setT] = useState<{ msg: string; kind: string } | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setT((e as CustomEvent).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setT(null), 3500);
    };
    window.addEventListener("maarej-toast", on);
    return () => { window.removeEventListener("maarej-toast", on); clearTimeout(timer); };
  }, []);
  return t ? <div className={`toast ${t.kind === "err" ? "err" : ""}`} role="status">{t.msg}</div> : null;
}

/** Load async data; `reload()` refetches (used after every write). */
export function useLoad<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    fn().then((d) => { setData(d); setError(null); }).catch((e) => setError(e?.message ?? "حصلت مشكلة"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(load, [load]);
  return { data, error, reload: load };
}

export function Loading({ error }: { error: string | null }) {
  return error ? <div className="empty" style={{ color: "var(--bad)" }}>{error}</div> : <div className="empty">جاري التحميل…</div>;
}

/** Run a write, toast the outcome, and reload on success. */
export async function run<T>(p: Promise<{ ok: true; data: T } | { ok: false; error: string }>, okMsg: string, then?: (d: T) => void) {
  const r = await p;
  if (r.ok) { notify(okMsg); then?.(r.data); } else notify(r.error, "err");
  return r.ok;
}

export const Pill = ({ tone, children }: { tone?: "w" | "b" | "o"; children: ReactNode }) => <span className={`pill ${tone ?? ""}`}>{children}</span>;

export const invoiceTone = (s: string): "w" | "b" | "o" | undefined => (s === "paid" ? "o" : s === "overdue" ? "b" : s === "partial" ? "w" : undefined);
export const invoiceLabel = (s: string) => ({ paid: "دفع", partial: "دفع جزء", overdue: "متأخر", due: "مستحق", waived: "معفي" } as Record<string, string>)[s] ?? s;

export const Dots = ({ list }: { list: string[] }) => <span className="dots" aria-label="آخر حصص الحضور">{list.map((d, i) => <i key={i} className={d} />)}</span>;

export const PERM: Record<string, string> = { attendance: "الحضور", payments: "المدفوعات", badges: "البادجات", notes: "الملاحظات" };

const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5]; // Saturday first
export function WeekGrid({ groups }: { groups: GroupCard[] }) {
  return (
    <div className="scroll">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(110px,1fr))", gap: 6, minWidth: 780 }}>
        {WEEK_ORDER.map((day) => {
          const slots = groups.flatMap((g, gi) => g.slots.filter((x) => x.day === day).map((x) => ({ g, gi, ...x }))).sort((a, b) => a.start.localeCompare(b.start));
          return (
            <div key={day}>
              <div className="lbl" style={{ textAlign: "center", marginBottom: 4 }}>{DAYS[day]}</div>
              <div style={{ display: "grid", gap: 6, minHeight: 40 }}>
                {slots.map((x, i) => (
                  <div key={i} style={{ borderRadius: 8, padding: "6px 8px", borderInlineStart: `3px solid ${["var(--acc)", "var(--ok)", "var(--warn)"][x.gi % 3]}`, background: ["var(--accSoft)", "var(--okSoft)", "var(--warnSoft)"][x.gi % 3], fontSize: 12 }}>
                    <b>{x.g.name}</b><br /><span className="lbl">{hhmmAr(x.start)} – {hhmmAr(x.end)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
