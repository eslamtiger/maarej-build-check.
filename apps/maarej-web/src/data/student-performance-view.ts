import { performanceDemoPeriods } from "./student-performance-demo";
export type PerformancePoint = { label: string; value: number };
export type PerformanceTrend = { value: number; label: string };
export type EvidenceSourceReference = { sourceType: "exam" | "homework" | "assignment" | "session" | "attendance" | "teacherFeedback" | "interaction"; sourceId: string; navigationTarget: string };
export type PerformanceSourceRecord = { id: string; sourceType: EvidenceSourceReference["sourceType"]; title: string; fields: readonly { label: string; value: string }[]; href?: string };
export type EngagementEvidence = { records: readonly (EvidenceSourceReference & { id: string; kind: "teacherFeedback" | "classParticipation" | "interaction"; title: string; date: string; feedback?: string })[] };
export type AttendanceRecord = EvidenceSourceReference & { id: string; title: string; date: string; status: string };
export type AssessmentRecord = EvidenceSourceReference & { id: string; title: string; subjectName: string; score: number; maxScore: number; date: string };
export type TaskRecord = EvidenceSourceReference & { id: string; title: string; state: "completed" | "pending" | "late"; date: string };
export type AcademicEvidence = { assessmentCount: number; average: number; records: readonly AssessmentRecord[] };
export type TaskEvidence = { completed: number; total: number; pending: number; late: number; records: readonly TaskRecord[] };
export type AttendancePerformance = { rate: number; present: number; absent: number; late?: number; history?: readonly PerformancePoint[]; trend?: PerformanceTrend; records?: readonly AttendanceRecord[] };
export type PerformanceDimension = {
  id: string; label: string; value: number; trend?: PerformanceTrend; period: string;
  updatedAt?: string; sourceRecordIds?: readonly string[]; status?: string; sourceSummary?: string; icon: "academic" | "tasks" | "attendance" | "engagement";
  details?: { definition: string; history?: readonly PerformancePoint[]; attendance?: AttendancePerformance; academic?: AcademicEvidence; tasks?: TaskEvidence; engagement?: EngagementEvidence };
};
export type SubjectPerformance = {
  subjectId: string; subjectName: string; currentValue: number; trend: PerformanceTrend;
  history: readonly PerformancePoint[];
  dimensions: readonly { id: string; label: string; value: number; sourceSummary?: string }[];
  academic?: AcademicEvidence; tasks?: TaskEvidence; attendance?: AttendancePerformance;
  homeworkSummary?: string; examSummary?: string; attendanceSummary?: string; latestActivity?: string;
};
export type PerformanceViewModel = {
  id: string; period: string; overallMetric: { name: string; value: number; unit: string };
  overall: { label: string; value: number; unit: string; trend?: PerformanceTrend; period: string; evaluationDimensionIds: readonly string[]; updatedAt?: string };
  dimensions: readonly PerformanceDimension[];
  periodOptions: readonly { id: string; label: string }[];
  overallTrend?: PerformanceTrend; history: readonly PerformancePoint[];
  attendance: AttendancePerformance;
  subjects: readonly SubjectPerformance[];
};
export type PerformanceSnapshot = {
  primaryMetric: string; primaryValue: string; trend?: PerformanceTrend; period?: string;
  series?: readonly number[]; attendanceRate?: number; attendancePresent?: number; attendanceAbsent?: number; attendanceLate?: number;
};
export const studentPerformancePeriods: readonly PerformanceViewModel[] = performanceDemoPeriods;
export const studentPerformanceView = studentPerformancePeriods[0];
// Home and the full report consume the same reported results; no score formula.
export function performanceSnapshot(view: PerformanceViewModel): PerformanceSnapshot {
  return { primaryMetric: view.overallMetric.name, primaryValue: `${view.overall.value}${view.overall.unit}`,
    trend: view.overall.trend, period: view.overall.period, series: view.history.map(point => point.value),
    attendanceRate: view.attendance.rate, attendancePresent: view.attendance.present, attendanceAbsent: view.attendance.absent, attendanceLate:view.attendance.late };
}
export const studentPerformanceSnapshot = performanceSnapshot(studentPerformanceView);

// Differences between percentage scores are percentage points, not relative %.
export function formatPerformanceChange(value: number) {
  const amount = Math.abs(value);
  return `${amount} ${Number.isInteger(amount) && amount >= 3 && amount <= 10 ? "نقاط" : "نقطة"}`;
}

export function formatPerformanceDate(date: string) {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day:"numeric", month:"long", year:"numeric", numberingSystem:"latn", timeZone:"UTC" }).format(new Date(date));
}
