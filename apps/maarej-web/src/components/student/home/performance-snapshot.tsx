"use client";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, BookOpenCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { formatPerformanceChange, type PerformanceSnapshot } from "@/data/student-performance-view";
import styles from "./student-home.module.css";

export function PerformanceStrip({ snapshot, link = true, progressiveDisclosure = true }: { snapshot: PerformanceSnapshot; link?: boolean; progressiveDisclosure?: boolean }) {
  const reduce = useReducedMotion();
  const points = snapshot.series;
  const min = points?.length ? Math.min(...points) : 0, max = points?.length ? Math.max(...points) : 0;
  const chart = points && points.length > 1 ? points.map((value, i) => `${i * 150 / (points.length - 1)},${38 - (value - min) / (max - min || 1) * 30}`).join(" ") : null;
  const showAttendance = snapshot.attendanceRate !== undefined || snapshot.attendancePresent !== undefined || snapshot.attendanceAbsent !== undefined;
  const content = <>
    <div className={styles.sectionHeading}><h2 id="home-performance-heading">لمحة عن أدائك</h2>{link && <span className={styles.performanceCta}>عرض أدائي <ChevronLeft size={14}/></span>}</div>
    <div className={styles.performanceStrip} style={!showAttendance ? { gridTemplateColumns: "1fr" } : undefined}>
      <div className={styles.primaryMetric}><span className={styles.metricIcon}><BookOpenCheck size={19}/></span><small>{snapshot.primaryMetric}</small><strong dir="ltr">{snapshot.primaryValue}</strong><p>{snapshot.period}</p>
        {snapshot.trend && <span className={styles.trend}><ArrowUpRight size={15}/>{formatPerformanceChange(snapshot.trend.value)} · {snapshot.trend.label}</span>}
        {chart && <svg viewBox="0 0 150 44" className={styles.miniChart} role="img" aria-label={`تغير ${snapshot.primaryMetric} خلال ${snapshot.period ?? "الفترة المتاحة"}`}><motion.polyline points={chart} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: .5 }}/></svg>}
      </div>
      {showAttendance && <div className={styles.attendance}><small>الحضور</small><div className={styles.attendanceValue}>
        {snapshot.attendanceRate !== undefined && <><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="#CEE7E1" strokeWidth="5"/><circle cx="32" cy="32" r="26" fill="none" stroke="#278A67" strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray={`${Math.max(0, Math.min(100, snapshot.attendanceRate))} 100`} transform="rotate(-90 32 32)"/></svg><strong>{snapshot.attendanceRate}<small>%</small></strong></>}
        </div>{snapshot.attendancePresent !== undefined || snapshot.attendanceAbsent !== undefined ? <p>{snapshot.attendancePresent !== undefined && `${snapshot.attendancePresent} حضور`}{snapshot.attendancePresent !== undefined && snapshot.attendanceAbsent !== undefined && " · "}{snapshot.attendanceAbsent !== undefined && `${snapshot.attendanceAbsent} غياب`}{snapshot.attendanceLate !== undefined && ` · ${snapshot.attendanceLate} تأخير`}</p> : <p>انتظامك في الحضور</p>}
      </div>}
    </div>
  </>;
  return <section className={styles.performance} aria-labelledby="home-performance-heading">{link ? <Link href="/student/learning/performance" className={styles.performanceLink}>{content}</Link> : content}</section>;
}
