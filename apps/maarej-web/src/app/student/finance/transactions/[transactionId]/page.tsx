import { studentTransactions } from "@/data/student-records";
import { TransactionRecordScreen } from "@/components/student/student-record-details";
export function generateStaticParams() { return [...studentTransactions, {id:"demo"}].map(r=>({transactionId:r.id})); }
export default async function Page({params}:{params:Promise<{transactionId:string}>}) { const {transactionId}=await params; return <TransactionRecordScreen id={transactionId}/>; }
