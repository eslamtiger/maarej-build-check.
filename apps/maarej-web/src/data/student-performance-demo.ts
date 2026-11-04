import { studentDemo } from "./student-v101";
import { homeworkIds, examIds, scheduleEventsV103 } from "./student-v103-view";
import type { PerformancePoint, PerformanceViewModel, SubjectPerformance, PerformanceDimension, AssessmentRecord, TaskRecord, PerformanceSourceRecord } from "./student-performance-view";
// Evaluation-only reported metrics. These fixtures define no scoring or identity rules.
const dates = ["21 أغسطس", "28 أغسطس", "4 سبتمبر", "11 سبتمبر", "18 سبتمبر", "25 سبتمبر", "2 أكتوبر"];
const points = (values: readonly number[], labels = dates): PerformancePoint[] => values.map((value, i) => ({ value, label: labels[i] }));
const subjects: SubjectPerformance[] = [
  { subjectId: "math", subjectName: "رياضيات", currentValue: 88, trend: { value: 6, label: "تحسن خلال الفترة" }, history: points([82,83,84,84,86,87,88]), dimensions: [{id:"academic",label:"التحصيل",value:90},{id:"tasks",label:"المهام",value:88},{id:"attendance",label:"الحضور",value:100}], homeworkSummary: "7 من 8 واجبات مكتملة · واجب واحد قيد المتابعة", examSummary: "آخر اختبار: المعادلات · 18 / 20", attendanceSummary: "8 حضور · دون غياب", latestActivity: "مراجعة المعادلات بواسطة المدرس · 1 أكتوبر" },
  { subjectId: "physics", subjectName: "فيزياء", currentValue: 76, trend: { value: -3, label: "تراجع خلال الفترة" }, history: points([79,80,78,79,77,77,76]), dimensions: [{id:"academic",label:"التحصيل",value:75},{id:"tasks",label:"المهام",value:67},{id:"attendance",label:"الحضور",value:83}], homeworkSummary: "4 من 6 واجبات مكتملة · واجبان قيد المتابعة", examSummary: "آخر اختبار: الحركة · 15 / 20", attendanceSummary: "4 حضور · 1 غياب · 1 تأخير", latestActivity: "تعليق المدرس على تطبيقات الحركة · 2 أكتوبر" },
  { subjectId: "arabic", subjectName: "لغة عربية", currentValue: 90, trend: { value: 0, label: "مستوى ثابت خلال الفترة" }, history: points([90,89,90,91,90,90,90]), dimensions: [{id:"academic",label:"التحصيل",value:90},{id:"tasks",label:"المهام",value:100},{id:"attendance",label:"الحضور",value:83}], homeworkSummary: "6 من 6 واجبات مكتملة", examSummary: "آخر اختبار: التعبير · 18 / 20", attendanceSummary: "5 حضور · 1 غياب", latestActivity: "مراجعة واجب التعبير · 30 سبتمبر" },
  { subjectId: "english", subjectName: "إنجليزي", currentValue: 84, trend: { value: 4, label: "تحسن خلال الفترة" }, history: points([80,80,81,82,82,83,84]), dimensions: [{id:"academic",label:"التحصيل",value:85},{id:"tasks",label:"المهام",value:83},{id:"attendance",label:"الحضور",value:100}], homeworkSummary: "5 من 6 واجبات مكتملة", examSummary: "آخر اختبار: القراءة · 17 / 20", attendanceSummary: "5 حضور · دون غياب", latestActivity: "إكمال نشاط القراءة · 1 أكتوبر" },
];
const base = { overallMetric: { name: "أداؤك التعليمي", value: 86, unit: "%" }, subjects };
const reportedPeriods = [
  { ...base, id: "six-weeks", period: "آخر 6 أسابيع", overallTrend: { value: 18, label: "تحسن خلال آخر 6 أسابيع" }, history: points([68,72,75,79,81,84,86]), attendance: { rate: 92, present: 22, absent: 2, late: 1, history: points([84,86,88,88,90,90,92]) } },
  { ...base, id: "four-weeks", period: "آخر 4 أسابيع", overallTrend: { value: 11, label: "تحسن خلال آخر 4 أسابيع" }, history: points([75,77,79,81,82,84,86],["4 سبتمبر","9 سبتمبر","13 سبتمبر","18 سبتمبر","22 سبتمبر","27 سبتمبر","2 أكتوبر"]), attendance: { rate: 90, present: 18, absent: 2, late: 1, history: points([86,86,88,88,90,90,90],["4 سبتمبر","9 سبتمبر","13 سبتمبر","18 سبتمبر","22 سبتمبر","27 سبتمبر","2 أكتوبر"]) }, subjects: subjects.map((s,i) => ({ ...s, homeworkSummary: ["5 من 6 واجبات مكتملة","3 من 4 واجبات مكتملة","4 من 4 واجبات مكتملة","3 من 4 واجبات مكتملة"][i], attendanceSummary: ["6 حضور · دون غياب","4 حضور · 1 غياب","4 حضور · 1 غياب","5 حضور · دون غياب"][i], history: s.history.slice(2), trend: { ...s.trend, label: "التغير خلال الفترة", value: s.currentValue - s.history[2].value } })) },
  { ...base, id: "week", period: "هذا الأسبوع", overallTrend: { value: 2, label: "تحسن خلال هذا الأسبوع" }, history: points([84,84,85,85,86,85,86],["26 سبتمبر","27 سبتمبر","28 سبتمبر","29 سبتمبر","30 سبتمبر","1 أكتوبر","2 أكتوبر"]), attendance: { rate: 100, present: 4, absent: 0, late: 0, history: points([100,100,100,100],["27 سبتمبر","28 سبتمبر","30 سبتمبر","1 أكتوبر"]) }, subjects: subjects.map((s,i) => ({ ...s, homeworkSummary: i===1 ? "0 من 1 واجب مكتمل" : "1 من 1 واجب مكتمل", examSummary: undefined, attendanceSummary: "1 حضور · دون غياب", history: s.history.slice(-2).map((point,i) => ({ ...point, label: i===0 ? "26 سبتمبر" : "2 أكتوبر" })), trend: { ...s.trend, label: "التغير خلال الفترة", value: s.currentValue - s.history.at(-2)!.value } })) },
];

const periodOptions = reportedPeriods.map(p => ({ id: p.id, label: p.period }));
const dimensionFixtures = [
  { academic: 88, tasks: 82, trends: [6,3,8,5], histories: [[82,83,84,85,86,87,88],[79,79,80,80,81,81,82],[80,80,81,82,83,84,85]] },
  { academic: 88, tasks: 80, trends: [4,2,4,3], histories: [[84,85,85,86,87,87,88],[78,78,79,79,80,80,80],[81,81,82,82,83,83,84]] },
  { academic: 88, tasks: 75, trends: [1,-5,0,1], histories: [[87,87,88,88,88,88,88],[80,80,78,78,76,75,75],[84,84,84,85,85,85,85]] },
];
// Source records for evaluation only. Dates and report values are fixture data.
const assessmentTitles = [["الجبر القصير","المعادلات","تطبيقات الدوال"],["الحركة","القوى","الطاقة"],["التعبير","النحو","القراءة"],["القراءة","القواعد","المحادثة"]];
const assessmentScores = [[18,18,18],[15,16,14],[18,19,17],[17,16,18]];
const assessmentDates = ["2026-09-12","2026-09-23","2026-10-01"];
const assessmentRecords: AssessmentRecord[] = subjects.flatMap((s,i) => assessmentTitles[i].map((title,j) => {
  const existing = i===0 && j===0 ? studentDemo.learning.exams.previous[0] : undefined;
  const sourceId = existing ? examIds[existing.name] : `${s.subjectId}-assessment-${j}`;
  const score = existing?.score.split("/").map(Number);
  return {id:sourceId,title:existing?.name ?? title,subjectName:s.subjectName,score:score?.[0] ?? assessmentScores[i][j],maxScore:score?.[1] ?? 20,date:existing ? "2026-09-24" : assessmentDates[j],sourceType:"exam",sourceId,navigationTarget:`source:exam:${sourceId}`};
}));
const taskCounts = [
  [[7,8,1,0],[4,6,1,1],[6,6,0,0],[5,6,1,0]],
  [[5,6,1,0],[3,4,0,1],[4,4,0,0],[3,4,1,0]],
  [[1,1,0,0],[0,1,0,1],[1,1,0,0],[1,1,0,0]],
];
// Attendance rates retain the reported metric; display counts partition present/absent/late.
const attendanceCounts = [[[8,0],[5,1],[5,1],[5,0]],[[7,0],[4,1],[4,1],[4,0]],[[1,0],[1,0],[1,0],[1,0]]];

