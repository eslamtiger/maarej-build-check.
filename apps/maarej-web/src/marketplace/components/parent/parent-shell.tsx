'use client';
// Parent area frame: site header, the section tabs (side list on desktop, bottom bar on phones) and the child tabs.
// Practical but warm: soft tints, one emoji per section, clear numbers. No stickers or animation.
import Link from 'next/link';
import type {ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {Home,BookOpen,Sprout,Award,UsersRound,Wallet,UserRound} from 'lucide-react';
import {SiteHeader} from '@/components/site/site-header';
import {pickKid} from '../../adapters/parent-data';
import type {Kid,ParentData} from '../../adapters/parent-data';
import p from './parent.module.css';

const tabs=[
 {href:'/parent',label:'الرئيسية',Icon:Home},
 {href:'/parent/learning',label:'المستوى التعليمي',short:'التعليم',Icon:BookOpen},
 {href:'/parent/upbringing',label:'التربية',Icon:Sprout},
 {href:'/parent/rewards',label:'المكافآت والشارات',short:'المكافآت',Icon:Award},
 {href:'/parent/teachers',label:'المدرسين والسناتر',short:'المدرسين',Icon:UsersRound},
 {href:'/parent/finance',label:'المالية',Icon:Wallet},
 {href:'/parent/settings',label:'حسابي والإعدادات',short:'حسابي',Icon:UserRound},
] as const;

export function ParentShell({title,emoji,children,data,kid,live,error,showKids=true}:{title:string;emoji:string;children:ReactNode;data?:ParentData|null;kid?:Kid;live?:boolean;error?:string;showKids?:boolean}){
 const path=(usePathname()??'/parent').replace(/\/$/,'')||'/parent';
 return <div className={p.shell} dir="rtl">
  <SiteHeader/>
  <div className={p.frame}>
   <nav className={p.side} aria-label="أقسام ولي الأمر"><small>👨‍👩‍👧 ولي الأمر</small>{tabs.map(({href,label,Icon})=><Link key={href} href={href} aria-current={path===href?'page':undefined}><Icon size={18} aria-hidden="true"/>{label}</Link>)}</nav>
   <main className={p.main}>
    <header className={p.pageHead}><h1><span aria-hidden="true">{emoji}</span>{title}</h1><span className={p.mode} data-live={live}>{live?'● متوصّل بحسابك':'نسخة تجريبية'}</span></header>
    {showKids&&data&&data.children.length>0&&<KidTabs kids={data.children} active={kid?.id}/>}
    {error?<p className={p.error} role="alert">{error}</p>:!data?<p className={p.loading}>بنجيب البيانات…</p>:children}
   </main>
  </div>
  <nav className={p.bottom} aria-label="أقسام ولي الأمر">{tabs.map(({href,label,Icon,...t})=><Link key={href} href={href} aria-current={path===href?'page':undefined}><Icon size={20} aria-hidden="true"/><span>{'short' in t?t.short:label}</span></Link>)}</nav>
 </div>;
}

// The children as tabs with their photo; the choice is remembered across the parent pages.
function KidTabs({kids,active}:{kids:Kid[];active?:string}){
 return <div className={p.kids} role="tablist" aria-label="الأبناء">{kids.map((k,i)=><button key={k.id} type="button" role="tab" aria-selected={k.id===active} onClick={()=>pickKid(k.id)} data-tone={i%3}>
  <KidPhoto kid={k} size={44}/><span><b>{k.name.split(' ')[0]}</b><small>{k.stage}</small></span></button>)}</div>;
}
export function KidPhoto({kid,size=44}:{kid:{name:string;avatar?:string};size?:number}){
 const isUrl=kid.avatar?.startsWith('http');
 return <span className={p.photoCircle} style={{width:size,height:size,fontSize:size*.5}} aria-hidden="true">{isUrl?<img src={kid.avatar} alt=""/>:kid.avatar??kid.name.charAt(0)}</span>;
}
export function Card({title,emoji,tone,action,children,className,id}:{title?:string;emoji?:string;tone?:'blue'|'green'|'amber'|'pink'|'violet'|'gray';action?:ReactNode;children:ReactNode;className?:string;id?:string}){
 return <section className={`${p.card} ${className??''}`} data-tone={tone} id={id}>{(title||action)&&<div className={p.cardHead}>{title&&<h2>{emoji&&<span className={p.cardEmoji} aria-hidden="true">{emoji}</span>}{title}</h2>}{action}</div>}{children}</section>;
}
export const egp=(n:number)=><><bdi>{Math.round(n).toLocaleString('ar-EG')}</bdi> ج.م</>;
export function Meter({value}:{value:number}){const t=value>=80?'good':value>=60?'mid':'low';return <span className={p.meter} data-tone={t}><i style={{width:`${Math.max(2,Math.min(100,value))}%`}}/></span>;}
export function Empty({children}:{children:ReactNode}){return <p className={p.empty}>{children}</p>;}
