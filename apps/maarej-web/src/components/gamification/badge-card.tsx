"use client";
import { Award, Lock, Lightbulb, Rocket, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
const iconMap={"ملتزم":ShieldCheck,"مفكر الحصة":Lightbulb,"مبادر":Rocket,"متعاون":Award};
export function BadgeCard({badge,onClick}:{badge:{name:string;meta:string;state:string;earnedDate:string|null};onClick:()=>void}){
 const reduce=useReducedMotion(); const Icon=iconMap[badge.name as keyof typeof iconMap]??Award;
 return <motion.button type="button" onClick={onClick} whileTap={reduce?undefined:{scale:.98}} className={`v104-badge-card ${badge.state}`}><span className="v104-badge-symbol">{badge.state==="locked"?<Lock size={28}/>:<Icon size={30}/>}</span><b>{badge.name}</b><small>{badge.earnedDate??badge.meta}</small></motion.button>
}
