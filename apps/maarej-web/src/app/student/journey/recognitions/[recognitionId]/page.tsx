import { studentRecognitions } from "@/data/student-records";
import { JourneyRecordScreen } from "@/components/student/student-record-details";
export function generateStaticParams(){return studentRecognitions.map(r=>({recognitionId:r.id}));}
export default async function Page({params}:{params:Promise<{recognitionId:string}>}){const {recognitionId}=await params;return <JourneyRecordScreen kind="recognition" id={recognitionId}/>;}
