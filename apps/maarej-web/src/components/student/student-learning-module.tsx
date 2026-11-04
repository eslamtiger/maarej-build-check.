"use client";
import { AcademicHub, AcademicSchedule } from "./student-academic-hub";
import { TeacherRelationship } from "./student-subject-workspace";
import {StudentContextLink as Link} from "./student-context-link";
import {useStudentClock} from "@/lib/use-student-clock";
import {isUpcoming,chronological} from "@/lib/student-clock";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ChevronLeft, Star, FileText } from "lucide-react";
import { StudentV101Shell } from "./StudentV101Shell";
import { Badge, Card, Tabs, Avatar, Button } from "./V101Primitives";
import { LearningPerformancePreview } from "./performance/learning-performance-preview";
import { RecordLink, StudentRecordFrame } from "./student-record-details";
import { studentGroups, studentTeachers, studentHomework, studentExams, studentMaterials, studentSessions, studentAttendance, studentTransactions, studentSchedule } from "@/data/student-records";
import { useStudentAppState } from "@/lib/student-app-state";
import { formatPerformanceDate } from "@/data/student-performance-view";
const tabs=[{value:"groups",label:"مجموعاتي"},{value:"homework",label:"الواجبات"},{value:"exams",label:"الاختبارات"},{value:"performance",label:"أدائي"},{value:"teachers",label:"المدرسون"},{value:"materials",label:"المواد"}];
export function CompleteLearningScreen(){return <AcademicHub/>;}
export function CompleteGroupScreen({groupId}:{groupId:string}){const clock=useStudentClock();const g=studentGroups.find(g=>g.id===groupId);if(!g)return <StudentRecordFrame title="المجموعة غير موجودة"/>;const sessions=studentSessions.filter(s=>s.groupId===g.id&&!s.id.startsWith("history-")&&isUpcoming(s,clock)).sort(chronological);const attendance=studentAttendance.filter(a=>a.groupId===g.id);return <StudentRecordFrame title={g.name}><Card className="v103-group-hero"><div><small>{g.subject}</small><h2>{g.name}</h2><p>{g.location}</p></div><Badge>{g.status}</Badge></Card><RecordLink href={`/student/learning/teachers/${g.teacherId}`} title={g.teacher} meta="المدرس"/>{sessions[0]&&<Card><h2>الحصة القادمة</h2><RecordLink href={sessions[0].href} title={sessions[0].title} meta={`${formatPerformanceDate(sessions[0].date)} · ${sessions[0].time}`}/></Card>}<Card><h2>الحضور</h2><p>{attendance.filter(a=>a.status==="حضور").length} حضور · {attendance.filter(a=>a.status==="غياب").length} غياب · {attendance.filter(a=>a.status==="تأخير").length} تأخير</p>{attendance.slice(-3).map(a=><RecordLink key={a.id} href={a.href} title={formatPerformanceDate(a.date)} meta={a.status}/>)}</Card><Card><h2>الواجبات المرتبطة</h2>{studentHomework.filter(h=>h.groupId===g.id).map(h=><RecordLink key={h.id} href={h.href} title={h.title} meta={h.status}/>)}</Card><Card><h2>الاختبارات المرتبطة</h2>{studentExams.filter(e=>e.groupId===g.id).map(e=><RecordLink key={e.id} href={e.href} title={e.title} meta={e.status}/>)}</Card><Card><h2>المواد التعليمية</h2>{studentMaterials.filter(m=>m.groupId===g.id).map(m=><RecordLink key={m.id} href={m.href} title={m.name} meta={m.type}/>)}</Card>{studentTransactions.some(t=>t.groupId===g.id)&&<Card><h2>العمليات المالية المرتبطة</h2>{studentTransactions.filter(t=>t.groupId===g.id).map(t=><RecordLink key={t.id} href={t.href} title={t.title} meta={`${t.amount} ج.م · ${t.status}`}/>)}</Card>}</StudentRecordFrame>;}
export function CompleteScheduleScreen(){return <AcademicSchedule/>;}
export function CompleteTeacherScreen({teacherId}:{teacherId:string}){return <TeacherRelationship id={teacherId}/>;}
