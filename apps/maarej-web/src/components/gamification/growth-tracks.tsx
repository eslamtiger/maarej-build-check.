"use client";
import { motion, useReducedMotion } from "motion/react";

type Track={key:string;label:string;value:number;why:string;lastRecognition:string;next:string};
export function GrowthTracks({tracks,selected,onSelect}:{tracks:readonly Track[];selected:string;onSelect:(key:string)=>void}){
 const reduce=useReducedMotion();
 const current=tracks.find(t=>t.key===selected)??tracks[0];
 return <section className="v104-growth-block"><div className="v104-track-scroll" role="tablist" aria-label="مسارات النمو">{tracks.map(t=><button type="button" role="tab" aria-selected={selected===t.key} key={t.key} onClick={()=>onSelect(t.key)} className={selected===t.key?"is-active":""}>{selected===t.key&&<motion.span layoutId="v104-growth-pill" className="v104-track-active" transition={reduce?{duration:0}:{type:"spring",stiffness:440,damping:36}}/>}<span>{t.label}</span><b>{t.value}%</b></button>)}</div><motion.div key={current.key} className="v104-track-detail" initial={reduce?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.22}}><div><small>ما الذي رفع تقدمك؟</small><p>{current.why}</p></div><div><small>آخر تقدير</small><p>{current.lastRecognition}</p></div><div><small>خطوتك التالية</small><p>{current.next}</p></div></motion.div></section>
}
