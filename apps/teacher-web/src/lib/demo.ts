import type { AttendanceSheet, AwardRow, BadgeDef, CenterOpt, Dashboard, GroupDetail, InvoiceRow, MemberRow, RewardRow, StudentOpt } from "./types";

// Sample data for demo mode only (?demo from the login page). Never written to the database.
const at = (days: number, h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const demoDashboard = (): Dashboard => ({
  teacherName: "أ. أحمد سالم",
  walletBalance: 4250,
  weekRevenue: 3150,
  monthRevenue: 9720,
  monthExpected: 14850,
  outstanding: 5130,
  unpaidStudents: 7,
  groups: [
    { id: "g1", name: "مجموعة التفوق", subject: "رياضيات", stage: "ثانوي", place: "سنتر النخبة · قاعة 2", scheduleText: "الأحد والثلاثاء · 4:30 م", members: 14, capacity: 20, attendanceRate: 92, avgScore: 84, unpaidCount: 3, outstanding: 2430, weekRevenue: 1620, price: 90, pending: 2, slots: [{ day: 0, start: "16:30", end: "18:00" }, { day: 2, start: "16:30", end: "18:00" }] },
    { id: "g2", name: "أساسيات الفيزياء", subject: "فيزياء", stage: "إعدادي", place: "أونلاين", scheduleText: "الأحد · 7:00 م", members: 9, capacity: 15, attendanceRate: 88, avgScore: 78, unpaidCount: 3, outstanding: 1800, weekRevenue: 900, price: 100, pending: 0, slots: [{ day: 0, start: "19:00", end: "20:00" }] },
    { id: "g3", name: "لغة وتعبير", subject: "عربي", stage: "ابتدائي", place: "سنتر النخبة · قاعة 1", scheduleText: "الاثنين · 5:00 م", members: 12, capacity: 20, attendanceRate: 95, avgScore: 88, unpaidCount: 1, outstanding: 900, weekRevenue: 630, price: 70, pending: 1, slots: [{ day: 1, start: "17:00", end: "18:15" }] },
  ],
  sessions: [
    { id: "s1", groupId: "g1", groupName: "مجموعة التفوق", startsAt: at(0, 16, 30), endsAt: at(0, 18), place: "سنتر النخبة · قاعة 2" },
    { id: "s2", groupId: "g2", groupName: "أساسيات الفيزياء", startsAt: at(0, 19), endsAt: at(0, 20), place: "أونلاين" },
    { id: "s3", groupId: "g3", groupName: "لغة وتعبير", startsAt: at(1, 17), endsAt: at(1, 18, 15), place: "سنتر النخبة · قاعة 1" },
    { id: "s4", groupId: "g1", groupName: "مجموعة التفوق", startsAt: at(2, 16, 30), endsAt: at(2, 18), place: "سنتر النخبة · قاعة 2" },
  ],
  deadlines: [
    { kind: "homework", id: "h1", title: "واجب الجبر · الدرس 4", groupName: "مجموعة التفوق", at: at(1, 21) },
    { kind: "exam", id: "e1", title: "اختبار الحركة", groupName: "أساسيات الفيزياء", at: at(3, 18) },
    { kind: "homework", id: "h2", title: "تعبير: وصف مكان", groupName: "لغة وتعبير", at: at(4, 20) },
    { kind: "exam", id: "e2", title: "امتحان شهري", groupName: "مجموعة التفوق", at: at(9, 16, 30) },
  ],
  unpaid: [
    { id: "i1", groupId: "g1", groupName: "مجموعة التفوق", studentId: "st3", studentName: "عمر سامي", periodStart: at(-3, 0), amount: 810, paid: 0, status: "overdue", dueDate: at(-4, 0) },
    { id: "i2", groupId: "g1", groupName: "مجموعة التفوق", studentId: "st5", studentName: "كريم عادل", periodStart: at(-3, 0), amount: 810, paid: 400, status: "partial", dueDate: at(-1, 0) },
    { id: "i3", groupId: "g2", groupName: "أساسيات الفيزياء", studentId: "st6", studentName: "مريم خالد", periodStart: at(-3, 0), amount: 600, paid: 0, status: "due", dueDate: at(2, 0) },
    { id: "i4", groupId: "g3", groupName: "لغة وتعبير", studentId: "st7", studentName: "سلمى ناصر", periodStart: at(-3, 0), amount: 420, paid: 0, status: "due", dueDate: at(3, 0) },
  ],
  attention: [
    { studentId: "st3", studentName: "عمر سامي", groupName: "مجموعة التفوق", reason: "حضور 50٪ وواجب مش مسلّم" },
    { studentId: "st6", studentName: "مريم خالد", groupName: "أساسيات الفيزياء", reason: "غابت حصتين ورا بعض" },
    { studentId: "st5", studentName: "كريم عادل", groupName: "مجموعة التفوق", reason: "واجبين متأخرين" },
  ],
  badgesThisWeek: 6,
  rewardsHeldCount: 3,
  rewardsHeldAmount: 450,
  assistants: [{ id: "a1", name: "منى إبراهيم", permissions: ["attendance", "payments"] }],
  ledger: [
    { id: "l1", at: at(0, 12), label: "دفعة طالب", amount: 405 },
    { id: "l2", at: at(-1, 17), label: "دفعة طالب", amount: 810 },
    { id: "l3", at: at(-1, 18), label: "تمويل مكافأة", amount: -100 },
    { id: "l4", at: at(-2, 15), label: "إيجار قاعة", amount: -300 },
    { id: "l5", at: at(-3, 11), label: "دفعة طالب", amount: 600 },
  ],
});

const m = (studentId: string, name: string, dots: MemberRow["dots"], homework: MemberRow["homework"], lastScore: string, inv: MemberRow["invoice"]): MemberRow => ({ studentId, name, status: "accepted", dots, homework, lastScore, invoice: inv });
export const demoGroup = (id: string): GroupDetail => {
  const d = demoDashboard();
  const group = d.groups.find((g) => g.id === id) ?? d.groups[0];
  return {
    group,
    members: [
      m("st1", "يوسف أحمد", ["present", "present", "present", "absent", "present", "present"], "submitted", "٨ / ١٠", { id: "x", status: "paid", remaining: 0 }),
      m("st2", "ليلى مصطفى", ["present", "present", "present", "present", "present", "present"], "late", "٩ / ١٠", { id: "x", status: "paid", remaining: 0 }),
      m("st3", "عمر سامي", ["present", "absent", "absent", "present", "absent", "present"], "missing", "٥ / ١٠", { id: "i1", status: "overdue", remaining: 810 }),
      m("st4", "نور حسن", ["present", "present", "present", "present", "absent", "present"], "submitted", "٧ / ١٠", { id: "x", status: "paid", remaining: 0 }),
      m("st5", "كريم عادل", ["present", "present", "absent", "present", "present", "absent"], "late", "٦ / ١٠", { id: "i2", status: "partial", remaining: 410 }),
    ],
    requests: group.pending ? [{ studentId: "r1", name: "آدم محمود" }, { studentId: "r2", name: "هنا وائل" }].slice(0, group.pending) : [],
    schedule: [{ id: "sc1", day: 0, start: "16:30", end: "18:00" }, { id: "sc2", day: 2, start: "16:30", end: "18:00" }],
  };
};

export const demoInvoices = (): InvoiceRow[] => [
  ...demoDashboard().unpaid,
  { id: "i5", groupId: "g1", groupName: "مجموعة التفوق", studentId: "st1", studentName: "يوسف أحمد", periodStart: at(-3, 0), amount: 810, paid: 810, status: "paid", dueDate: at(-4, 0) },
  { id: "i6", groupId: "g1", groupName: "مجموعة التفوق", studentId: "st2", studentName: "ليلى مصطفى", periodStart: at(-3, 0), amount: 810, paid: 810, status: "paid", dueDate: at(-4, 0) },
  { id: "i7", groupId: "g3", groupName: "لغة وتعبير", studentId: "st8", studentName: "جنى أشرف", periodStart: at(-3, 0), amount: 420, paid: 420, status: "paid", dueDate: at(-4, 0) },
];

export const demoBadges = (): BadgeDef[] => [
  { id: "b1", name: "ملتزم", icon: "shield", description: "حضور منتظم ومتابعة للواجبات", issuer: "system" },
  { id: "b2", name: "مفكر الحصة", icon: "lightbulb", description: "مشاركة مميزة وتفكير حلو في الحصة", issuer: "system" },
  { id: "b3", name: "مبادر", icon: "rocket", description: "بيبدأ من نفسه ويعمل أكتر من المطلوب", issuer: "system" },
  { id: "b4", name: "متعاون", icon: "award", description: "بيساعد زمايله ويشتغل في جماعة", issuer: "system" },
  { id: "b5", name: "بطل الواجب", icon: "star", description: "٥ واجبات في ميعادها ورا بعض", issuer: "teacher" },
];
export const demoAwards = (): AwardRow[] => [
  { id: "w1", badge: "مفكر الحصة", student: "ليلى مصطفى", at: at(0, 17), note: "حل مسألة بطريقة مختلفة" },
  { id: "w2", badge: "ملتزم", student: "يوسف أحمد", at: at(-1, 17), note: null },
];
export const demoRewards = (): RewardRow[] => [
  { id: "r1", student: "ليلى مصطفى", amount: 200, title: "مكافأة انتظام الحضور", condition: "حضور 90٪ حتى آخر الشهر", status: "funded" },
  { id: "r2", student: "يوسف أحمد", amount: 100, title: "مفكر الحصة", condition: null, status: "funded" },
  { id: "r3", student: "نور حسن", amount: 150, title: "بطل الواجب", condition: null, status: "released" },
];
export const demoStudents = (): StudentOpt[] => demoGroup("g1").members.map((x) => ({ id: x.studentId, name: x.name, group: "مجموعة التفوق" }));
export const demoCenters = (): CenterOpt[] => [{ id: "c1", name: "سنتر النخبة" }];
export const demoSheet = (): AttendanceSheet => ({
  sessionId: "s1", groupName: "مجموعة التفوق", startsAt: at(0, 16, 30),
  rows: demoGroup("g1").members.map((x, i) => ({ studentId: x.studentId, name: x.name, status: i === 0 ? "present" : null })),
});
