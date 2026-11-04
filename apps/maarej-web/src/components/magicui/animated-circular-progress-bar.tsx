"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Magic UI Animated Circular Progress Bar source pattern, customized to Maarej.
export function AnimatedCircularProgressBar({ max = 100, min = 0, value = 0, gaugePrimaryColor = "var(--v-violet)", gaugeSecondaryColor = "#e8eaf5", className, label }: { max?:number; min?:number; value?:number; gaugePrimaryColor?:string; gaugeSecondaryColor?:string; className?:string; label?:string }) {
  const [current,setCurrent]=useState(min);
  useEffect(()=>{ const id=requestAnimationFrame(()=>setCurrent(value)); return ()=>cancelAnimationFrame(id); },[value]);
  const circumference=2*Math.PI*45;
  const percent=useMemo(()=>Math.min(100,Math.max(0,((current-min)/(max-min))*100)),[current,min,max]);
  const dash=circumference-(percent/100)*circumference;
  return <div className={cn("v102-magic-ring",className)} style={{"--gauge-primary":gaugePrimaryColor,"--gauge-secondary":gaugeSecondaryColor} as CSSProperties}>
    <svg viewBox="0 0 100 100" role="img" aria-label={`${label ?? "التقدم"} ${Math.round(percent)}%`}>
      <circle className="v102-magic-ring__track" cx="50" cy="50" r="45"/>
      <circle className="v102-magic-ring__value" cx="50" cy="50" r="45" strokeDasharray={circumference} strokeDashoffset={dash}/>
    </svg>
    <div className="v102-magic-ring__content"><strong>{Math.round(percent)}%</strong>{label&&<small>{label}</small>}</div>
  </div>;
}
