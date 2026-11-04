import { studentMaterials } from "@/data/student-records";
import { MaterialRecordScreen } from "@/components/student/student-record-details";
export function generateStaticParams() { return studentMaterials.map(r=>({materialId:r.id})); }
export default async function Page({params}:{params:Promise<{materialId:string}>}) { const {materialId}=await params; return <MaterialRecordScreen id={materialId}/>; }
