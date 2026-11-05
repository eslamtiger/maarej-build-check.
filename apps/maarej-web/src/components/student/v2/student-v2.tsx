"use client";
// Student V2 building blocks shared by Home, Learning and detail screens.
import Link from "next/link";
import confetti from "canvas-confetti";
import { useEffect, useState, type CSSProperties } from "react";
import { Atom, BookOpen, Calculator, Languages, PenLine, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { studentSubjects, subjectWorkspace } from "@/data/student-subject-view";
import { formatPerformanceChange } from "@/data/student-performance-view";

// One colour per subject so a subject is recognisable everywhere it appears.
const subjectThemes: Record<string, { color: string; tint: string; Icon: typeof Calculator }> = {
  math: { color: "#4B3FD6", tint: "#EFEDFF", Icon: Calculator },
  physics: { color: "#D93D63", tint: "#FFEFF3", Icon: Atom },
  arabic: { color: "#12865F", tint: "#E7F6EF", Icon: PenLine },
  english: { color: "#1F7FCC", tint: "#E8F3FD", Icon: Languages },
};
const subjectKeys: Record<string, string> = { "رياضيات": "math", "فيزياء": "physics", "لغة عربية": "arabic", "اللغة العربية": "arabic", "إنجليزي": "english", "اللغة الإنجليزية": "english" };
export function subjectTheme(idOrName: string) {
  return subjectThemes[idOrName] ?? subjectThemes[subjectKeys[idOrName] ?? ""] ?? { color: "#B26A00", tint: "#FFF4E0", Icon: BookOpen };
}
export function subjectStyle(idOrName: string) {
  const t = subjectTheme(idOrName);
  return { "--subject": t.color, "--subject-tint": t.tint } as CSSProperties;
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.querySelector("[data-reduce-motion=true]")) { setValue(target); return; }
    let frame = 0; const start = performance.now();
    const step = (now: number) => { const p = Math.min(1, (now - start) / duration); setValue(Math.round(target * (1 - Math.pow(1 - p, 4)))); if (p < 1) frame = requestAnimationFrame(step); };
    setValue(0); frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const shown = useCountUp(value);
  return <bdi dir="ltr">{shown}{suffix}</bdi>;
}

export function SubjectTile({ id }: { id: string }) {
  const view = subjectWorkspace(id);
  if (!view) return null;
  const t = subjectTheme(id), score = view.performance, change = score?.trend.value ?? 0;
  const Trend = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  return <Link href={`/student/learning/subjects/${id}`} className="s2-subject" style={subjectStyle(id)}>
    <span className="s2-subject-icon" aria-hidden="true"><t.Icon size={20}/></span>
    <h3>{view.subject.name}</h3>
    {score ? <strong className="s2-subject-score"><CountUp value={score.currentValue} suffix="%"/></strong> : <strong className="s2-subject-score">—</strong>}
    {score && <span className="s2-trend" data-direction={change > 0 ? "up" : change < 0 ? "down" : "flat"}><Trend size={14} aria-hidden="true"/>{change === 0 ? "ثابت" : formatPerformanceChange(change)}</span>}
    <small>{view.teachers[0]?.name ?? "مفيش مجموعة حالية"}</small>
  </Link>;
}
export function SubjectTiles() {
  return <div className="s2-subjects">{studentSubjects.map(s => <SubjectTile key={s.id} id={s.id}/>)}</div>;
}

export type RingItem = { id: string; label: string; caption: string; value: number; display: string; color: string; href?: string };
export function ProgressRings({ items }: { items: readonly RingItem[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(id); }, []);
  const C = 2 * Math.PI * 46;
  return <div className="s2-rings">{items.map(r => {
    const body = <><span className="s2-ring-dial"><svg viewBox="0 0 112 112" aria-hidden="true"><circle className="s2-ring-track" cx="56" cy="56" r="46"/><circle className="s2-ring-fill" cx="56" cy="56" r="46" stroke={r.color} strokeDasharray={C} strokeDashoffset={ready ? C * (1 - Math.max(0, Math.min(1, r.value))) : C}/></svg><b>{r.display}</b></span><strong>{r.label}</strong><small>{r.caption}</small></>;
    return r.href ? <Link key={r.id} href={r.href} className="s2-ring" aria-label={`${r.label}: ${r.display}، ${r.caption}`}>{body}</Link> : <div key={r.id} className="s2-ring">{body}</div>;
  })}</div>;
}

// A short, quiet burst for real milestones only (a submitted task, a completed mission).
export function celebrate() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.querySelector("[data-reduce-motion=true]")) return;
  void confetti({ particleCount: 110, spread: 80, startVelocity: 38, origin: { y: .7 }, colors: ["#4B3FD6", "#FFB53D", "#22C08A", "#FF6B8A", "#A59CFF"], disableForReducedMotion: true });
}
