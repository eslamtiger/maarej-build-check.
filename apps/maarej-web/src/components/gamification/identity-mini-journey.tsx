"use client";

import { Check, LockKeyhole } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { StudentIdentityView } from "@/data/student-v105-identity-view";

const path = "M28 86 C96 18 196 18 332 82";

export function IdentityMiniJourney({ view }: { view: StudentIdentityView }) {
  const reduce = useReducedMotion();
  const nodes = view.journeyNodes.slice(1, 4);
  const positions = [42, 180, 318];
  const activeIndex = Math.max(0, nodes.findIndex((node) => node.status === "active" || node.status === "atRisk"));
  const fraction = nodes.length > 1 ? activeIndex / (nodes.length - 1) : 0;

  return <div className="v105-mini-journey" aria-label="موقع الطالب الحالي في رحلة الهوية">
    <svg viewBox="0 0 360 120" role="img" aria-label="ثلاث محطات توضح موقعك الحالي والخطوة التالية">
      <defs><linearGradient id="miniJourneyGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#635BDF"/><stop offset="100%" stopColor="#219EBC"/></linearGradient></defs>
      <path d={path} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="6" strokeLinecap="round"/>
      <motion.path d={path} fill="none" stroke="url(#miniJourneyGradient)" strokeWidth="6" strokeLinecap="round" initial={reduce ? { pathLength: fraction } : { pathLength: 0 }} animate={{ pathLength: fraction }} transition={{ duration: reduce ? 0 : .75, ease: [.2,.8,.2,1] }}/>
      {nodes.map((node, index) => {
        const x = positions[index];
        const y = index === 1 ? 43 : 82;
        const active = node.status === "active" || node.status === "atRisk";
        const done = node.status === "completed";
        return <g key={node.id} transform={`translate(${x} ${y})`}>
          <motion.circle r={active ? 23 : 18} fill={done ? "#635BDF" : active ? "#fff" : "rgba(255,255,255,.9)"} stroke={active ? (node.status === "atRisk" ? "#DD8A32" : "#635BDF") : "rgba(255,255,255,.45)"} strokeWidth={active ? 4 : 2} initial={reduce || !active ? false : { scale: .9 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : .3 }}/>
          {done ? <Check x={-9} y={-9} width={18} height={18} color="#fff"/> : node.status === "locked" ? <LockKeyhole x={-8} y={-8} width={16} height={16} color="#687986"/> : null}
          {active ? <text y="-32" textAnchor="middle" className="v105-mini-here">أنت هنا</text> : null}
          <text y={active ? 41 : 34} textAnchor="middle" className="v105-mini-label">{node.label}</text>
        </g>;
      })}
    </svg>
  </div>;
}
