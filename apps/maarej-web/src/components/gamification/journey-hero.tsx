"use client";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import { motion, useReducedMotion } from "motion/react";

export function JourneyHero({value=92}:{value?:number}){
  const reduce=useReducedMotion();
  return <motion.section className="v104-journey-hero" initial={reduce?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.22}}>
    <div className="v104-journey-hero-copy"><span>رحلتي</span><h1>أقوى تقدم ليك الأسبوع ده في الالتزام</h1><small>استمر بنفس الإيقاع</small></div>
    <AnimatedCircularProgressBar value={value} label="الالتزام" className="v104-journey-ring"/>
  </motion.section>
}
