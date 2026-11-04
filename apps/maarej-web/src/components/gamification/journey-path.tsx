"use client";
import { Check, Lock } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const nodes=[
 {x:244,y:38,label:"بدأت",state:"done"},
 {x:92,y:128,label:"ملتزم",state:"done"},
 {x:242,y:222,label:"ثبات أسبوعي",state:"active"},
 {x:98,y:318,label:"الخطوة التالية",state:"locked"},
] as const;
const path="M244 38 C210 75 122 83 92 128 C63 170 130 196 242 222 C292 235 235 289 98 318";
export function JourneyPath(){
 const reduce=useReducedMotion();
 return <section className="v104-journey-path-card"><div className="v104-section-head"><div><small>مسارك</small><h2>رحلة التقدم</h2></div><span>3 من 4</span></div><div className="v104-journey-path" aria-label="مسار رحلة الطالب"><svg viewBox="0 0 340 360" role="img" aria-label="مسار من أربع محطات"><defs><linearGradient id="journeyGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#635BDF"/><stop offset="100%" stopColor="#219EBC"/></linearGradient></defs><path d={path} fill="none" stroke="#D8E3EA" strokeWidth="8" strokeLinecap="round"/><motion.path d={path} fill="none" stroke="url(#journeyGradient)" strokeWidth="8" strokeLinecap="round" initial={reduce?{pathLength:.7}:{pathLength:0}} animate={{pathLength:.7}} transition={{duration:reduce?0:.8,ease:[.2,.8,.2,1]}}/>{nodes.map((node,i)=><g key={node.label} transform={`translate(${node.x} ${node.y})`}><circle r="23" className={`v104-path-node ${node.state}`}/>{node.state==="done"?<Check x="-9" y="-9" width="18" height="18" className="v104-node-icon"/>:node.state==="locked"?<Lock x="-8" y="-8" width="16" height="16" className="v104-node-lock"/>:<motion.circle r="12" fill="#fff" stroke="#635BDF" strokeWidth="4" initial={reduce?false:{scale:.92}} animate={{scale:1}} transition={{duration:reduce?0:.32}}/>}<text y="42" textAnchor="middle" className="v104-path-label">{node.label}</text></g>)}</svg></div></section>
}