const taskTitles = ["تدريبات الجبر","ورقة تطبيقات الحركة","واجب التعبير","نشاط القراءة"];
const sourceTasks = [studentDemo.learning.homework[0],studentDemo.learning.homework[4],studentDemo.learning.homework[2]];
function taskRecord(subjectIndex: number, periodIndex: number, previous = false): TaskRecord {
  const existing = subjectIndex === 0 && (periodIndex===2 || previous) ? studentDemo.learning.homework[3] : !previous ? sourceTasks[subjectIndex] : undefined;
  const title = existing?.title ?? (previous ? `تدريبات ${subjects[subjectIndex].subjectName}` : taskTitles[subjectIndex]);
  const sourceId = existing ? homeworkIds[existing.title] : `${subjects[subjectIndex].subjectId}-task-${previous ? "previous" : "current"}`;
  const state = existing ? existing.status === "متأخر" ? "late" : existing.status === "مطلوب" ? "pending" : "completed" : subjectIndex===3 && periodIndex!==2 && previous ? "pending" : "completed";
  return {id:sourceId,title,state,date:previous?"2026-09-28":"2026-10-01",sourceType:"homework",sourceId,navigationTarget:`source:homework:${sourceId}`};
}
const sessionEvidence = scheduleEventsV103.filter(s=>s.kind==="session").map(s=>({id:s.id,title:s.title,date:s.date,status:"حضور",sourceType:"session" as const,sourceId:s.id,navigationTarget:`source:session:${s.id}`}));
const academicAverage = (records: readonly AssessmentRecord[]) => Math.round(records.reduce((sum,r)=>sum + r.score/r.maxScore*100,0)/records.length);

