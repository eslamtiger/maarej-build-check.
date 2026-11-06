import { supabase } from "./supabase";
import { DAYS, hhmm, hhmmAr, monthStartIso, weekStartIso } from "./format";
import * as demo from "./demo";
import type {
  AssistantRow, AttendanceSheet, AttentionRow, AwardRow, BadgeDef, CenterOpt, Dashboard, Deadline, GroupCard, GroupDetail,
  InvoiceRow, LedgerRow, MemberRow, Result, RewardRow, SessionItem, StudentOpt,
} from "./types";

export const isDemo = () => typeof window !== "undefined" && window.sessionStorage.getItem("maarej_demo") === "1";
export const setDemo = (on: boolean) => (on ? window.sessionStorage.setItem("maarej_demo", "1") : window.sessionStorage.removeItem("maarej_demo"));
const DEMO_MSG = "ده وضع تجريبي، التعديلات مش بتتحفظ.";

const sb = () => {
  if (!supabase) throw new Error("الموقع مش متوصّل بالداتابيز (متغيرات Supabase ناقصة).");
  return supabase;
};
// supabase-js infers embedded rows as arrays without generated DB types, so rows are treated as loose JSON here.
const rows = (res: { data: any; error: { message: string } | null }): any[] => {
  if (res.error) throw new Error(res.error.message);
  return (res.data as any[] | null) ?? [];
};
async function act<T = void>(fn: () => Promise<T>): Promise<Result<T>> {
  if (isDemo()) return { ok: false, error: DEMO_MSG };
  try {
    return { ok: true, data: await fn() };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "حصلت مشكلة" };
  }
}
const uid = async () => {
  const { data } = await sb().auth.getUser();
  if (!data.user) throw new Error("لازم تسجّل دخول");
  return data.user.id;
};
const nameOf = (r: any) => r?.student?.profile?.full_name ?? "طالب";

const remaining = (i: { amount: number; paid_amount: number }) => Number(i.amount) - Number(i.paid_amount);
function effStatus(i: any): string {
  if (i.status === "paid" || i.status === "waived") return i.status;
  if (i.due_date && new Date(i.due_date + "T23:59:59") < new Date()) return "overdue";
  return i.status;
}
function scheduleText(list: { day_of_week: number; start_time: string }[]): string {
  if (!list.length) return "لسه مفيش ميعاد";
  const s = [...list].sort((a, b) => a.day_of_week - b.day_of_week);
  if (s.every((x) => x.start_time === s[0].start_time)) return `${s.map((x) => DAYS[x.day_of_week]).join(" و")} · ${hhmmAr(s[0].start_time)}`;
  return s.map((x) => `${DAYS[x.day_of_week]} ${hhmmAr(x.start_time)}`).join("، ");
}
const placeOf = (g: any) => (g.is_online ? "أونلاين" : [g.center?.name, g.room?.name].filter(Boolean).join(" · ") || "مكان غير محدد");

// ---------- Auth / profile ----------
export type Me = { id: string; role: string; name: string };
export async function loadMe(): Promise<Me | null> {
  if (isDemo()) return { id: "demo", role: "teacher", name: "أ. أحمد سالم" };
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  let { data: p } = await supabase.from("profiles").select("id,role,full_name").eq("id", user.id).maybeSingle();
  if (!p) {
    // First login after sign-up: create the profile from the sign-up metadata.
    const meta = user.user_metadata ?? {};
    const role = meta.role === "assistant" ? "assistant" : "teacher";
    const ins = await supabase.from("profiles").insert({ id: user.id, role, full_name: meta.full_name ?? "مدرس", phone: meta.phone ?? null }).select("id,role,full_name").single();
    if (ins.error) throw new Error(ins.error.message);
    if (role === "teacher") await supabase.from("teacher_profiles").insert({ user_id: user.id });
    p = ins.data;
  }
  return { id: p!.id, role: p!.role, name: p!.full_name };
}

// ---------- Dashboard ----------
export async function loadDashboard(): Promise<Dashboard> {
  if (isDemo()) return demo.demoDashboard();
  const s = sb();
  const now = new Date();
  const iso = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();
  const wk = weekStartIso(now);
  const mo = monthStartIso(now);
  const moEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);
  const me = await loadMe();

  const [groups, invoices, payments, sessions, hw, exams, att, missing, results, rewards, assist, wallet, awardsWeek] = await Promise.all([
    s.from("groups").select("id,name,subject,stage,is_online,capacity,price_per_session,status,center:centers(name),room:rooms(name),group_members(student_id,status,student:students(profile:profiles(full_name))),group_schedules(day_of_week,start_time,end_time)").eq("status", "active"),
    s.from("invoices").select("id,group_id,student_id,period_start,amount,paid_amount,status,due_date,student:students(profile:profiles(full_name))").gte("period_start", new Date(now.getTime() - 120 * 86400000).toISOString().slice(0, 10)),
    s.from("payments").select("amount,paid_at,invoice:invoices(group_id)").gte("paid_at", mo),
    s.from("sessions").select("id,group_id,starts_at,ends_at").neq("status", "cancelled").gte("starts_at", now.toISOString()).lte("starts_at", iso(7)).order("starts_at"),
    s.from("homework").select("id,title,due_at,group_id").gte("due_at", now.toISOString()).lte("due_at", iso(14)),
    s.from("exams").select("id,title,exam_date,group_id").gte("exam_date", now.toISOString()).lte("exam_date", iso(14)),
    s.from("attendance").select("status,student_id,session:sessions!inner(group_id,starts_at)").gte("session.starts_at", iso(-60)),
    s.from("homework_submissions").select("student_id,homework:homework!inner(group_id,due_at)").eq("status", "missing").lt("homework.due_at", now.toISOString()),
    s.from("exam_results").select("score,exam:exams!inner(group_id,max_score)").not("score", "is", null),
    s.from("rewards").select("amount").eq("status", "funded"),
    s.from("assistants").select("id,permissions,profile:profiles(full_name)"),
    s.rpc("my_wallet"),
    s.from("badge_awards").select("id", { count: "exact", head: true }).gte("created_at", wk),
  ]);
  const gRows = rows(groups), invRows = rows(invoices), payRows = rows(payments), sesRows = rows(sessions);
  const attRows = rows(att), missRows = rows(missing), resRows = rows(results);
  // Assistants have no wallet of their own; only the teacher does.
  const w = (wallet.error ? [] : rows(wallet as any))[0] as { id: string; balance: number } | undefined;

  const gName: Record<string, string> = {};
  const gPlace: Record<string, string> = {};
  gRows.forEach((g) => { gName[g.id] = g.name; gPlace[g.id] = placeOf(g); });

  const openInv = invRows.filter((i) => i.status !== "waived" && remaining(i) > 0);
  const weekPay = payRows.filter((p) => p.paid_at >= wk);

  const cards: GroupCard[] = gRows.map((g) => {
    const a = attRows.filter((r) => r.session?.group_id === g.id && r.status !== "excused");
    const present = a.filter((r) => r.status === "present" || r.status === "late").length;
    const sc = resRows.filter((r) => r.exam?.group_id === g.id).map((r) => (Number(r.score) / Number(r.exam.max_score)) * 100);
    const inv = openInv.filter((i) => i.group_id === g.id);
    return {
      id: g.id, name: g.name, subject: g.subject, stage: g.stage, place: placeOf(g), scheduleText: scheduleText(g.group_schedules ?? []),
      slots: (g.group_schedules ?? []).map((x: any) => ({ day: x.day_of_week, start: hhmm(x.start_time), end: hhmm(x.end_time) })),
      members: g.group_members.filter((m: any) => m.status === "accepted").length,
      pending: g.group_members.filter((m: any) => m.status === "requested").length,
      capacity: g.capacity, price: Number(g.price_per_session),
      attendanceRate: a.length ? (present / a.length) * 100 : null,
      avgScore: sc.length ? sc.reduce((x, y) => x + y, 0) / sc.length : null,
      unpaidCount: new Set(inv.map((i) => i.student_id)).size,
      outstanding: inv.reduce((x, i) => x + remaining(i), 0),
      weekRevenue: weekPay.filter((p) => p.invoice?.group_id === g.id).reduce((x, p) => x + Number(p.amount), 0),
    };
  });

  const toInvoice = (i: any): InvoiceRow => ({
    id: i.id, groupId: i.group_id, groupName: gName[i.group_id] ?? "", studentId: i.student_id, studentName: nameOf(i),
    periodStart: i.period_start, amount: Number(i.amount), paid: Number(i.paid_amount), status: effStatus(i), dueDate: i.due_date,
  });
  const unpaid = openInv.map(toInvoice).sort((a, b) => (a.status === "overdue" ? 0 : 1) - (b.status === "overdue" ? 0 : 1) || (a.dueDate ?? "").localeCompare(b.dueDate ?? "")).slice(0, 8);

  const studentName: Record<string, string> = {};
  gRows.forEach((g) => g.group_members.forEach((m: any) => (studentName[m.student_id] = m.student?.profile?.full_name ?? "طالب")));
  const attention: AttentionRow[] = [];
  gRows.forEach((g) => g.group_members.filter((m: any) => m.status === "accepted").forEach((m: any) => {
    const a = attRows.filter((r) => r.session?.group_id === g.id && r.student_id === m.student_id && r.status !== "excused");
    const rate = a.length >= 3 ? (a.filter((r) => r.status !== "absent").length / a.length) * 100 : null;
    const miss = missRows.filter((r) => r.homework?.group_id === g.id && r.student_id === m.student_id).length;
    const reasons = [rate !== null && rate < 70 ? `حضور ${Math.round(rate)}٪` : "", miss >= 2 ? `${miss} واجبات مش مسلّمة` : ""].filter(Boolean);
    if (reasons.length) attention.push({ studentId: m.student_id, studentName: studentName[m.student_id], groupName: g.name, reason: reasons.join(" · ") });
  }));

  const sessionsOut: SessionItem[] = sesRows.map((x) => ({ id: x.id, groupId: x.group_id, groupName: gName[x.group_id] ?? "", startsAt: x.starts_at, endsAt: x.ends_at, place: gPlace[x.group_id] ?? "" }));
  const deadlines: Deadline[] = [
    ...rows(hw).map((x) => ({ kind: "homework" as const, id: x.id, title: x.title, groupName: gName[x.group_id] ?? "", at: x.due_at })),
    ...rows(exams).map((x) => ({ kind: "exam" as const, id: x.id, title: x.title, groupName: gName[x.group_id] ?? "", at: x.exam_date })),
  ].sort((a, b) => a.at.localeCompare(b.at)).slice(0, 6);

  const rw = rows(rewards);
  const assistants: AssistantRow[] = rows(assist).map((a) => ({ id: a.id, name: a.profile?.full_name ?? "مساعد", permissions: a.permissions ?? [] }));

  let ledger: LedgerRow[] = [];
  if (w) ledger = await loadLedger(w.id, 8);

  return {
    teacherName: me?.name ?? "",
    walletBalance: Number(w?.balance ?? 0),
    weekRevenue: weekPay.reduce((x, p) => x + Number(p.amount), 0),
    monthRevenue: payRows.reduce((x, p) => x + Number(p.amount), 0),
    monthExpected: invRows.filter((i) => i.period_start >= mo.slice(0, 10) && i.period_start < moEnd && i.status !== "waived").reduce((x, i) => x + Number(i.amount), 0),
    outstanding: openInv.reduce((x, i) => x + remaining(i), 0),
    unpaidStudents: new Set(openInv.map((i) => i.student_id)).size,
    groups: cards, sessions: sessionsOut, deadlines, unpaid, attention: attention.slice(0, 6),
    badgesThisWeek: awardsWeek.count ?? 0, rewardsHeldCount: rw.length, rewardsHeldAmount: rw.reduce((x, r) => x + Number(r.amount), 0),
    assistants, ledger,
  };
}

