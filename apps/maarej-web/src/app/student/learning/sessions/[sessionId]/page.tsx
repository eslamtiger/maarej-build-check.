import { studentSessions } from "@/data/student-records";
import { SessionRecordScreen } from "@/components/student/student-record-details";
export function generateStaticParams() { return studentSessions.map(r=>({sessionId:r.id})); }
export default async function Page({params}:{params:Promise<{sessionId:string}>}) { const {sessionId}=await params; return <SessionRecordScreen id={sessionId}/>; }
