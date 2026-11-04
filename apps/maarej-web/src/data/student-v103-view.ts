import { studentDemo as d } from "./student-v101";

export type StudentType = "dependent" | "independent";
export type FundingSource = "parent" | "self";

export const qaDefaults = {
  studentType: "dependent" as StudentType,
  fundingSource: "parent" as FundingSource,
};

export const groupIds = {
  "مجموعة التفوق": "math-excellence",
  "أساسيات الفيزياء": "physics-basics",
  "لغة وتعبير": "arabic-expression",
} as const;

export const teacherIds = {
  "أ. أحمد سالم": "ahmed-salem",
  "أ. خالد محمود": "khaled-mahmoud",
  "أ. منى عادل": "mona-adel",
} as const;

export const homeworkIds = {
  "تدريبات الجبر · الدرس 4": "algebra-practice-4",
  "ورقة مسائل الحركة": "motion-problems",
  "تعبير: أثر القراءة": "reading-expression",
  "مراجعة المعادلات": "equations-review",
  "ورقة تطبيقات الحركة": "motion-applications",
} as const;

export const examIds = {
  "اختبار الوحدة الثانية": "physics-unit-2",
  "اختبار الجبر القصير": "algebra-short",
} as const;

export const groupById = Object.fromEntries(
  d.learning.groups.map((group) => [groupIds[group.name as keyof typeof groupIds], group]),
) as Record<string, (typeof d.learning.groups)[number]>;

export const teacherById = Object.fromEntries(
  d.learning.teachers.map((teacher) => [teacherIds[teacher.name as keyof typeof teacherIds], teacher]),
) as Record<string, (typeof d.learning.teachers)[number]>;

export const groupForSubject = (subject: string) => d.learning.groups.find((group) => group.subject === subject) ?? null;

export const scheduleEventsV103 = [
  { ...d.schedule.events[0], date: "2026-10-03", kind: "session" as const, href: `/student/learning/groups/${groupIds["مجموعة التفوق"]}` },
  { ...d.schedule.events[1], date: "2026-10-02", kind: "homework" as const, href: "/student/learning#homework" },
  { ...d.schedule.events[2], date: "2026-10-03", kind: "homework" as const, href: "/student/learning#exams" },
  {
    id: "exam-physics-unit-2",
    date: "2026-10-04",
    time: d.learning.exams.upcoming[0].time,
    type: "اختبار",
    tone: "amber",
    kind: "exam" as const,
    title: `${d.learning.exams.upcoming[0].subject} · ${d.learning.exams.upcoming[0].name}`,
    meta: "اختبار الوحدة الثانية",
    detail: "موعد الاختبار القادم كما هو مسجل في بيانات الطالب.",
    cta: "عرض الاختبارات",
    href: "/student/learning#exams",
  },
  {
    id: "session-physics",
    date: "2026-10-04",
    time: "7:00 م",
    type: "حصة",
    tone: "blue",
    kind: "session" as const,
    title: "فيزياء · أساسيات الفيزياء",
    meta: "أ. خالد محمود · أونلاين",
    detail: "الحصة القادمة للمجموعة كما هي مسجلة في بيانات الطالب.",
    cta: "فتح المجموعة",
    href: `/student/learning/groups/${groupIds["أساسيات الفيزياء"]}`,
  },
  {
    id: "session-arabic",
    date: "2026-10-05",
    time: "5:00 م",
    type: "حصة",
    tone: "blue",
    kind: "session" as const,
    title: "اللغة العربية · لغة وتعبير",
    meta: "أ. منى عادل · سنتر النخبة",
    detail: "الحصة القادمة للمجموعة كما هي مسجلة في بيانات الطالب.",
    cta: "فتح المجموعة",
    href: `/student/learning/groups/${groupIds["لغة وتعبير"]}`,
  },
  ...[ {id:"session-math-next",date:"2026-10-06",time:"4:30 م",title:"رياضيات · مجموعة التفوق",meta:"أ. أحمد سالم · سنتر النخبة",href:"/student/learning/groups/math-excellence"}, {id:"session-physics-next",date:"2026-10-07",time:"7:00 م",title:"فيزياء · أساسيات الفيزياء",meta:"أ. خالد محمود · أونلاين",href:"/student/learning/groups/physics-basics"}, {id:"session-arabic-next",date:"2026-10-08",time:"5:00 م",title:"اللغة العربية · لغة وتعبير",meta:"أ. منى عادل · سنتر النخبة",href:"/student/learning/groups/arabic-expression"} ].map(s=>({...s,type:"حصة",tone:"blue",kind:"session" as const,detail:"الحصة المجدولة للمجموعة",cta:"فتح الحصة"})),

] as const;

export const v103BuildVersion = "V1.04 — Signature Visual Identity + Motion System";
