import { studentAttendance } from "@/data/student-records";
import { AttendanceScreen } from "@/components/student/student-record-details";
export function generateStaticParams() { return studentAttendance.map(r=>({attendanceId:r.id})); }
export default async function Page({params}:{params:Promise<{attendanceId:string}>}) { const {attendanceId}=await params; return <AttendanceScreen id={attendanceId}/>; }
