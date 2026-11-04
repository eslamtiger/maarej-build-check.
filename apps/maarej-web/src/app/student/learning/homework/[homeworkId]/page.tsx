import { studentHomework } from "@/data/student-records";
import { HomeworkRecordScreen } from "@/components/student/student-record-details";
export function generateStaticParams() { return studentHomework.map(r=>({homeworkId:r.id})); }
export default async function Page({params}:{params:Promise<{homeworkId:string}>}) { const {homeworkId}=await params; return <HomeworkRecordScreen id={homeworkId}/>; }
