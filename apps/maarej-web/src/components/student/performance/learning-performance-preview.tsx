import Link from "next/link";
import { ChevronLeft, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { studentPerformanceView, formatPerformanceChange } from "@/data/student-performance-view";
import styles from "./learning-performance-preview.module.css";

export function LearningPerformancePreview() {
  const view = studentPerformanceView, trend = view.overallTrend;
  const Icon = trend && trend.value > 0 ? ArrowUpRight : trend && trend.value < 0 ? ArrowDownRight : Minus;
  return <Link href="/student/learning/performance" className={styles.preview} data-testid="learning-performance-preview">
    <div><span>أداؤك</span><strong dir="ltr">{view.overallMetric.value}{view.overallMetric.unit}</strong>{trend && <small><Icon size={15}/>{formatPerformanceChange(trend.value)}</small>}</div>
    <div><span>الحضور</span><strong>{view.attendance.rate}%</strong></div>
    <b>عرض أدائي <ChevronLeft size={17}/></b>
  </Link>;
}
