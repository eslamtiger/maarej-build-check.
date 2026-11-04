"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motionTokens } from "@maarej/design-tokens/motion";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { Award, Bell, CalendarClock, ChevronLeft, Sparkles, Star, Trophy, X, type LucideIcon } from "lucide-react";

export type Tone = "blue" | "violet" | "mint" | "amber" | "rose";

export function MaarejHeader({ title = "معارج", subtitle, actions }: { title?: string; subtitle?: string; actions?: ReactNode }) {
  return <header className="m-header"><div className="m-header__brand"><span className="m-header__mark">م</span><span><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span></div><div className="m-header__actions">{actions ?? <button className="m-icon-button" aria-label="الإشعارات"><Bell size={20}/></button>}</div></header>;
}

export function MaarejBottomNav({ items, activeId }: { items: Array<{ id: string; label: string; href: string; icon: LucideIcon }>; activeId: string }) {
  return <nav className="mobile-bottom-nav" aria-label="التنقل الرئيسي">{items.map(item => <Link key={item.id} href={item.href} className={item.id === activeId ? "is-active" : ""}><motion.span whileTap={{ scale: .9 }}><item.icon size={21}/></motion.span><small>{item.label}</small></Link>)}</nav>;
}

export function MaarejTabs({ items, defaultId }: { items: Array<{ id: string; label: string; content?: ReactNode }>; defaultId?: string }) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const current = items.find(item => item.id === active);
  return <div className="m-tabs-wrap"><div className="m-tabs" role="tablist">{items.map(item => <button key={item.id} role="tab" aria-selected={item.id === active} className={item.id === active ? "is-active" : ""} onClick={() => setActive(item.id)}>{item.label}</button>)}</div>{current?.content && <motion.div key={current.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="m-tab-panel">{current.content}</motion.div>}</div>;
}

export function MaarejModal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  return <AnimatePresence>{open && <motion.div className="m-modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={onClose}><motion.section role="dialog" aria-modal="true" aria-label={title} className="m-modal" initial={{opacity:0, y:18, scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:12,scale:.98}} transition={{ duration: motionTokens.duration.base, ease: motionTokens.easing.emphasized }} onMouseDown={e => e.stopPropagation()}><div className="m-modal__head"><strong>{title}</strong><button className="m-icon-button" onClick={onClose} aria-label="إغلاق"><X size={19}/></button></div><div className="m-modal__body">{children}</div></motion.section></motion.div>}</AnimatePresence>;
}

export function MaarejButton({ children, variant = "primary", ...props }: HTMLMotionProps<"button"> & { variant?: "primary" | "secondary" | "ghost" }) {
  return <motion.button whileTap={{ scale: 0.97 }} className={`m-button m-button--${variant}`} {...props}>{children}</motion.button>;
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <div className="m-section-header"><div>{eyebrow && <span className="m-eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>;
}

export function VisualPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.emphasized }} className={`m-panel ${className}`}>{children}</motion.section>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return <div className="m-progress-wrap">{label && <div className="m-progress-label"><span>{label}</span><strong>{value}%</strong></div>}<div className="m-progress"><motion.span initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, value))}%` }} transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.emphasized }} /></div></div>;
}

export function ProgressRing({ value, label }: { value: number; label: string }) {
  const radius = 36; const circumference = 2 * Math.PI * radius; const offset = circumference - (value / 100) * circumference;
  return <div className="m-ring" aria-label={`${label}: ${value}%`}><svg viewBox="0 0 88 88"><circle className="m-ring__track" cx="44" cy="44" r={radius}/><motion.circle className="m-ring__value" cx="44" cy="44" r={radius} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.emphasized }} style={{ strokeDasharray: circumference }}/></svg><div><strong>{value}%</strong><span>{label}</span></div></div>;
}

export function AchievementBadge({ title, subtitle, tone = "violet" }: { title: string; subtitle: string; tone?: Tone }) {
  return <motion.button whileHover={{ y: -3 }} whileTap={{ scale: .98 }} className={`m-badge m-tone-${tone}`}><span className="m-badge__icon"><Trophy size={20}/></span><span><strong>{title}</strong><small>{subtitle}</small></span></motion.button>;
}

export function RecognitionCard({ title, body, by = "المعلم" }: { title: string; body: string; by?: string }) {
  return <div className="m-recognition"><span className="m-recognition__icon"><Award size={20}/></span><div><small>Recognition · {by}</small><strong>{title}</strong><p>{body}</p></div></div>;
}

export function ActivityCard({ title, meta, tone = "blue" }: { title: string; meta: string; tone?: Tone }) {
  return <div className="m-activity"><span className={`m-activity__dot m-tone-${tone}`}/><div><strong>{title}</strong><small>{meta}</small></div><ChevronLeft size={18}/></div>;
}

export function ScheduleItem({ time, title, meta, emphasized = false }: { time: string; title: string; meta: string; emphasized?: boolean }) {
  return <div className={`m-schedule ${emphasized ? "is-emphasized" : ""}`}><div className="m-schedule__time"><CalendarClock size={17}/><strong>{time}</strong></div><div><strong>{title}</strong><small>{meta}</small></div></div>;
}

export function Identity({ name, role, level }: { name: string; role: string; level?: string }) {
  return <div className="m-identity"><div className="m-avatar">{name.trim().slice(0,1)}</div><div><strong>{name}</strong><span>{role}{level ? ` · ${level}` : ""}</span></div><button className="m-icon-button" aria-label="الإشعارات"><Bell size={20}/><i/></button></div>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="m-empty"><Sparkles size={26}/><strong>{title}</strong><p>{body}</p></div>;
}

export function LoadingState() {
  return <div className="m-loading" aria-label="جاري التحميل"><span/><span/><span/></div>;
}

export function StarMetric({ value, label }: { value: string; label: string }) {
  return <div className="m-star-metric"><Star size={18}/><strong>{value}</strong><span>{label}</span></div>;
}
