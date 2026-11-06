export type GroupCard = {
  id: string; name: string; subject: string; stage: string | null; place: string; scheduleText: string;
  members: number; capacity: number; attendanceRate: number | null; avgScore: number | null;
  unpaidCount: number; outstanding: number; weekRevenue: number; price: number; pending: number;
  slots: { day: number; start: string; end: string }[];
};
export type SessionItem = { id: string; groupId: string; groupName: string; startsAt: string; endsAt: string; place: string };
export type Deadline = { kind: "homework" | "exam"; id: string; title: string; groupName: string; at: string };
export type InvoiceRow = {
  id: string; groupId: string; groupName: string; studentId: string; studentName: string;
  periodStart: string; amount: number; paid: number; status: string; dueDate: string | null;
};
export type AttentionRow = { studentId: string; studentName: string; groupName: string; reason: string };
export type LedgerRow = { id: string; at: string; label: string; amount: number };
export type Dashboard = {
  teacherName: string; walletBalance: number;
  weekRevenue: number; monthRevenue: number; monthExpected: number; outstanding: number; unpaidStudents: number;
  groups: GroupCard[]; sessions: SessionItem[]; deadlines: Deadline[]; unpaid: InvoiceRow[]; attention: AttentionRow[];
  badgesThisWeek: number; rewardsHeldCount: number; rewardsHeldAmount: number;
  assistants: AssistantRow[]; ledger: LedgerRow[];
};
export type AssistantRow = { id: string; name: string; permissions: string[] };
export type MemberRow = {
  studentId: string; name: string; status: string; dots: ("present" | "absent" | "late" | "excused" | "none")[];
  homework: "submitted" | "late" | "missing" | "reviewed" | "none"; lastScore: string; invoice: { id: string; status: string; remaining: number } | null;
};
export type GroupDetail = { group: GroupCard; members: MemberRow[]; requests: { studentId: string; name: string }[]; schedule: { id: string; day: number; start: string; end: string }[] };
export type BadgeDef = { id: string; name: string; icon: string; description: string | null; issuer: string };
export type AwardRow = { id: string; badge: string; student: string; at: string; note: string | null };
export type RewardRow = { id: string; student: string; amount: number; title: string; condition: string | null; status: string };
export type StudentOpt = { id: string; name: string; group: string };
export type AttendanceSheet = { sessionId: string; groupName: string; startsAt: string; rows: { studentId: string; name: string; status: string | null }[] };
export type CenterOpt = { id: string; name: string };
export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };
