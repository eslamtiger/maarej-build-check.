import {clockMinutes,initialStudentClock,isUpcoming} from "@/lib/student-clock";
export {cairoClock} from "@/lib/student-clock";
import { studentHomework, studentSchedule } from "@/data/student-records";
import { studentDemo } from "@/data/student-v101";
import { examIds, homeworkIds, scheduleEventsV103 } from "@/data/student-v103-view";
import { journeyActionData } from "@/components/journey/journey-action-data";
import { studentV102View } from "@/data/student-v102-view";
import { studentV106Demo } from "@/data/student-v106-demo";
import { availableIdentityText, type JourneyViewNode } from "@/components/journey/journey-identity-view";
import type { AchievementRecord } from "@/components/journey/journey-actions";
import type { SourceRecord } from "@/components/journey/journey-actions";

export type HomeAction = {
  id: string;
  kind: "session" | "homework" | "exam" | "mission";
  title: string;
  context?: string;
  time?: string;
  date?: string;
  status?: string;
  source?: SourceRecord;
  href?: string;
  missionId?: string;
};
export type HomeClock = { date: string; minutes: number };
export type HomeUpdate = { id?: string; title: string; context?: string; time?: string; source?: SourceRecord; sourceHref?: string };
export type HomeAchievement = AchievementRecord & { progress?: number };
const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
function achievementDate(value?: string | null) {
  if (!value) return undefined;
  const text = value.replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]), time: Date.parse(text) || 0 };
  const date = text.match(/^(\d{1,2})\s+(\S+)(?:\s+(\d{4}))?/);
  const month = date ? months.indexOf(date[2]) + 1 : 0;
  return date && month ? { year: date[3] ? Number(date[3]) : undefined, month, day: Number(date[1]), time: 0 } : undefined;
}
function newestAchievement(a: HomeAchievement, b: HomeAchievement) {
  const first = achievementDate(a.achievedAt), second = achievementDate(b.achievedAt);
  if (!first || !second) return Number(Boolean(second)) - Number(Boolean(first)) || a.id.localeCompare(b.id);
  return (first.year !== undefined && second.year !== undefined ? second.year - first.year : 0) || second.month - first.month || second.day - first.day || second.time - first.time || a.id.localeCompare(b.id);
}
export function selectHomeAchievement(records: readonly HomeAchievement[]) {
  const progressing = records.filter(record => record.state === "progress" || record.state === "inProgress");
  if (progressing.length) return [...progressing].sort((a, b) => (b.progress ?? -1) - (a.progress ?? -1) || newestAchievement(a, b))[0];
  return records.filter(record => record.state === "earned").sort(newestAchievement)[0];
}
export function homeJourneyPreview(view: { journeyNodes: readonly JourneyViewNode[]; currentStage: string | null }) {
  const index = view.journeyNodes.findIndex(node => node.state === "current");
  const currentNode = view.journeyNodes[index];
  const previous = index >= 0 ? view.journeyNodes.slice(0, index).findLast(node => node.state === "completed") : undefined;
  const next = index >= 0 ? view.journeyNodes.slice(index + 1).find(node => node.state === "next" || node.state === "challenge") : undefined;
  const current = currentNode ? { ...currentNode, label: availableIdentityText(currentNode.label) ?? "" } : undefined;
  const nextNode = next ? { ...next, label: availableIdentityText(next.label) ?? "" } : undefined;
  return { current, next: nextNode, nodes: [previous, current, nextNode] };
}
const scheduleSourceReferences: Readonly<Record<string, { id: string; type: SourceRecord["type"] }>> = {
  "homework-algebra": { id: homeworkIds["تدريبات الجبر · الدرس 4"], type: "homework" },
  "exam-physics-unit-2": { id: examIds["اختبار الوحدة الثانية"], type: "exam" },
};
// Demo adapter: all priority policy lives here and can be replaced by the backend
// view model without changing the Home UI. No identity or reward eligibility rules.
export function homeLaunchpadView(clock?: HomeClock | null, submittedIds: readonly string[] = []) {
  clock = clock ?? initialStudentClock;
  const homework: HomeAction[] = studentHomework
    .filter(item => !submittedIds.includes(item.id) && (item.status === "مطلوب" || item.status === "متأخر" || item.status === "قيد المتابعة"))
    .map(item => {
      const id = item.id;
      return { id, kind: "homework", title: item.title, context: item.subject, time: new Intl.DateTimeFormat("ar-EG-u-nu-latn",{hour:"numeric",minute:"2-digit",numberingSystem:"latn",timeZone:"Africa/Cairo"}).format(new Date(item.dueAt)), date:item.dueAt.slice(0,10), status: item.status,
        source: journeyActionData.sources.find(record => record.type === "homework" && record.id === id), href: item.href };
    });
  const upcoming: HomeAction[] = clock ? studentSchedule.filter(event => {
    return isUpcoming(event,clock!);
  }).map(event => ({ id: event.sourceId, kind: event.kind, title: event.title, context: event.meta, time: event.time, date: event.date, href: event.href,
    source: journeyActionData.sources.find(record => record.id === (event.sourceId) && record.type === (scheduleSourceReferences[event.id]?.type ?? event.kind)) ?? {
      id: event.id, type: event.kind, title: event.title, fields: [
        { label: "التاريخ", value: event.date }, { label: "الوقت", value: event.time },
        { label: "التفاصيل", value: event.meta }, { label: "الحدث", value: event.title },
      ],
    },
  })).sort((a, b) => `${a.date} ${String(clockMinutes(a.time ?? "") ?? 0).padStart(4, "0")}`.localeCompare(`${b.date} ${String(clockMinutes(b.time ?? "") ?? 0).padStart(4, "0")}`)) : [];
  const pending = homework.filter(item => item.status !== "متأخر");
  // Relative deadlines are retained verbatim from Learning; no invented countdown.
  const deadlineKey = (item: HomeAction) => {
    if (item.date) return `${item.date} ${String(clockMinutes(item.time ?? "") ?? 0).padStart(4, "0")}`;
    if (!clock) return "";
    const relative = item.time?.startsWith("اليوم") ? 0 : item.time?.startsWith("غدًا") ? 1 : undefined;
    if (relative === undefined) return "9999";
    const date = new Date(`${clock.date}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + relative);
    return `${date.toISOString().slice(0, 10)} ${String(clockMinutes(item.time ?? "") ?? 0).padStart(4, "0")}`;
  };
  const seen = new Set<string>();
  const candidates = [...upcoming, ...pending].filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    const minutes = clockMinutes(item.time ?? "");
    return !clock || !item.date || item.date > clock.date || (item.date === clock.date && (minutes === undefined || minutes >= clock.minutes));
  }).sort((a, b) => deadlineKey(a).localeCompare(deadlineKey(b)));
  // Compact coverage: the nearest record of each available activity type.
  const kinds = new Set<HomeAction["kind"]>();
  const timeline = candidates.filter(item => {
    if (kinds.has(item.kind)) return false;
    kinds.add(item.kind);
    return true;
  }).slice(0, 3);
  const mission = journeyActionData.missions.find(item => item.id === journeyActionData.currentMissionId);
  const nextAction = homework.find(item => item.status === "متأخر") ?? timeline[0] ?? pending[0] ?? (mission ? {
    id: mission.id, kind: "mission" as const, title: mission.title, context: mission.context, missionId: mission.id,
  } : undefined);
  const nextActionContext = nextAction ? [nextAction.context, nextAction.kind === "homework" && nextAction.status ? `واجب ${nextAction.status}` : nextAction.time].filter(Boolean).join(" · ") : undefined;
  const achievements = journeyActionData.achievements.map(record => ({ ...record, progress: studentV102View.badges[record.id as keyof typeof studentV102View.badges]?.progress }));
  const achievement = selectHomeAchievement(achievements);
  const earnedAchievement = selectHomeAchievement(achievements.filter(record => record.state === "earned"));
  const achievementPreview = [achievement, earnedAchievement].filter((record): record is HomeAchievement => Boolean(record)).filter((record, index, records) => records.findIndex(item => item.id === record.id) === index);
  const activities: HomeUpdate[] = [...studentV106Demo.activities].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).map(event => {
    const source = journeyActionData.sources.find(record => record.id === event.sourceId && record.type === event.sourceType);
    return { ...event, source, sourceHref: source?.href };
  });
  return { nextAction, nextActionContext, timeline, mission, achievement, achievements: achievementPreview, latestUpdate: activities[0], activities };
}
export type HomeLaunchpadViewModel = ReturnType<typeof homeLaunchpadView>;
