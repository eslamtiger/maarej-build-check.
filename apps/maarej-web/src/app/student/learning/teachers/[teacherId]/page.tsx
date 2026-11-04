import {studentTeachers} from "@/data/student-records";
import {TeacherRelationship} from "@/components/student/student-subject-workspace";
export function generateStaticParams(){return studentTeachers.map(s=>({teacherId:s.id}));}
export default async function Page({params}:{params:Promise<{teacherId:string}>}){const p=await params;return <TeacherRelationship id={p.teacherId}/>;}
