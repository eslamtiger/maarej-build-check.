import {studentSubjects} from "@/data/student-subject-view";
import {SubjectWorkspace} from "@/components/student/student-subject-workspace";
export function generateStaticParams(){return studentSubjects.map(s=>({subjectId:s.id}));}
export default async function Page({params}:{params:Promise<{subjectId:string}>}){const p=await params;return <SubjectWorkspace id={p.subjectId}/>;}
