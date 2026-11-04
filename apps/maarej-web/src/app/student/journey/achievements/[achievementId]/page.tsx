import { studentAchievements } from "@/data/student-records";
import { JourneyRecordScreen } from "@/components/student/student-record-details";
export function generateStaticParams(){return studentAchievements.map(r=>({achievementId:r.id}));}
export default async function Page({params}:{params:Promise<{achievementId:string}>}){const {achievementId}=await params;return <JourneyRecordScreen kind="achievement" id={achievementId}/>;}
