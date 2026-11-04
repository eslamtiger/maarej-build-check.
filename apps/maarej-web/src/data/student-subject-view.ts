import {studentPerformanceView,studentPerformancePeriods} from './student-performance-view';
import {studentGroups,studentTeachers,studentSessions,studentHomework,studentExams,studentAttendance,studentAttendanceForReport,studentMaterials} from './student-records';
const key=(s:string)=>s.replace('اللغة العربية','لغة عربية');
export const studentSubjects=studentPerformanceView.subjects.map(s=>({id:s.subjectId,name:s.subjectName,status:studentGroups.some(g=>key(g.subject)===key(s.subjectName))?'active':'no_active_group'}));
export function subjectWorkspace(id:string,periodId="six-weeks"){
 const report=studentPerformancePeriods.find(v=>v.id===periodId)??studentPerformanceView;
 const subject=studentSubjects.find(s=>s.id===id);if(!subject)return undefined;
 const matches=(s:string)=>key(s)===key(subject.name);
 const groups=studentGroups.filter(g=>matches(g.subject));
 const teachers=studentTeachers.filter(t=>groups.some(g=>g.teacherId===t.id));
 const homework=studentHomework.filter(h=>matches(h.subject));const exams=studentExams.filter(e=>matches(e.subject));
 return {subject,period:report.period,performance:report.subjects.find(s=>s.subjectId===id),groups,teachers,homework,exams,sessions:studentSessions.filter(s=>matches(s.subject)),attendance:studentAttendanceForReport(report.id).filter(a=>matches(a.subject)),materials:studentMaterials.filter(m=>matches(m.subject)),feedback:[...homework,...exams].filter(r=>r.feedback).map(r=>({teacherId:r.teacherId,subjectId:id,sourceType:r.sourceType,sourceId:r.id,href:r.href,createdAt:'submittedAt' in r?r.submittedAt:r.date,text:r.feedback!}))};
}