const KIND: Record<string, string> = { top_up: "شحن رصيد", transfer: "تحويل", payment: "دفعة طالب", commission: "عمولة", room_fee: "إيجار قاعة", reward_funding: "تمويل مكافأة", reward_release: "صرف مكافأة" };
async function loadLedger(walletId: string, limit: number): Promise<LedgerRow[]> {
  const t = rows(await sb().from("transfers").select("id,amount,kind,note,created_at,to_wallet_id").order("created_at", { ascending: false }).limit(limit));
  return t.map((x) => {
    const incoming = x.to_wallet_id === walletId;
    const base = KIND[x.kind] ?? x.kind;
    const label = x.kind === "transfer" ? (incoming ? "تحويل وارد" : "تحويل صادر") : base;
    return { id: x.id, at: x.created_at, label: x.note ? `${label} · ${x.note}` : label, amount: incoming ? Number(x.amount) : -Number(x.amount) };
  });
}

// ---------- Groups ----------
export type NewGroup = { name: string; subject: string; stage: string; capacity: number; price: number; isOnline: boolean; schedule: { day: number; start: string; end: string }[] };
export const createGroup = (g: NewGroup) => act(async () => {
  const s = sb();
  const teacher = await uid();
  const { data, error } = await s.from("groups").insert({ teacher_id: teacher, name: g.name, subject: g.subject, stage: g.stage || null, capacity: g.capacity, price_per_session: g.price, is_online: g.isOnline }).select("id").single();
  if (error) throw new Error(error.message);
  if (g.schedule.length) {
    const r = await s.from("group_schedules").insert(g.schedule.map((x) => ({ group_id: data.id, day_of_week: x.day, start_time: x.start, end_time: x.end })));
    if (r.error) throw new Error(r.error.message);
  }
  return data.id as string;
});

export async function loadGroup(id: string): Promise<GroupDetail> {
  if (isDemo()) return demo.demoGroup(id);
  const s = sb();
  const now = new Date().toISOString();
  const [g, mem, past, hw, ex, inv, sch] = await Promise.all([
    s.from("groups").select("id,name,subject,stage,is_online,capacity,price_per_session,center:centers(name),room:rooms(name)").eq("id", id).single(),
    s.from("group_members").select("student_id,status,student:students(profile:profiles(full_name))").eq("group_id", id),
    s.from("sessions").select("id,starts_at").eq("group_id", id).neq("status", "cancelled").lte("starts_at", now).order("starts_at", { ascending: false }).limit(6),
    s.from("homework").select("id").eq("group_id", id).order("due_at", { ascending: false }).limit(1),
    s.from("exams").select("id,max_score").eq("group_id", id).order("exam_date", { ascending: false }).limit(1),
    s.from("invoices").select("id,student_id,amount,paid_amount,status,period_start").eq("group_id", id).order("period_start", { ascending: false }),
    s.from("group_schedules").select("id,day_of_week,start_time,end_time").eq("group_id", id),
  ]);
  if (g.error) throw new Error(g.error.message);
  const sessionIds = rows(past).map((x) => x.id);
  const [attRes, subRes, resRes] = await Promise.all([
    sessionIds.length ? s.from("attendance").select("session_id,student_id,status").in("session_id", sessionIds) : Promise.resolve({ data: [], error: null }),
    rows(hw)[0] ? s.from("homework_submissions").select("student_id,status").eq("homework_id", rows(hw)[0].id) : Promise.resolve({ data: [], error: null }),
    rows(ex)[0] ? s.from("exam_results").select("student_id,score").eq("exam_id", rows(ex)[0].id) : Promise.resolve({ data: [], error: null }),
  ]);
  const att = rows(attRes as any), subs = rows(subRes as any), res = rows(resRes as any), invs = rows(inv);
  const ordered = [...rows(past)].reverse();
  const memRows = rows(mem);
  const members: MemberRow[] = memRows.filter((m) => m.status === "accepted").map((m) => {
    const latest = invs.find((i) => i.student_id === m.student_id);
    const score = res.find((r) => r.student_id === m.student_id)?.score;
    return {
      studentId: m.student_id, name: nameOf(m), status: m.status,
      dots: ordered.map((ss) => (att.find((a) => a.session_id === ss.id && a.student_id === m.student_id)?.status ?? "none")),
      homework: subs.find((x) => x.student_id === m.student_id)?.status ?? "none",
      lastScore: score != null ? `${Number(score)} / ${Number(rows(ex)[0].max_score)}` : "—",
      invoice: latest ? { id: latest.id, status: effStatus(latest), remaining: remaining(latest) } : null,
    };
  });
  const gr = g.data as any;
  return {
    group: {
      id: gr.id, name: gr.name, subject: gr.subject, stage: gr.stage, place: placeOf(gr), scheduleText: scheduleText(rows(sch).map((x) => ({ day_of_week: x.day_of_week, start_time: x.start_time }))),
      slots: rows(sch).map((x) => ({ day: x.day_of_week, start: hhmm(x.start_time), end: hhmm(x.end_time) })),
      members: members.length, pending: 0, capacity: gr.capacity, price: Number(gr.price_per_session), attendanceRate: null, avgScore: null, unpaidCount: 0, outstanding: 0, weekRevenue: 0,
    },
    members,
    requests: memRows.filter((m) => m.status === "requested").map((m) => ({ studentId: m.student_id, name: nameOf(m) })),
    schedule: rows(sch).map((x) => ({ id: x.id, day: x.day_of_week, start: hhmm(x.start_time), end: hhmm(x.end_time) })),
  };
}
export const respondMember = (groupId: string, studentId: string, status: "accepted" | "refused") => act(async () => {
  const r = await sb().from("group_members").update({ status }).eq("group_id", groupId).eq("student_id", studentId);
  if (r.error) throw new Error(r.error.message);
});
export const addScheduleRow = (groupId: string, day: number, start: string, end: string) => act(async () => {
  const r = await sb().from("group_schedules").insert({ group_id: groupId, day_of_week: day, start_time: start, end_time: end });
  if (r.error) throw new Error(r.error.message);
});
export const removeScheduleRow = (id: string) => act(async () => {
  const r = await sb().from("group_schedules").delete().eq("id", id);
  if (r.error) throw new Error(r.error.message);
});
export const makeSessions = (groupId: string, from: string, to: string) => act(async () => {
  const r = await sb().rpc("generate_sessions", { p_group_id: groupId, p_from: from, p_to: to });
  if (r.error) throw new Error(r.error.message);
  return r.data as number;
});
export const makeInvoices = (groupId: string, month: string) => act(async () => {
  const r = await sb().rpc("generate_invoices", { p_group_id: groupId, p_month: month });
  if (r.error) throw new Error(r.error.message);
  return r.data as number;
});
export const createHomework = (groupId: string, title: string, dueAt: string) => act(async () => {
  const r = await sb().from("homework").insert({ group_id: groupId, title, due_at: new Date(dueAt).toISOString(), created_by: await uid() });
  if (r.error) throw new Error(r.error.message);
});
export const createExam = (groupId: string, title: string, date: string, max: number) => act(async () => {
  const r = await sb().from("exams").insert({ group_id: groupId, title, exam_date: new Date(date).toISOString(), max_score: max });
  if (r.error) throw new Error(r.error.message);
});

