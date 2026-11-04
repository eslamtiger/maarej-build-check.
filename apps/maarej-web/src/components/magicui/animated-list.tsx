"use client";

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// Magic UI Animated List source pattern; delay reduced for application UI.
export function AnimatedList({ children, className, delay = 45 }: { children:ReactNode; className?:string; delay?:number }) {
  const reduce=useReducedMotion();
  return <div className={cn("v102-animated-list",className)}>{Children.map(children,(child,index)=>{
    if(!isValidElement(child)) return child;
    return <motion.div key={(child as ReactElement).key ?? index} initial={reduce?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.22,delay:reduce?0:index*delay/1000}}>{cloneElement(child as ReactElement)}</motion.div>;
  })}</div>;
}
