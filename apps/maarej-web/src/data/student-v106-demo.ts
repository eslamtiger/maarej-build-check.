import { studentPerformanceSnapshot } from "./student-performance-view";

// Evaluation fixtures only: reported scores and relations, not scoring formulas,
// identity eligibility thresholds or final progression rules.
export const studentV106Demo = {
  referenceClock: { date: "2026-10-04", minutes: 640 },
  performance: studentPerformanceSnapshot,
  missionSource: { sourceType: "attendanceTarget" as const, sourceId: "session-math" },
  rewardReleaseCondition: "يُراجع حضور نهاية الشهر، ثم تُصرف المكافأة بعد تأكيد ولي الأمر.",
  activities: [
    { id: "activity-payment", title: "تم تأكيد دفع مجموعة الرياضيات", context: "مجموعة التفوق", time: "منذ 20 دقيقة", occurredAt: "2026-10-02T06:10:00+03:00", sourceId: "payment-math", sourceType: "payment" as const },
    { id: "activity-teacher", title: "أ. أحمد أضاف تعليمات واجب الجبر", context: "تدريبات الجبر · الدرس 4", time: "منذ ساعة", occurredAt: "2026-10-02T05:30:00+03:00", sourceId: "algebra-practice-4", sourceType: "homework" as const },
    { id: "activity-achievement", title: "وصلت إلى إنجاز مفكر الحصة", context: "مشاركة مميزة في الرياضيات", time: "أمس", occurredAt: "2026-10-01T17:30:00+03:00", sourceId: "achievement-thinker", sourceType: "achievement" as const },
  ],
};
