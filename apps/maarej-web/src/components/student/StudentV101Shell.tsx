"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PublicWorkspaceHeader } from "./public-workspace-header";
import { usePathname } from "next/navigation";
import { studentNotifications } from "@/data/student-records";
import { useStudentAppState } from "@/lib/student-app-state";
import { Bell, CalendarDays, Settings, WalletCards, CircleUserRound, GraduationCap, Home, Route, type LucideIcon } from "lucide-react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/application";

const nav:Array<{id:string;label:string;href:string;icon:LucideIcon}>=[
  {id:"home",label:"الرئيسية",href:"/student",icon:Home},
  {id:"learn",label:"تعلّمي",href:"/student/learning",icon:GraduationCap},
  {id:"journey",label:"رحلتي",href:"/student/journey",icon:Route},
  {id:"finance",label:"المالية",href:"/student/finance",icon:WalletCards},
  {id:"account",label:"الإعدادات",href:"/student/account",icon:Settings},
];
const bottomNav = ["learn", "journey", "home", "finance", "account"].map(id => nav.find(item => item.id === id)!);

export function StudentV101Shell({active:requestedActive,children,compactHeader=false,navigationContext}:{active:string;children:ReactNode;compactHeader?:boolean;navigationContext?:string}){
  const settings=useStudentAppState();const path=usePathname();
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});},[path]);
  const active=path==="/student"?"home":path.startsWith("/student/orders/")?(navigationContext??""):path.startsWith("/student/learning")||path.startsWith("/student/schedule")?"learn":path.startsWith("/student/journey")||path.startsWith("/student/rewards")?"journey":path.startsWith("/student/finance")?"finance":path==="/student/notifications"?"":path.startsWith("/student/")?"account":requestedActive;
  const reduce=useReducedMotion()||settings.preferences.reduceMotion;
  return <MotionConfig reducedMotion={settings.preferences.reduceMotion?"always":"user"}><div className="v104-app" dir="rtl" data-reduce-motion={reduce} data-large-text={settings.preferences.largeText}>
    <PublicWorkspaceHeader compact={compactHeader}/>
    <aside className="v104-sidebar" aria-label="التنقل الرئيسي على سطح المكتب">
      <div className="v104-sidebar-brand"><Avatar className="v104-brand-avatar">م</Avatar><div><strong>معارج</strong><small>رحلتك التعليمية</small></div></div>
      <nav>{bottomNav.map((item)=>{const Icon=item.icon;return <Link data-testid={`desktop-nav-${item.id}`} key={item.id} href={item.href} className={active===item.id?"is-active":""}><Icon size={19}/><span>{item.label}</span></Link>})}</nav>
    </aside>

    <main className="v104-content">{children}</main>

    <nav className="v104-bottom-nav" aria-label="التنقل الرئيسي">
      {bottomNav.map(item=>{
        const Icon=item.icon;
        return <Link data-testid={`nav-${item.id}`} key={item.id} href={item.href} aria-current={active===item.id?"page":undefined} className={`${active===item.id?"is-active":""} ${item.id==="home"?"is-home":""}`}>
          {active===item.id&&<motion.span layoutId="student-bottom-nav-pill-v104" className="v104-bottom-pill" transition={reduce?{duration:0}:{type:"spring",stiffness:420,damping:34,mass:.65}}/>}
          <motion.span className="v104-bottom-icon" whileTap={reduce?undefined:{scale:.92}} transition={{duration:.12}}><Icon size={item.id==="home"?24:19} strokeWidth={active===item.id?2.5:2}/></motion.span>
          <span className="v104-bottom-label">{item.label}</span>
        </Link>
      })}
    </nav>
  </div></MotionConfig>
}
