"use client";

import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Gift } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Progress } from "@/components/ui/progress";

export function JourneyMissionOverlay({
  title,
  context,
  value,
  remaining,
  href,
  rewardAmount,
  risk = false,
}: {
  title: string;
  context: string;
  value: number;
  remaining: string;
  href: string;
  rewardAmount?: number;
  risk?: boolean;
}) {
  const reduce = useReducedMotion();
  return <motion.aside className={`v1053-mission-overlay ${risk ? "is-risk" : ""}`} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : .22, delay: reduce ? 0 : .34 }}>
    <span className="v1053-mission-kicker"><BookOpenCheck size={15}/> {risk ? "هدف الاستقرار" : "مهمتك الحالية"}</span>
    <h3>{title}</h3>
    <small>{context}</small>
    <div className="v1053-mission-progress"><Progress value={value}/><b dir="ltr">{value}%</b></div>
    <div className="v1053-mission-meta"><span>{remaining}</span>{rewardAmount ? <span className="v1053-mission-reward"><Gift size={13}/><bdi>{rewardAmount} ج.م</bdi></span> : null}</div>
    <Link href={href}>أكمل المهمة <ArrowLeft size={15}/></Link>
  </motion.aside>;
}