// Historical analytics evidence only. Never insert these fixtures into operational collections.
const allTasksBySubject = subjects.map((subject,i) => {
  const first={...taskRecord(i,0),date:i===0?"2026-09-25":"2026-10-01"};
  const previous={...taskRecord(i,0,true),date:i===0?"2026-10-01":i===3?"2026-09-25":"2026-09-12"};
  const rows:TaskRecord[]=[first,previous];
  if(i===1)rows.push({id:"motion-problems",title:studentDemo.learning.homework[1].title,state:"pending",date:"2026-09-25",sourceType:"homework",sourceId:"motion-problems",navigationTarget:"source:homework:motion-problems"});
  const target=taskCounts[0][i][0];const excluded=[2,1,2,2][i];
  let n=0;while(rows.filter(t=>t.state==="completed").length<target){const id=`${subject.subjectId}-completed-${++n}`;rows.push({id,title:`${subject.subjectName} · تدريبات ${n}`,state:"completed",date:n<=excluded?`2026-09-0${n}`:`2026-09-${String(8+n).padStart(2,"0")}`,sourceType:"homework",sourceId:id,navigationTarget:`source:homework:${id}`});}
  return rows.sort((a,b)=>a.date.localeCompare(b.date));
});
// Overall is independently reported. Evidence never defines or implies weights.
export const performanceDemoPeriods: PerformanceViewModel[] = reportedPeriods.map((report, index) => {
  const fixture = dimensionFixtures[index];
  const labels = report.history.map(p => p.label);
  const attendance = { ...report.attendance, records:sessionEvidence, trend: { value: fixture.trends[2], label: fixture.trends[2] === 0 ? "ثابت خلال الفترة" : "التغير خلال الفترة" } };
  const periodRecords = assessmentRecords.filter(record => index !== 2 || record.date >= "2026-09-26");
  const academic = { assessmentCount:periodRecords.length, average:academicAverage(periodRecords), records:periodRecords };
  const periodTasks = allTasksBySubject.map(rows=>rows.filter(t=>t.date >= (index===2?"2026-09-26":index===1?"2026-09-04":"2026-08-21")));
  const taskRecords = periodTasks.flat();
  const tasks = {completed:taskRecords.filter(t=>t.state==="completed").length,total:taskRecords.length,pending:taskRecords.filter(t=>t.state==="pending").length,late:taskRecords.filter(t=>t.state==="late").length,records:taskRecords};
  const taskRate = Math.round(tasks.completed/tasks.total*100);
  const updatedAt = "2026-10-02T18:00:00Z";
  const dimensions: PerformanceDimension[] = [
    { id:"academic", label:"التحصيل الدراسي", value:academic.average, trend:{value:academic.average-fixture.histories[0][0],label:"التغير خلال الفترة"}, period:report.period, icon:"academic", updatedAt, sourceSummary:`${academic.assessmentCount} اختبارات مسجلة`, details:{definition:"نتائج الاختبارات والدرجات الأكاديمية المتاحة.",academic,history:points([...fixture.histories[0].slice(0,-1),academic.average],labels)} },
    { id:"tasks", label:"الالتزام بالمهام", value:taskRate, trend:{value:taskRate-fixture.histories[1][0],label:"التغير خلال الفترة"}, period:report.period, icon:"tasks", updatedAt, sourceSummary:`${tasks.completed} من ${tasks.total} مهمة خلال ${report.period}`, details:{definition:"الواجبات والتكليفات ونسب الإكمال المسجلة.",tasks,history:points([...fixture.histories[1].slice(0,-1),taskRate],labels)} },
    { id:"attendance", label:"الحضور والانضباط", value:attendance.rate, trend:attendance.trend, period:report.period, icon:"attendance", updatedAt, sourceSummary:`${attendance.present} حضور · ${attendance.absent} غياب · ${attendance.late} تأخير`, details:{definition:"الحضور والغياب والتأخير المسجل خلال الفترة.",attendance,history:attendance.history} },
  ];
  return { ...report, attendance, overall:{label:"تقييمك العام",value:report.overallMetric.value,unit:report.overallMetric.unit,trend:report.overallTrend,period:report.period,evaluationDimensionIds:["academic","tasks","attendance"],updatedAt}, dimensions, periodOptions,
    subjects: report.subjects.map((subject, i) => {
      const records = periodRecords.filter(a=>a.subjectName===subject.subjectName);
      const recentTasks=periodTasks[i];
      const completed=recentTasks.filter(t=>t.state==="completed").length,total=recentTasks.length,pending=recentTasks.filter(t=>t.state==="pending").length,late=recentTasks.filter(t=>t.state==="late").length;
      const [present,absent] = attendanceCounts[index][i];

      const average = academicAverage(records);
      const dimensions = subject.dimensions.map(d=>({...d,value:d.id==="academic"?average:d.id==="tasks"?Math.round(completed/total*100):Math.round(present/(present+absent)*100)}));
      return {...subject,dimensions,academic:{assessmentCount:records.length,average,records},tasks:{completed,total,pending,late,records:recentTasks},attendance:{rate:dimensions.find(d=>d.id==="attendance")!.value,present:present-(i===1&&index!==2?1:0),absent,late:i===1&&index!==2?1:0,records:sessionEvidence.filter(s=>s.title.includes(subject.subjectName))}};
    }) };
});

// Source detail targets reuse existing Learning/Schedule records where available.
// Evaluation-only records have their own source details instead of fabricated URLs.
const sourceRecords = new Map<string, PerformanceSourceRecord>();
for (const report of performanceDemoPeriods) {
  for (const subject of report.subjects) {
    for (const record of subject.academic?.records ?? []) sourceRecords.set(record.navigationTarget,{id:record.sourceId,sourceType:record.sourceType,title:record.title,fields:[{label:"المادة",value:record.subjectName},{label:"تاريخ الاختبار",value:record.date},{label:"النتيجة",value:`${record.score} / ${record.maxScore}`},{label:"الحالة",value:"النتيجة منشورة"}]});
    for (const record of subject.tasks?.records ?? []) {
      const existing = studentDemo.learning.homework.find(h=>homeworkIds[h.title]===record.sourceId);
      sourceRecords.set(record.navigationTarget,{id:record.sourceId,sourceType:record.sourceType,title:record.title,fields:[{label:"المادة",value:subject.subjectName},{label:"الحالة",value:existing?.status ?? (record.state==="completed"?"مكتملة":record.state==="late"?"متأخرة":"قيد المتابعة")},{label:"موعد التسليم",value:existing?.due ?? record.date}]});
    }
  }
}
for (const session of scheduleEventsV103.filter(s=>s.kind==="session")) sourceRecords.set(`source:session:${session.id}`,{id:session.id,sourceType:"session",title:session.title,href:session.href,fields:[{label:"التاريخ",value:session.date},{label:"الوقت",value:session.time},{label:"التفاصيل",value:session.meta},{label:"الحصة",value:session.detail}]});
export const performanceSourceRecords = sourceRecords;
