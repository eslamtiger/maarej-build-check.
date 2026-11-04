import { studentHomework, studentExams, studentSessions, studentTransactions, resolveStudentSource } from "@/data/student-records";
import { studentDemo } from "@/data/student-v101";
import { examIds, homeworkIds, scheduleEventsV103 } from "@/data/student-v103-view";
import type { JourneyActionData, SourceRecord } from "./journey-actions";
import { studentV106Demo } from "@/data/student-v106-demo";

// Route-local references to existing records. No source is inferred from titles,
// subject, or attendance percentage. The paired Journey mission/reward is explicit.
export const journeyActionData: JourneyActionData = {
  currentMissionId: "current-mission",
  missions: [{ id: "current-mission", ...studentDemo.journey.mission, ...studentV106Demo.missionSource, rewardId: "attendance" }],
  rewards: [{ id: "attendance", ...studentDemo.journey.reward, releaseCondition: studentV106Demo.rewardReleaseCondition }],
  sources: [
    ...studentHomework.map(h=>({id:h.id,type:"homework" as const,title:h.title,href:h.href,actionLabel:"فتح الواجب",fields:[{label:"المادة",value:h.subject},{label:"موعد التسليم",value:h.due??""},{label:"الحالة",value:h.status}]})),
    ...studentExams.map(e=>({id:e.id,type:"exam" as const,title:e.title,href:e.href,actionLabel:"فتح الاختبار",fields:[{label:"المادة",value:e.subject},{label:"التاريخ",value:e.date},{label:"الحالة",value:e.status}]})),
    ...studentSessions.map(s=>({id:s.id,type:"session" as const,title:s.title,href:s.href,actionLabel:"فتح الحصة",fields:[{label:"التاريخ",value:s.date},{label:"الوقت",value:s.time},{label:"المكان",value:s.place},{label:"الحضور",value:s.attendanceStatus}]})),
    ...studentTransactions.map(t=>({id:t.id,type:"payment" as const,title:t.title,href:t.href,actionLabel:"تفاصيل العملية",fields:[{label:"المبلغ",value:`${t.amount} ج.م`},{label:"الحالة",value:t.status},{label:"المرجع",value:t.reference}]})),
    {id:"achievement-thinker",type:"achievement",title:studentDemo.journey.badges[1].name,href:resolveStudentSource("achievement","thinker")!.href,actionLabel:"تفاصيل الإنجاز",fields:[{label:"المعنى",value:studentDemo.journey.badges[1].meaning}]},
  ] satisfies SourceRecord[],
  achievements: studentDemo.journey.badges.map(badge => ({
    id: badge.name, name: badge.name, reason: badge.meaning, source: badge.source,
    evidence: [badge.meta], achievedAt: badge.earnedDate, state: badge.state,
  })),
};
