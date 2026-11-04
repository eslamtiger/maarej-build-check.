"use client";
import { motion, useReducedMotion } from "motion/react";
import { Check, ChevronUp, Compass, Flag, LockKeyhole, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import type { IdentityTheme } from "./journey-theme";
import styles from "./learning-roadmap-v2.module.css";

export type LandmarkState = "completed" | "current" | "challenge" | "next" | "locked";
export function IdentityEmblem({ theme, size = 24 }: { theme: IdentityTheme; size?: number }) {
  const Icon = theme.emblem === "compass" ? Compass : theme.emblem === "spark" ? Sparkles : ShieldCheck;
  return <Icon size={size} aria-hidden="true"/>;
}
export function JourneyLandmark({ state, theme, label, x, y, index, atRisk, onOpen }: {
  state: LandmarkState; theme: IdentityTheme; label: string;
  x: number; y: number; index: number; atRisk?: boolean; onOpen: () => void;
}) {
  const reduce = useReducedMotion();
  const current = state === "current", done = state === "completed", locked = state === "locked";
  const color = done ? "#278A67" : state === "challenge" ? "#E4943D" : locked ? "#A6A4BD" : theme.primaryColor;
  const Emblem = theme.emblem === "compass" ? Compass : theme.emblem === "spark" ? Sparkles : ShieldCheck;
  const Icon = done ? Check : current ? Emblem : state === "challenge" ? Flag : locked ? LockKeyhole : ChevronUp;
  return <motion.button type="button" className={styles.landmarkButton} data-landmark={state} aria-label={`${label} — عرض تفاصيل المرحلة`}
    style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: current ? "29%" : "22%" }}
    initial={reduce ? false : { opacity: 0, scale: current ? .9 : .94 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: .24, delay: reduce ? 0 : index * .10 }}
    whileTap={reduce ? undefined : { scale: .97 }} onClick={onOpen}>
    <svg viewBox="0 0 100 100" aria-hidden="true" style={{ color }} data-style={theme.landmarkStyle}>
      <ellipse cx="50" cy="78" rx={current ? 40 : 33} ry="10" fill={color} opacity=".10"/>
      <path d="M 17 57 Q 50 44 83 57 L 83 66 Q 50 89 17 66 Z" fill={color} opacity={locked ? ".12" : ".32"}/>
      <ellipse cx="50" cy="57" rx="33" ry="14" fill={locked ? "#EEEDF5" : done ? "#D8EFE3" : "white"} stroke={color} strokeWidth="2"/>
      {current && <><ellipse cx="50" cy="57" rx="43" ry="23" fill="none" stroke={color} strokeWidth="2" opacity=".28"/><ellipse cx="50" cy="57" rx="37" ry="19" fill="none" stroke={color} strokeWidth="2"/></>}
      <g opacity={locked ? .65 : 1}>
        {state === "challenge" || theme.landmarkStyle === "hex" ?
          <path d="M 50 12 L 72 24 L 72 48 L 50 60 L 28 48 L 28 24 Z" fill={current ? color : state === "challenge" ? "#FFF0DA" : done ? color : "#F1EEFF"} stroke={color} strokeWidth="2"/> :
          theme.landmarkStyle === "crest" ?
            <path d="M 28 17 L 50 11 L 72 17 V 39 Q 68 53 50 60 Q 32 53 28 39 Z" fill={current || done ? color : "#F1EEFF"} stroke={color} strokeWidth="2"/> :
            <rect x="27" y="13" width="46" height="46" rx="17" fill={current || done ? color : "#F1EEFF"} stroke={color} strokeWidth="2"/>}
        <Icon x="37" y="24" width="26" height="26" color={current || done ? "white" : color} strokeWidth={done ? 3 : 2}/>
      </g>
      {atRisk && current && <g><circle cx="76" cy="18" r="11" fill="#FFF0DA"/><TriangleAlert x="68" y="10" width="16" height="16" color="#B67416"/></g>}
    </svg>
  </motion.button>;
}