// ---------- Attendance ----------
export async function listSessions(): Promise<SessionItem[]> {
  if (isDemo()) return demo.demoDashboard().sessions;
  const s = sb();
  const from = new Date(Date.now() - 7 * 86400000).toISOString();
  const to = new Date(Date.now() + 2 * 86400000).toISOString();
  const [ses, gr] = await Promise.all([s.from("sessions").select("id,group_id,starts_at,ends_at").neq("status", "cancelled").gte("starts_at", from).lte("starts_at", to).order("starts_at", { ascending: false }), s.from("groups").select("id,name")]);
  const names: Record<string, string> = {};
  rows(gr).forEach((g) => (names[g.id] = g.name));
  return rows(ses).map((x) => ({ id: x.id, groupId: x.group_id, groupName: names[x.group_id] ?? "", startsAt: x.starts_at, endsAt: x.ends_at, place: "" }));
}
export async function loadSheet(sessionId: string): Promise<AttendanceSheet> {
  if (isDemo()) return demo.demoSheet();
  const s = sb();
  const ses = await s.from("sessions").select("id,group_id,starts_at,group:groups(name)").eq("id", sessionId).single();
  if (ses.error) throw new Error(ses.error.message);
  const [mem, att] = await Promise.all([
    s.from("group_members").select("student_id,student:students(profile:profiles(full_name))").eq("group_id", (ses.data as any).group_id).eq("status", "accepted"),
    s.from("attendance").select("student_id,status").eq("session_id", sessionId),
  ]);
  const a = rows(att);
  return {
    sessionId, groupName: (ses.data as any).group?.name ?? "", startsAt: (ses.data as any).starts_at,
    rows: rows(mem).map((m) => ({ studentId: m.student_id, name: nameOf(m), status: a.find((x) => x.student_id === m.student_id)?.status ?? null })),
  };
}
export const markAttendance = (sessionId: string, studentId: string, status: string) => act(async () => {
  const s = sb();
  const r = await s.from("attendance").upsert({ session_id: sessionId, student_id: studentId, status, marked_by: await uid(), marked_at: new Date().toISOString() });
  if (r.error) throw new Error(r.error.message);
  await s.from("sessions").update({ status: "held" }).eq("id", sessionId).eq("status", "scheduled");
});

