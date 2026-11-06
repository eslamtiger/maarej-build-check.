'use client';
// Parent area frame: site header, a calm page body, and the section tabs (side list on desktop, bottom bar on phones).
// Deliberately plain: neutral colours, no stickers or wallpaper — the parent needs clear numbers, not motivation.
import Link from 'next/link';
import type {ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {LayoutDashboard,GraduationCap,HeartHandshake,UsersRound,Wallet,Settings} from 'lucide-react';
import {SiteHeader} from '@/components/site/site-header';
import {parentDemo} from '../../adapters/parent-demo';
import {useParent,pickChild} from '../../adapters/parent-state';
import p from './parent.module.css';

const tabs=[
 {href:'/parent',label:'الرئيسية',Icon:LayoutDashboard},
 {href:'/parent/learning',label:'المستوى التعليمي',short:'التعليم',Icon:GraduationCap},
 {href:'/parent/upbringing',label:'التربية',Icon:HeartHandshake},
 {href:'/parent/teachers',label:'المدرسين والسناتر',short:'المدرسين',Icon:UsersRound},
 {href:'/parent/finance',label:'المالية',Icon:Wallet},
 {href:'/parent/settings',label:'الإعدادات',Icon:Settings},
] as const;

export function ParentShell({title,children,childPicker=false}:{title:string;children:ReactNode;childPicker?:boolean}){
 const path=(usePathname()??'/parent').replace(/\/$/,'')||'/parent';
 return <div className={p.shell} dir="rtl">
  <SiteHeader/>
  <div className={p.frame}>
   <nav className={p.side} aria-label="أقسام ولي الأمر"><small>ولي الأمر</small>{tabs.map(({href,label,Icon})=><Link key={href} href={href} aria-current={path===href?'page':undefined}><Icon size={18} aria-hidden="true"/>{label}</Link>)}</nav>
   <main className={p.main}>
    <header className={p.pageHead}><h1>{title}</h1>{childPicker&&<ChildPicker/>}</header>
    {children}
    <p className={p.demo}>نسخة تجريبية · كل الأسماء والأرقام والمبالغ بيانات توضيحية، ومفيش فلوس حقيقية</p>
   </main>
  </div>
  <nav className={p.bottom} aria-label="أقسام ولي الأمر">{tabs.map(({href,label,Icon,...t})=><Link key={href} href={href} aria-current={path===href?'page':undefined}><Icon size={20} aria-hidden="true"/><span>{'short' in t?t.short:label}</span></Link>)}</nav>
 </div>;
}

// Which child the page is about. The choice is remembered across the parent pages.
export function ChildPicker(){
 const {child}=useParent();
 return <div className={p.picker} role="tablist" aria-label="اختار الابن">{parentDemo.children.map(c=><button key={c.id} type="button" role="tab" aria-selected={c.id===child.id} onClick={()=>pickChild(c.id)}><span className={p.initial} aria-hidden="true">{c.initial}</span>{c.name}</button>)}</div>;
}
export const Avatar=({c,size=44}:{c:{initial:string};size?:number})=><span className={p.avatar} style={{width:size,height:size,fontSize:size*.42}} aria-hidden="true">{c.initial}</span>;
export function Trend({v}:{v:number}){return <span className={p.trend} data-dir={v>0?'up':v<0?'down':'flat'}>{v>0?'▲':v<0?'▼':'–'} <bdi>{Math.abs(v)}%</bdi></span>;}
export function Meter({value,tone}:{value:number;tone?:'good'|'mid'|'low'}){const t=tone??(value>=80?'good':value>=60?'mid':'low');return <span className={p.meter} data-tone={t}><i style={{width:`${Math.max(2,Math.min(100,value))}%`}}/></span>;}
export function Card({title,action,children,className}:{title?:string;action?:ReactNode;children:ReactNode;className?:string}){
 return <section className={`${p.card} ${className??''}`}>{(title||action)&&<div className={p.cardHead}>{title&&<h2>{title}</h2>}{action}</div>}{children}</section>;
}
