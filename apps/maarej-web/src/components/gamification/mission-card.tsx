"use client";
import { Gift, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
export function MissionCard({title,value,progressText,remaining,reward}:{title:string;value:number;progressText:string;remaining:string;reward?:number}){
 return <section className="v104-mission-card"><div className="v104-mission-label"><Sparkles size={18}/><span>مهمتك الحالية</span></div><h2>{title}</h2><div className="v104-mission-progress"><div><span>{progressText}</span><b>{value}%</b></div><Progress value={value}/></div><div className="v104-mission-footer"><span>{remaining}</span>{reward?<b><Gift size={16}/>{reward} ج.م</b>:null}</div></section>
}
