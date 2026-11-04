"use client";

import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/application";
import { Tabs as ShadcnTabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { NumberTicker as MagicNumberTicker } from "@/components/magicui/number-ticker";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
export { Avatar, Badge, Button, Calendar, Card, ScrollArea, Separator, Skeleton } from "@/components/ui/application";
export { ShineBorder } from "@/components/magicui/shine-border";
export { AnimatedList } from "@/components/magicui/animated-list";
export { Confetti, type ConfettiRef } from "@/components/magicui/confetti";

export function Tabs({ items, value, onValueChange }: { items:Array<{value:string;label:string}>; value:string; onValueChange:(v:string)=>void }) {
  const reduce=useReducedMotion();
  return <ScrollArea className="v102-tabs"><ShadcnTabs dir="rtl" value={value} onValueChange={onValueChange}><TabsList>{items.map(item=><TabsTrigger data-testid={`tab-${item.value}`} key={item.value} value={item.value}>{item.value===value&&<motion.span layoutId="maarej-tab-active" className="v102-tab-indicator" transition={reduce?{duration:0}:{duration:.2,ease:[.2,.8,.2,1]}}/>}<span>{item.label}</span></TabsTrigger>)}</TabsList></ShadcnTabs></ScrollArea>;
}

export function AnimatedProgress({ value, className="" }: { value:number; className?:string }) { return <Progress className={className} value={value}/>; }
export function FadeSlide({ children, className="" }: { children:ReactNode; className?:string }) { const reduce=useReducedMotion(); return <motion.div className={className} initial={reduce?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.22}}>{children}</motion.div>; }

export function Sheet({ open, onOpenChange, children, title, description="" }: { open:boolean; onOpenChange:(v:boolean)=>void; children:ReactNode; title:string; description?:string }) {
  return <Drawer open={open} onOpenChange={onOpenChange}><DrawerContent dir="rtl"><DrawerHeader className="v102-sr-only"><DrawerTitle>{title}</DrawerTitle><DrawerDescription>{description || title}</DrawerDescription></DrawerHeader>{children}</DrawerContent></Drawer>;
}

export function NumberTicker({ value, suffix="", className="" }: { value:number; suffix?:string; className?:string }) { return <span className={className}><MagicNumberTicker value={value}/>{suffix}</span>; }
export function AnimatedCircularProgress({ value, label, className="" }: { value:number; label:string; className?:string }) { return <AnimatedCircularProgressBar value={value} label={label} className={className}/>; }
export function AnimatedContent({ children, delay=0, className="" }: { children:ReactNode; delay?:number; className?:string }) { const reduce=useReducedMotion(); return <motion.div className={className} initial={reduce?false:{opacity:0,y:6,scale:.98}} animate={{opacity:1,y:0,scale:1}} transition={{duration:reduce?0:.22,delay:reduce?0:delay}}>{children}</motion.div>; }

type PressableProps = Omit<HTMLMotionProps<"button">,"children"> & {children:ReactNode};
export function Pressable({children,className="",...props}:PressableProps){const reduce=useReducedMotion();return <motion.button type="button" className={className} whileTap={reduce?undefined:{scale:.98}} transition={{duration:.14}} {...props}>{children}</motion.button>}

export function ThreeStepIndicator({ active=2 }: { active?:1|2|3 }) { return <div className="v102-stepper" aria-label="خطوات السحب">{["المبلغ","طريقة السحب","التأكيد"].map((label,i)=>{const n=i+1; const done=n<active, current=n===active; return <div key={label} className={`v102-step ${done?"is-done":""} ${current?"is-active":""}`}><span>{done?"✓":n}</span><small>{label}</small></div>})}</div>; }
export function Presence({show,children}:{show:boolean;children:ReactNode}){return <AnimatePresence>{show&&children}</AnimatePresence>}
