"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { useStudentAppState } from "@/lib/student-app-state";
import { Settings, WalletCards, GraduationCap, Home, Route, type LucideIcon } from "lucide-react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const nav:Array<{id:string;label:string;href:string;icon:LucideIcon}>=[
  {id:"home",label:"الرئيسية",href:"/student",icon:Home},
  {id:"learn",label:"تعلّمي",href:"/student/learning",icon:GraduationCap},
  {id:"journey",label:"رحلتي",href:"/student/journey",icon:Route},
  {id:"finance",label:"المالية",href:"/student/finance",icon:WalletCards},
  {id:"account",label:"الإعدادات",href:"/student/account",icon:Settings},
];
const sideNav = ["home", "learn", "journey", "finance", "account"].map(id => nav.find(item => item.id === id)!);
const bottomNav = ["learn", "journey", "home", "finance", "account"].map(id => nav.find(item => item.id === id)!);

// compactHeader is kept for API compatibility; the V2 top bar is compact on every screen.
export function StudentV101Shell({active:requestedActive,children,navigationContext}:{active:string;children:ReactNode;compactHeader?:boolean;navigationContext?:string}){
  const settings=useStudentAppState();const path=usePathname();
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});},[path]);
  const active=path==="/student"?"home":path.startsWith("/student/orders/")?(navigationContext??""):path.startsWith("/student/learning")||path.startsWith("/student/schedule")?"learn":path.startsWith("/student/journey")||path.startsWith("/student/rewards")?"journey":path.startsWith("/student/finance")?"finance":path==="/student/notifications"?"":path.startsWith("/student/")?"account":requestedActive;
  const reduce=useReducedMotion()||settings.preferences.reduceMotion;
  return <MotionConfig reducedMotion={settings.preferences.reduceMotion?"always":"user"}><div className="v104-app s2" dir="rtl" data-reduce-motion={reduce} data-large-text={settings.preferences.largeText}>
    <SiteHeader/>
    <aside className="v104-sidebar s2-side" aria-label="التنقل الرئيسي على سطح المكتب">
      <p className="s2-side-title">مساحتي</p>
      <nav>{sideNav.map((item)=>{const Icon=item.icon;return <Link data-testid={`desktop-nav-${item.id}`} key={item.id} href={item.href} aria-current={active===item.id?"page":undefined} className={active===item.id?"is-active":""}><Icon size={20} aria-hidden="true"/><span>{item.label}</span></Link>})}</nav>
    </aside>

    <main className="v104-content">{children}</main>

    <nav className="v104-bottom-nav s2-bottom" aria-label="التنقل الرئيسي">
      {bottomNav.map(item=>{
        const Icon=item.icon;
        return <Link data-testid={`nav-${item.id}`} key={item.id} href={item.href} aria-current={active===item.id?"page":undefined} className={`${active===item.id?"is-active":""} ${item.id==="home"?"is-home":""}`}>
          <motion.span className="v104-bottom-icon" whileTap={reduce?undefined:{scale:.9}} transition={{duration:.12}}><Icon size={item.id==="home"?24:21} strokeWidth={active===item.id?2.4:2} aria-hidden="true"/></motion.span>
          <span className="v104-bottom-label">{item.label}</span>
        </Link>
      })}
    </nav>
  </div></MotionConfig>
}
