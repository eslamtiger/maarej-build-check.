"use client";
import {LearningNavigation} from "../student-academic-hub";
import {studentDetailHref} from "@/lib/student-navigation";
import {StudentContextLink as Link} from "../student-context-link";
import { useRouter } from "next/navigation";
import { resolveStudentSource, studentAttendanceForReport } from "@/data/student-records";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, ArrowDownRight, Minus, ChevronLeft, X, GraduationCap, ListChecks, CalendarCheck, MessageCircle } from "lucide-react";
import { StudentV101Shell } from "@/components/student/StudentV101Shell";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { studentPerformancePeriods, formatPerformanceChange, formatPerformanceDate, type AcademicEvidence, type TaskEvidence, type PerformancePoint, type PerformanceTrend } from "@/data/student-performance-view";
import { performanceSourceRecords } from "@/data/student-performance-demo";
import styles from "./student-performance.module.css";
import { subjectStyle } from "../v2/student-v2";

function Trend({ trend, concise = false }: { trend?: PerformanceTrend; concise?: boolean }) {
  if (!trend) return null;
  const Icon = trend.value > 0 ? ArrowUpRight : trend.value < 0 ? ArrowDownRight : Minus;
  return <span className={styles.trend} data-direction={trend.value > 0 ? "up" : trend.value < 0 ? "down" : "flat"}><Icon size={17}/><b>{trend.value === 0 ? "ثابت" : formatPerformanceChange(trend.value)}</b>{!concise && <> · {trend.label}</>}</span>;
}
export function HistoryChart({ history, label, compact = false }: { history: readonly PerformancePoint[]; label: string; compact?: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  if (!history.length) return null;
  const min = Math.max(0, Math.min(...history.map(p => p.value)) - 5), max = Math.min(100, Math.max(...history.map(p => p.value)) + 5);
  const coordinates = history.map((p,i) => ({ x: 28 + i * 304 / Math.max(1,history.length-1), y: 130 - (p.value-min)/Math.max(1,max-min)*104 }));
  const index = selected !== null && selected < history.length ? selected : history.length-1;
  return <div className={`${styles.chart} ${compact ? styles.compactChart : ""}`}>
    <svg viewBox="0 0 360 170" role={compact ? "img" : "group"} aria-label={label}>
      <title>{label}</title><desc>{history.map(p => `${p.label}: ${p.value}%`).join("، ")}</desc>
      {[26,78,130].map(y => <line key={y} x1="24" x2="336" y1={y} y2={y} stroke="#E9E8F3" strokeDasharray="3 5"/>)}
      <polyline points={coordinates.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#4B3FD6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {coordinates.map((p,i) => <g key={i}><circle cx={p.x} cy={p.y} r={i===index ? 5 : 3} fill={i===index ? "#8A81F0" : "#4B3FD6"} stroke="white" strokeWidth="2"/>{!compact && <foreignObject x={p.x-27} y={p.y-27} width="54" height="54"><button type="button" className={styles.chartPoint} aria-pressed={i===index} onClick={() => setSelected(i)} aria-label={`${history[i].label}: ${history[i].value}%`}/></foreignObject>}</g>)}
    </svg>
    <div className={styles.chartDates} dir="ltr"><span>{history[0].label}</span><span>{history.at(-1)?.label}</span></div>
    {!compact && <p className={styles.chartValue} aria-live="polite">{history[index].label} · <strong>{history[index].value}%</strong></p>}

  </div>;
}
const dimensionIcons = { academic: GraduationCap, tasks: ListChecks, attendance: CalendarCheck, engagement: MessageCircle };
function AcademicDetails({ evidence, showRecords = true, onOpen }: { evidence: AcademicEvidence; showRecords?: boolean; onOpen: (target: string) => void }) {
  return <div className={styles.evidence}><div className={styles.evidenceCounts}><span><b>{evidence.assessmentCount}</b> اختبارات مسجلة</span><span>متوسط الدرجات <b>{evidence.average}%</b></span></div>{showRecords && <AssessmentRecords evidence={evidence} onOpen={onOpen}/>}</div>;
}
function AssessmentRecords({ evidence, onOpen }: { evidence: AcademicEvidence; onOpen: (target: string) => void }) {
  return <div className={styles.records}>{[...evidence.records].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3).map((record,index) => <button type="button" key={record.id} onClick={() => onOpen(record.navigationTarget)}><div><b>{record.title}</b><small>{index===0 ? "آخر اختبار · " : ""}{record.subjectName} · {formatPerformanceDate(record.date)}</small></div><strong dir="ltr">{record.score} / {record.maxScore}</strong><ChevronLeft size={16}/></button>)}</div>;
}
function TaskDetails({ evidence, onOpen, period }: { evidence: TaskEvidence; onOpen: (target: string) => void; period: string }) {
  return <div className={styles.evidence}><div className={styles.evidenceCounts}><span><b dir="ltr">{evidence.completed} / {evidence.total}</b> مهمة مكتملة خلال {period}</span><span><b>{evidence.pending}</b> قيد المتابعة</span><span><b>{evidence.late}</b> متأخرة</span></div><div className={styles.records}>{[...evidence.records].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3).map(record => <button type="button" key={record.id} onClick={() => onOpen(record.navigationTarget)}><div><b>{record.title}</b><small>{formatPerformanceDate(record.date)}</small></div><span data-state={record.state}>{record.state === "completed" ? "مكتملة" : record.state === "late" ? "متأخرة" : "قيد المتابعة"}</span><ChevronLeft size={16}/></button>)}</div></div>;
}
export function StudentPerformanceScreen() {
  const router=useRouter();
  const [periodId, setPeriodId] = useState(studentPerformancePeriods[0].id);
  const [detail, setDetail] = useState<string | null>(null);
  const [detailTrail, setDetailTrail] = useState<string[]>([]);
  function openEvidence(target: string) { const [,type,id]=target.split(":");const source=resolveStudentSource(type,id);if(source){router.push(studentDetailHref(source.href));return;} if (detail) setDetailTrail(trail => [...trail, detail]); setDetail(target); }
  function goBack() { setDetail(detailTrail.at(-1) ?? null); setDetailTrail(trail => trail.slice(0,-1)); }
  const sourceRecord = detail ? performanceSourceRecords.get(detail) : undefined;
  const view = studentPerformancePeriods.find(p => p.id === periodId) ?? studentPerformancePeriods[0];
  const subject = view.subjects.find(s => `subject:${s.subjectId}` === detail);
  const dimension = view.dimensions.find(d => `dimension:${d.id}` === detail);
  const attendance = dimension?.details?.attendance;
  const studentAttendance=studentAttendanceForReport(view.id);
  const evaluationDimensions = view.dimensions.filter(d => view.overall.evaluationDimensionIds.includes(d.id));
  const visibleDimensions = view.dimensions.filter(d => d.icon !== "engagement" || Boolean(d.sourceRecordIds?.length));
  return <StudentV101Shell active="learn"><div className={styles.page}>
    <header className={styles.header}><Link href="/student/learning" aria-label="العودة إلى تعلّمي"><ArrowRight size={21}/></Link><div><h1>أدائي</h1><p>تعلّمي ← أدائي</p></div></header>
    <LearningNavigation value="performance"/>
    <div className={styles.periods} role="group" aria-label="فترة الأداء">{view.periodOptions.map(p => <button key={p.id} type="button" aria-pressed={p.id === view.id} onClick={() => {setPeriodId(p.id);setDetail(null);setDetailTrail([]);}}>{p.label}</button>)}</div>
    <div className={styles.report}>
      <section className={styles.overall} aria-labelledby="overall-heading"><h2 id="overall-heading">{view.overall.label}</h2><strong dir="ltr">{view.overall.value}<small>{view.overall.unit}</small></strong><Trend trend={view.overall.trend} concise/><div className={styles.overallBreakdown}>{evaluationDimensions.map(d => <span key={d.id}>{d.label}</span>)}</div><button type="button" className={styles.evaluationAction} onClick={() => setDetail("overall")}>تفاصيل التقييم<ChevronLeft size={17}/></button></section>
      <section aria-labelledby="dimensions-heading"><h2 id="dimensions-heading">مكونات أدائك</h2><div className={styles.dimensions}>{visibleDimensions.map(d => {
        const Icon = dimensionIcons[d.icon];
        const contents = <><div className={styles.dimensionHeading}><Icon size={19}/><h3>{d.label}</h3>{d.details && <ChevronLeft size={16}/>}</div><strong>{d.value}%</strong><Trend trend={d.trend}/><small>{d.period}</small>{d.sourceSummary && <p>{d.sourceSummary}</p>}{d.status && <small>{d.status}</small>}</>;
        return d.details ? <button key={d.id} type="button" className={styles.dimension} data-kind={d.icon} onClick={() => setDetail(`dimension:${d.id}`)}>{contents}</button> : <div key={d.id} className={styles.dimension} data-kind={d.icon}>{contents}</div>;
      })}</div></section>
      <section className={styles.history}><h2>تطور أدائك</h2><p className={styles.context}>الاتجاه الحالي: <b>{(view.overall.trend?.value ?? 0) > 0 ? "تحسن" : (view.overall.trend?.value ?? 0) < 0 ? "تراجع" : "ثابت"}</b></p><Trend trend={view.overall.trend}/><p className={styles.context}>{view.period}</p><HistoryChart key={view.id} history={view.history} label={`تطور التقييم العام · ${view.period}`}/></section>
      <section className={styles.subjects}><h2>أداؤك حسب المادة</h2>{view.subjects.map(s => <button type="button" key={s.subjectId} className={styles.subject} style={subjectStyle(s.subjectId)} onClick={() => router.push(studentDetailHref(`/student/learning/subjects/${s.subjectId}?period=${view.id}`))}>
        <div><h3>{s.subjectName}</h3><Trend trend={{...s.trend,label:`خلال ${view.period}`}}/><div className={styles.subjectBreakdown}>{s.dimensions.slice(0,3).map(d => <span key={d.id}>{d.label} <b>{d.value}%</b></span>)}</div><div className={styles.meter}><i style={{width:`${s.currentValue}%`}} data-direction={s.trend.value < 0 ? "down" : s.trend.value === 0 ? "flat" : "up"}/></div></div><strong>{s.currentValue}%</strong><ChevronLeft size={18}/>
      </button>)}</section>
    </div>
    <Drawer open={detail !== null} onOpenChange={open => {if (!open) {setDetail(null);setDetailTrail([]);}}}><DrawerContent className={styles.drawer} dir="rtl"><DrawerClose className={styles.close} aria-label="إغلاق"><X size={20}/></DrawerClose><div className={styles.drawerScroll}>
      {detailTrail.length > 0 && <button type="button" className={styles.detailBack} onClick={goBack}><ArrowRight size={18}/>رجوع للتفاصيل</button>}<DrawerTitle>{sourceRecord ? sourceRecord.title : subject ? `مستواك في ${subject.subjectName}` : detail === "overall" ? "تفاصيل التقييم" : dimension?.label}</DrawerTitle><DrawerDescription>{sourceRecord ? `سجل تاريخي ضمن تقرير الأداء · ${view.period}` : view.period}</DrawerDescription>
      {sourceRecord && <><div className={styles.details}>{sourceRecord.fields.map(field => <div key={field.label}><h3>{field.label}</h3><p>{/^\d{4}-\d{2}-\d{2}/.test(field.value) ? formatPerformanceDate(field.value) : field.value}</p></div>)}</div>{sourceRecord.href && <Link className={styles.evaluationAction} href={sourceRecord.href}>فتح المجموعة<ChevronLeft size={17}/></Link>}</>}
      {detail === "overall" && <><p className={styles.context}>المؤشرات المستخدمة في التقييم</p><div className={styles.details}>{evaluationDimensions.map(d => <button type="button" key={d.id} className={styles.evaluationDimension} onClick={() => openEvidence(`dimension:${d.id}`)}><h3>{d.label}<ChevronLeft size={16}/></h3><strong>{d.value}%</strong>{d.sourceSummary && <p>{d.sourceSummary}</p>}{d.updatedAt && <small>آخر تحديث: {formatPerformanceDate(d.updatedAt)}</small>}</button>)}</div>{view.overall.updatedAt && <p className={styles.context}>آخر تحديث للتقييم: {formatPerformanceDate(view.overall.updatedAt)}</p>}</>}
      {subject && <><div className={styles.detailMetric}><strong>{subject.currentValue}%</strong><small>مستوى المادة المسجل</small><Trend trend={subject.trend}/></div><h3>تطور المادة عبر الزمن</h3><HistoryChart key={`${view.id}-${subject.subjectId}`} history={subject.history} label={`تطور أداء ${subject.subjectName}`}/><div className={styles.details}>
        {subject.academic && <div><h3>التحصيل الدراسي</h3><AcademicDetails evidence={subject.academic} showRecords={false} onOpen={openEvidence}/></div>}
        {subject.tasks && <div><h3>الواجبات والتكليفات</h3><TaskDetails evidence={subject.tasks} onOpen={openEvidence} period={view.period}/></div>}
        {subject.attendance && <div><h3>الحضور</h3><strong>{subject.attendance.rate}%</strong><p>{subject.attendance.present} حضور · {subject.attendance.absent} غياب{subject.attendance.late !== undefined && ` · ${subject.attendance.late} تأخير`}</p>{studentAttendance.filter(record=>record.subject===subject.subjectName).slice(-3).map(record => <button type="button" key={record.id} className={styles.evaluationAction} onClick={() => openEvidence(`source:attendance:${record.id}`)}>{formatPerformanceDate(record.date)} · {record.status}<ChevronLeft size={16}/></button>)}</div>}
        {!!subject.academic?.records.length && <div><h3>آخر الاختبارات والدرجات</h3><AssessmentRecords evidence={subject.academic} onOpen={openEvidence}/></div>}
        {subject.latestActivity && <div><h3>آخر نشاط</h3><p>{subject.latestActivity}</p></div>}
      </div></>}
      {dimension && <><div className={styles.detailMetric}><strong>{dimension.value}%</strong><Trend trend={dimension.trend}/><p>{dimension.details?.definition}</p>{dimension.sourceSummary && <p>{dimension.sourceSummary}</p>}</div>{dimension.details?.academic && <AcademicDetails evidence={dimension.details.academic} onOpen={openEvidence}/>} {dimension.details?.tasks && <TaskDetails evidence={dimension.details.tasks} onOpen={openEvidence} period={view.period}/>} {attendance && <div className={styles.attendanceCounts}><span><b>{attendance.present}</b> حضور</span><span><b>{attendance.absent}</b> غياب</span>{attendance.late !== undefined && <span><b>{attendance.late}</b> تأخير</span>}</div>}{attendance && studentAttendance.slice(-3).map(record => <button type="button" key={record.id} className={styles.evaluationAction} onClick={() => openEvidence(`source:attendance:${record.id}`)}>{record.subject} · {formatPerformanceDate(record.date)} · {record.status}<ChevronLeft size={16}/></button>)}{attendance && <Link href="/student/learning/attendance" className={styles.evaluationAction}>كل سجلات الحضور<ChevronLeft size={16}/></Link>}{dimension.details?.history && <HistoryChart key={`${view.id}-${dimension.id}`} history={dimension.details.history} label={`تطور ${dimension.label}`}/>}</>}
    </div></DrawerContent></Drawer>
  </div></StudentV101Shell>;
}
