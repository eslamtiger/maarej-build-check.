import { studentExams } from "@/data/student-records";
import { ExamRecordScreen } from "@/components/student/student-record-details";
export function generateStaticParams() { return studentExams.map(r=>({examId:r.id})); }
export default async function Page({params}:{params:Promise<{examId:string}>}) { const {examId}=await params; return <ExamRecordScreen id={examId}/>; }
