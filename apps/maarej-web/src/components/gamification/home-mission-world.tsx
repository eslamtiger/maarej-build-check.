"use client";

import Link from "next/link";
import { ArrowLeft, BookOpenCheck, CalendarClock, Check, LockKeyhole, Target } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { StudentIdentityView } from "@/data/student-v105-identity-view";
import { Progress } from "@/components/ui/progress";
import { IdentityEmblem, type IdentityVisualConfig } from "./identity-emblem";
import { IdentityStatus } from "./identity-status";

const miniPath = "M22 74 C84 36 132 42 177 67 C221 91 278 80 338 40";

export function HomeMissionWorld({ view, visual, studentName, missionTitle, missionContext, missionValue }: { view: StudentIdentityView; visual: IdentityVisualConfig; studentName: string; missionTitle: string; missionContext: string; missionValue: number }) {
  const reduce = useReducedMotion();
  return <section className={`v1052-home-hero state-${view.status}`}>
    <span className="v1052-home-geometry geometry-a"/><span className="v1052-home-geometry geometry-b"/>
    <div className="v1052-home-heading">
      <small>صباح الخير يا {studentName}</small>
      <div className="v1052-home-identity-line"><span>هويتك الحالية</span><IdentityStatus view={view}/></div>
      <h1>{view.currentIdentity?.name ?? "هوية غير محددة"}</h1>
      <p>{view.currentDirection ?? "التوجه غير محدد"}</p>
    </div>
    <div className="v1052-home-emblem"><IdentityEmblem config={visual} status={view.status} size={84}/></div>

    <div className="v1052-home-roadmap" aria-label="موقعك الحالي والخطوة التالية">
      <svg viewBox="0 0 360 105" aria-hidden="true">
        <defs><linearGradient id="v1052HomePath" x1="0" x2="1"><stop offset="0" stopColor={visual.primaryAccent}/><stop offset="1" stopColor={visual.secondaryAccent}/></linearGradient></defs>
        <path d={miniPath} fill="none" stroke="rgba(255,255,255,.20)" strokeWidth="6" strokeLinecap="round"/>
        <motion.path d={miniPath} fill="none" stroke="url(#v1052HomePath)" strokeWidth="6" strokeLinecap="round" initial={reduce ? { pathLength: .56 } : { pathLength: 0 }} animate={{ pathLength: .56 }} transition={{ duration: reduce ? 0 : .72 }}/>
      </svg>
      <span className="v1052-home-node completed"><Check size={15}/><small>تم</small></span>
      <span className="v1052-home-node current"><Target size={18}/><small>أنت هنا</small></span>
      <span className="v1052-home-node next"><LockKeyhole size={14}/><small>التالي</small></span>
    </div>

    <div className="v1052-home-objective">
      <div className="v1052-objective-kicker"><BookOpenCheck size={16}/><span>مهمتك الحالية</span></div>
      <h2>{missionTitle}</h2>
      <p>{missionContext}</p>
      <div className="v1052-objective-progress"><Progress value={missionValue}/><b>{missionValue}%</b></div>
      <div className="v1052-objective-actions"><Link href="/student/learning#homework">ابدأ المهمة <ArrowLeft size={15}/></Link><Link href="/student/journey#identity">عرض رحلتي</Link></div>
    </div>
    <div className="v1052-next-cue"><CalendarClock size={15}/><span>الخطوة التالية</span><b>{view.nextMilestone ?? "تابع تقدمك"}</b></div>
  </section>;
}
