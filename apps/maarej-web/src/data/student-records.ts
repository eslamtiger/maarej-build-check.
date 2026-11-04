import {teacherIdentityByAlias} from "@/product/teacher-identities";
import {studentTeacherHref} from "@/product/routes";
import { studentDemo } from "./student-v101";
import { groupIds, teacherIds, homeworkIds, examIds, scheduleEventsV103 } from "./student-v103-view";
import { studentV106Demo } from "./student-v106-demo";

// Canonical evaluation dataset. Existing source IDs are preserved across all modules.
export type StudentSourceType = "session" | "homework" | "exam" | "attendance" | "group" | "teacher" | "reward" | "achievement" | "recognition" | "transaction" | "material";
export type StudentSource = { sourceType: StudentSourceType; sourceId: string; href: string };
export const sourceHref = (type: StudentSourceType, id: string) => type==="teacher" ? studentTeacherHref(id) : type==="group" ? `/student/learning/groups/${id}` : type==="attendance" ? `/student/learning/attendance/${id}` : type==="reward" ? `/student/rewards/${id}` : type==="transaction" ? `/student/finance/transactions/${id}` : type==="achievement" || type==="recognition" ? `/student/journey/${type}s/${id}` : `/student/learning/${type==="session"?"sessions":type==="exam"?"exams":type==="material"?"materials":"homework"}/${id}`;
const ref = (sourceType: StudentSourceType, sourceId: string): StudentSource => ({sourceType,sourceId,href:sourceHref(sourceType,sourceId)});
const subjectKey = (s: string) => s.replace("اللغة العربية","لغة عربية");
export const studentGroups = studentDemo.learning.groups.map(g=>({...g,id:groupIds[g.name],teacherId:teacherIds[g.teacher]}));
export const studentTeachers = studentDemo.learning.teachers.map(t=>{const identity=teacherIdentityByAlias("student",teacherIds[t.name]);if(!identity)throw new Error("Missing Student teacher identity");return {...t,name:identity.name,id:teacherIds[t.name],canonicalTeacherId:identity.id,groupId:groupIds[t.group]};});
const groupOf = (subject: string) => studentGroups.find(g=>subjectKey(g.subject)===subjectKey(subject));
const fieldsOf = (record: {fields:readonly {label:string;value:string}[]}, label:string) => record.fields.find(f=>f.label===label)?.value;
// Operational collections are sourced only from Learning records, never analytics fixtures.
const homeworkSources=studentDemo.learning.homework.map(h=>({id:homeworkIds[h.title],sourceType:"homework",title:h.title,fields:[{label:"المادة",value:h.subject},{label:"موعد التسليم",value:h.due},{label:"الحالة",value:h.status}]}));
export const studentHomework = homeworkSources.filter(s=>s.sourceType==="homework").map(s=>{
  const subject=fieldsOf(s,"المادة") ?? ""; const group=groupOf(subject); const status=fieldsOf(s,"الحالة") ?? "مطلوب";
  const completed=status.includes("مكتمل")||status.includes("تسليم")||status.includes("مراجعة");
  return {...ref("homework",s.id),id:s.id,title:s.title as string,subject,groupId:group?.id,teacherId:group?.teacherId,due:fieldsOf(s,"موعد التسليم"),dueAt:s.id==="motion-applications"?"2026-10-01T18:00:00+03:00":s.id==="motion-problems"?"2026-10-04T18:00:00+03:00":"2026-10-03T20:00:00+03:00",status,instructions:`راجع الدرس ثم أكمل تدريبات ${subject}. وضّح خطوات الحل واكتب الأسئلة التي تحتاج فيها مساعدة.`,submissionStatus:completed?"تم التسليم":"لم يتم التسليم",submittedAt:completed?`${/^\d{4}-\d{2}-\d{2}$/.test(fieldsOf(s,"موعد التسليم")??"")?fieldsOf(s,"موعد التسليم"):"2026-10-01"}T17:00:00+03:00`:undefined,feedback:status.includes("مراجعة")?"خطوات الحل واضحة؛ راجع الإشارة في المسألة الأخيرة.":undefined,attachments:[] as {title:string;url:string}[],canSubmit:!completed};
});
const examSources=studentDemo.learning.exams.previous.map(e=>({id:examIds[e.name],title:e.name,fields:[{label:"المادة",value:e.subject},{label:"النتيجة",value:e.score},{label:"تاريخ الاختبار",value:"2026-09-24"}]}));
export const studentExams = examSources.map(s=>{
  const subject=fieldsOf(s,"المادة") ?? ""; const group=groupOf(subject); const score=fieldsOf(s,"النتيجة")!.split("/").map(Number);
  return {...ref("exam",s.id),id:s.id as string,title:s.title as string,subject,groupId:group?.id,teacherId:group?.teacherId,date:fieldsOf(s,"تاريخ الاختبار")!,time:undefined as string|undefined,score:score[0] as number|undefined,maxScore:score[1] as number|undefined,percentage:Math.round(score[0]/score[1]*100) as number|undefined,status:"النتيجة منشورة",instructions:"النتيجة المسجلة للاختبار والتغذية الراجعة المتاحة.",feedback:"راجع الأسئلة غير المكتملة مع المدرس في الحصة القادمة."};
});
studentExams.push({...ref("exam","physics-unit-2"),id:"physics-unit-2",title:studentDemo.learning.exams.upcoming[0].name,subject:"فيزياء",groupId:"physics-basics",teacherId:"khaled-mahmoud",date:"2026-10-04",time:"6:00 م",score:undefined,maxScore:undefined,percentage:undefined,status:"قادم",instructions:"راجع الوحدة الثانية وأحضر أدوات الكتابة. موعد الاختبار حسب الجدول المسجل.",feedback:undefined as unknown as string});
export const studentMaterials = studentDemo.learning.materials.map((m,i)=>({...ref("material",`material-${i+1}`),...m,type:i===0?"TXT":m.type,meta:i===0?"تدريبات جبر تجريبية":m.meta,id:`material-${i+1}`,groupId:groupOf(m.subject)?.id,updatedAt:"2026-10-01",url:i===0?"/materials/algebra-practice.txt":undefined,description:`مورد مراجعة مرتبط بمادة ${m.subject}.`}));
export type StudentSession=StudentSource & {id:string;title:string;subject:string;groupId?:string;teacherId?:string;date:string;time:string;place:string;onlineUrl?:string;attendanceStatus:string;homeworkIds:string[];materialIds:string[];examIds:string[]};
export const studentSessions: StudentSession[] = scheduleEventsV103.filter(s=>s.kind==="session").map(s=>{
  const group=studentGroups.find(g=>s.title.includes(g.name))!;
  return {...ref("session",s.id),id:s.id,title:s.title,subject:group.subject,groupId:group.id,teacherId:group.teacherId,date:s.date,time:s.time,place:group.location,onlineUrl:undefined as string|undefined,attendanceStatus:"لم تُسجّل بعد",homeworkIds:studentHomework.filter(h=>h.groupId===group.id).slice(0,2).map(h=>h.id),materialIds:studentMaterials.filter(m=>m.groupId===group.id).map(m=>m.id),examIds:studentExams.filter(e=>e.groupId===group.id).slice(0,1).map(e=>e.id)};
});
// Historical attendance is operational seed data, independent of analytics reports.
const attendanceSeed=[{subjectId:"math",subjectName:"رياضيات",attended:8,absent:0,late:0},{subjectId:"physics",subjectName:"فيزياء",attended:5,absent:1,late:1},{subjectId:"arabic",subjectName:"لغة عربية",attended:5,absent:1,late:0},{subjectId:"english",subjectName:"إنجليزي",attended:5,absent:0,late:0}];
export const studentAttendance = attendanceSeed.flatMap((s)=>{
  const a={present:s.attended,absent:s.absent};const group=groupOf(s.subjectName);return Array.from({length:a.present+a.absent},(_,i)=>{
    const id=`attendance-${s.subjectId}-${i+1}`,sessionId=`history-${s.subjectId}-${i+1}`;
    const date=i>=a.present?"2026-09-24":i===a.present-1?"2026-10-01":i===0?"2026-09-01":`2026-09-${String(2+i*3).padStart(2,"0")}`;const status=i>=a.present?"غياب":s.late>0&&i===1?"تأخير":"حضور";
    studentSessions.push({...ref("session",sessionId),id:sessionId,title:`${s.subjectName} · حصة ${i+1}`,subject:s.subjectName,groupId:group?.id,teacherId:group?.teacherId,date,time:"4:30 م",place:group?.location ?? "",onlineUrl:undefined,attendanceStatus:status,homeworkIds:studentHomework.filter(h=>subjectKey(h.subject)===subjectKey(s.subjectName)).slice(0,1).map(h=>h.id),materialIds:studentMaterials.filter(m=>subjectKey(m.subject)===subjectKey(s.subjectName)).map(m=>m.id),examIds:studentExams.filter(e=>subjectKey(e.subject)===subjectKey(s.subjectName)).slice(0,1).map(e=>e.id)});
    return {...ref("attendance",id),id,sessionId,subject:s.subjectName,groupId:group?.id,date,status,recordStatus:"مسجّل"};
  });
});
export const studentRewards=[{...ref("reward","attendance"),...studentDemo.journey.reward,id:"attendance",releaseCondition:studentV106Demo.rewardReleaseCondition,attendanceHref:"/student/learning/attendance"}];
export const studentAchievements=studentDemo.journey.badges.map((b,i)=>({...ref("achievement",["commitment","thinker","initiative","collaboration"][i]),...b,id:["commitment","thinker","initiative","collaboration"][i]}));
export const studentRecognitions=studentDemo.journey.recognition.map((r,i)=>({...ref("recognition",`recognition-${i+1}`),...r,id:`recognition-${i+1}`,achievementId:i===0?"thinker":undefined,href:i===0?sourceHref("achievement","thinker"):sourceHref("recognition",`recognition-${i+1}`)}));
export const studentTransactions=studentDemo.finance.transactions.map((t,i)=>({...ref("transaction",["payment-math","topup-card","reward-attendance"][i]),...t,id:["payment-math","topup-card","reward-attendance"][i],createdAt:["2026-09-27","2026-09-25","2026-09-24"][i],groupId:i===0?"math-excellence":undefined,rewardId:i===2?"attendance":undefined,reference:`MAAREJ-2026-${1001+i}`}));
export const studentNotifications=[
  {id:"n-payment",title:"تم تأكيد دفع مجموعة الرياضيات",eventType:"paymentConfirmed",category:"finance",...ref("transaction","payment-math"),createdAt:"2026-10-02T06:10:00+03:00",readState:"unread"},
  {id:"n-reward",title:"تم تمويل مكافأة انتظام الحضور",eventType:"rewardFunded",category:"rewards",...ref("reward","attendance"),createdAt:"2026-10-02T05:00:00+03:00",readState:"unread"},
  {id:"n-homework",title:"واجب الجبر ينتظر تسليمك",eventType:"homeworkDue",category:"learning",...ref("homework","algebra-practice-4"),createdAt:"2026-10-02T04:30:00+03:00",readState:"unread"},
  {id:"n-exam",title:"نتيجة اختبار الجبر متاحة",eventType:"examResult",category:"learning",...ref("exam","algebra-short"),createdAt:"2026-09-24T16:00:00+03:00",readState:"read"},
  {id:"n-session",title:"حصة الفيزياء القادمة",eventType:"sessionUpdate",category:"learning",...ref("session","session-physics"),createdAt:"2026-10-01T14:00:00+03:00",readState:"unread"},
  {id:"n-achievement",title:"حصلت على مفكر الحصة",eventType:"achievementEarned",category:"rewards",...ref("achievement","thinker"),createdAt:"2026-10-01T17:30:00+03:00",readState:"read"},
];
export const studentSchedule = [...studentSessions.filter(s=>!s.id.startsWith("history-")).map(s=>({...ref("session",s.id),id:s.id,date:s.date,time:s.time,title:s.title,meta:s.place,kind:"session" as const})),{...ref("homework","algebra-practice-4"),id:"deadline-algebra",date:"2026-10-03",time:"8:00 م",title:"تدريبات الجبر · الدرس 4",meta:"موعد التسليم",kind:"homework" as const},{...ref("exam","physics-unit-2"),id:"exam-physics-unit-2",date:"2026-10-04",time:"6:00 م",title:"اختبار الوحدة الثانية",meta:"فيزياء",kind:"exam" as const}];
export const studentPlan={...studentDemo.plans,features:["الوصول إلى مجموعاتك","متابعة الواجبات والنتائج","مسار التقدم والأداء"],billingCycle:"monthly"};
export function resolveStudentSource(type: string,id: string): StudentSource | undefined {
  const normalized=type==="attendanceTarget"?"session":type==="payment"?"transaction":type;
  const canonicalId=normalized==="achievement" ? studentAchievements.find(a=>a.name===id)?.id ?? (id==="achievement-thinker"?"thinker":id) : id;
  const collections: Record<string,readonly {id:string;href:string;sourceType:StudentSourceType;sourceId:string}[]>={homework:studentHomework,exam:studentExams,session:studentSessions,attendance:studentAttendance,group:studentGroups.map(g=>({...ref("group",g.id),id:g.id})),teacher:studentTeachers.map(t=>({...ref("teacher",t.id),id:t.id})),reward:studentRewards,achievement:studentAchievements,recognition:studentRecognitions,transaction:studentTransactions,material:studentMaterials};
  return collections[normalized]?.find(r=>r.id===canonicalId);
}

export function studentAttendanceForReport(periodId:string){const start=({"six-weeks":"2026-08-21","four-weeks":"2026-09-04",week:"2026-09-26"} as Record<string,string>)[periodId] ?? "2026-08-21";return studentAttendance.filter(r=>r.date>=start&&r.date<="2026-10-02");}

export const studentReferenceDate=studentV106Demo.referenceClock.date;