// ---------- Payments ----------
export async function loadInvoices(): Promise<InvoiceRow[]> {
  if (isDemo()) return demo.demoInvoices();
  const s = sb();
  const [inv, gr] = await Promise.all([
    s.from("invoices").select("id,group_id,student_id,period_start,amount,paid_amount,status,due_date,student:students(profile:profiles(full_name))").gte("period_start", new Date(Date.now() - 150 * 86400000).toISOString().slice(0, 10)).order("period_start", { ascending: false }),
    s.from("groups").select("id,name"),
  ]);
  const names: Record<string, string> = {};
  rows(gr).forEach((g) => (names[g.id] = g.name));
  return rows(inv).map((i) => ({ id: i.id, groupId: i.group_id, groupName: names[i.group_id] ?? "", studentId: i.student_id, studentName: nameOf(i), periodStart: i.period_start, amount: Number(i.amount), paid: Number(i.paid_amount), status: effStatus(i), dueDate: i.due_date }));
}
export const recordPayment = (invoiceId: string, amount: number, method: string) => act(async () => {
  const r = await sb().rpc("record_payment", { p_invoice_id: invoiceId, p_amount: amount, p_method: method });
  if (r.error) throw new Error(r.error.message);
});

// ---------- Badges & rewards ----------
export async function loadBadges(): Promise<{ defs: BadgeDef[]; awards: AwardRow[]; rewards: RewardRow[]; students: StudentOpt[] }> {
  if (isDemo()) return { defs: demo.demoBadges(), awards: demo.demoAwards(), rewards: demo.demoRewards(), students: demo.demoStudents() };
  const s = sb();
  const [defs, awards, rewards, mem] = await Promise.all([
    s.from("badge_definitions").select("id,name,icon,description,issuer_type").eq("is_active", true).order("created_at"),
    s.from("badge_awards").select("id,note,created_at,badge:badge_definitions(name),student:students(profile:profiles(full_name))").order("created_at", { ascending: false }).limit(15),
    s.from("rewards").select("id,amount,title,condition,status,student:students(profile:profiles(full_name))").order("created_at", { ascending: false }).limit(20),
    s.from("group_members").select("student_id,group:groups(name),student:students(profile:profiles(full_name))").eq("status", "accepted"),
  ]);
  return {
    defs: rows(defs).map((d) => ({ id: d.id, name: d.name, icon: d.icon, description: d.description, issuer: d.issuer_type })),
    awards: rows(awards).map((a) => ({ id: a.id, badge: a.badge?.name ?? "", student: nameOf(a), at: a.created_at, note: a.note })),
    rewards: rows(rewards).map((r) => ({ id: r.id, student: nameOf(r), amount: Number(r.amount), title: r.title, condition: r.condition, status: r.status })),
    students: rows(mem).map((m) => ({ id: m.student_id, name: nameOf(m), group: (m as any).group?.name ?? "" })),
  };
}
export const createBadge = (name: string, icon: string, description: string) => act(async () => {
  const me = await uid();
  const r = await sb().from("badge_definitions").insert({ issuer_type: "teacher", issuer_id: me, name, icon, description: description || null });
  if (r.error) throw new Error(r.error.message);
});
export const awardBadge = (badgeId: string, studentId: string, note: string, bonus: number, condition: string) => act(async () => {
  const r = await sb().rpc("award_badge", { p_badge_id: badgeId, p_student_id: studentId, p_session_id: null, p_note: note || null, p_bonus: bonus, p_reward_title: null, p_reward_condition: condition || null });
  if (r.error) throw new Error(r.error.message);
});
export const releaseReward = (id: string) => act(async () => {
  const r = await sb().rpc("release_reward", { p_reward_id: id });
  if (r.error) throw new Error(r.error.message);
});

