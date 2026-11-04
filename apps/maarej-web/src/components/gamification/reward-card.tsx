"use client";
import Link from "next/link";
import { Gift } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { NumberTicker } from "@/components/magicui/number-ticker";
export function RewardCard({amount,condition,progress,status,compact=false}:{amount:number;condition:string;progress:number;status:string;compact?:boolean}){
 return <Link href="/student/rewards/attendance" data-testid="home-reward" className={`v104-reward-card ${compact?"is-compact":""}`}><span className="v104-reward-icon"><Gift size={22}/></span><div><small>{compact?"مكافأة فعالة":"هدف المكافأة"}</small><h3><NumberTicker value={amount}/> ج.م</h3><p>{condition}</p><div className="v104-reward-progress"><Progress value={progress}/><b>{progress}%</b></div>{!compact&&<span className="v104-funded">✓ {status.includes("ممولة")?"ممولة":"نشطة"}</span>}</div></Link>
}
