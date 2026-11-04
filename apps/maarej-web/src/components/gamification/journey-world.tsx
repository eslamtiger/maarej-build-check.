"use client";

import Link from "next/link";
import { ArrowLeft, BookOpenCheck, GraduationCap, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { JourneyNode, StudentIdentityView } from "@/data/student-v105-identity-view";
import { JourneyLandmark } from "./journey-landmark";
import { JourneyMissionOverlay } from "./journey-mission-overlay";
import { JourneyRewardMarker } from "./journey-reward-marker";
import { JourneyAchievementMarker } from "./journey-achievement-marker";
import { journeyTheme } from "./journey-theme";

const canvas = { width: 360, height: 480 };
const worldPath = "M282 438 C214 420 86 414 78 344 C70 278 282 286 284 222 C286 156 90 170 82 108 C77 70 148 52 278 44";
const placements = [
  { x: 282, y: 438, side: "above" as const },
  { x: 78, y: 344, side: "side" as const },
  { x: 284, y: 222, side: "below" as const },
  { x: 82, y: 108, side: "side" as const },
  { x: 278, y: 44, side: "below" as const },
];

export function JourneyWorld({
  view,
  mission,
  reward,
  onNodeOpen,
}: {
  view: StudentIdentityView;
  mission: { title: string; context: string; value: number; remaining: string; href: string };
  reward: { amount: number; href: string };
  onNodeOpen?: (node: JourneyNode) => void;
}) {
  const reduce = useReducedMotion();
  const nodes = view.journeyNodes.slice(0, placements.length);
  const activeIndex = Math.max(0, nodes.findIndex((node) => node.status === "active" || node.status === "atRisk"));
  const pathFraction = nodes.length > 1 ? Math.max(.08, activeIndex / (nodes.length - 1)) : 0;
  const completedCount = nodes.filter((node) => node.status === "completed").length;
  const stageSummary = `${completedCount} / ${Math.max(nodes.length - 1, 1)} مراحل مكتملة`;

  return <section className={`v1053-roadmap state-${view.status}`} aria-label="خارطة التقدم التعليمية">
    <span className="v1053-roadmap-shape shape-a"/><span className="v1053-roadmap-shape shape-b"/>
    <svg className="v1053-roadmap-guides" viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M20 122 C96 88 250 92 340 54"/><path d="M22 372 C132 336 236 350 340 312"/></svg>
    <div className="v1053-roadmap-intro"><small><GraduationCap size={14}/> رحلة التقدم</small><div><h2>تعلمك اليوم يبني خطوتك التالية</h2><span dir="ltr">{stageSummary}</span></div><p>{mission.context}</p></div>
    <div className="v1053-learning-cue"><BookOpenCheck size={15}/><span>هدف دراسي نشط</span></div>
    <svg className="v1053-roadmap-path" viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet" role="img" aria-label="مسار التقدم الحالي">
      <defs><linearGradient id="v1053WorldGradient" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor={journeyTheme.pathCompleteStart}/><stop offset="100%" stopColor={journeyTheme.pathCompleteEnd}/></linearGradient></defs>
      <path d={worldPath} fill="none" stroke={journeyTheme.pathIncomplete} strokeWidth="7" strokeLinecap="round"/>
      <motion.path d={worldPath} fill="none" stroke="url(#v1053WorldGradient)" strokeWidth="8" strokeLinecap="round" initial={reduce ? { pathLength: pathFraction } : { pathLength: 0 }} animate={{ pathLength: pathFraction }} transition={{ duration: reduce ? 0 : .68, ease: [.2,.8,.2,1] }}/>
    </svg>
    {nodes.map((node, index) => <JourneyLandmark key={node.id} node={node} x={placements[index].x} y={placements[index].y} canvasWidth={canvas.width} canvasHeight={canvas.height} labelSide={placements[index].side} onOpen={onNodeOpen}/>) }
    <span className="v1053-mission-connector" aria-hidden="true"/>
    <JourneyMissionOverlay title={mission.title} context={mission.context} value={mission.value} remaining={mission.remaining} href={mission.href} rewardAmount={reward.amount} risk={view.status === "atRisk"}/>
    <JourneyRewardMarker amount={reward.amount} href={reward.href}/>
    <JourneyAchievementMarker label="[الإنجاز القادم]"/>
    {view.status === "atRisk" ? <aside className="v1053-status-panel risk"><small>حافظ على لقبك</small><b>عنصر يحتاج مجهودًا إضافيًا</b><p>{view.nextMilestone}</p><Link href="/student/learning#homework">اعرف المطلوب <ArrowLeft size={14}/></Link></aside> : null}
    {view.status === "downgraded" ? <aside className="v1053-status-panel down"><ShieldCheck size={18}/><small>إنجازك السابق محفوظ</small><span>أعلى لقب حققته <b>{view.highestAchievedIdentity?.name}</b></span><span>لقبك الحالي <b>{view.currentIdentity?.name}</b></span><Link href="/student/learning#homework">استعد لقبك <ArrowLeft size={14}/></Link></aside> : null}
  </section>;
}