// ---------- Wallet ----------
export async function loadWallet(): Promise<{ balance: number; ledger: LedgerRow[]; centers: CenterOpt[]; students: StudentOpt[] }> {
  if (isDemo()) return { balance: demo.demoDashboard().walletBalance, ledger: demo.demoDashboard().ledger, centers: demo.demoCenters(), students: demo.demoStudents() };
  const s = sb();
  const [w, centers, mem] = await Promise.all([
    s.rpc("my_wallet"),
    s.from("centers").select("id,name"),
    s.from("group_members").select("student_id,group:groups(name),student:students(profile:profiles(full_name))").eq("status", "accepted"),
  ]);
  const wal = rows(w as any)[0] as { id: string; balance: number };
  return {
    balance: Number(wal?.balance ?? 0),
    ledger: wal ? await loadLedger(wal.id, 40) : [],
    centers: rows(centers).map((c) => ({ id: c.id, name: c.name })),
    students: rows(mem).map((m) => ({ id: m.student_id, name: nameOf(m), group: (m as any).group?.name ?? "" })),
  };
}
export const sendFunds = (toType: "student" | "center", toId: string, amount: number, kind: string, note: string) => act(async () => {
  const r = await sb().rpc("send_funds", { p_to_type: toType, p_to_id: toId, p_amount: amount, p_kind: kind, p_note: note || null, p_from_center: null });
  if (r.error) throw new Error(r.error.message);
});

// ---------- Assistants ----------
export const addAssistant = (phone: string, permissions: string[]) => act(async () => {
  const r = await sb().rpc("add_assistant_by_phone", { p_phone: phone, p_permissions: permissions });
  if (r.error) throw new Error(r.error.message);
});
export const removeAssistant = (id: string) => act(async () => {
  const r = await sb().from("assistants").delete().eq("id", id);
  if (r.error) throw new Error(r.error.message);
});
