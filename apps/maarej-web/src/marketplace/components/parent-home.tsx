'use client';
// Parent area (demo): pick one of three children, then see that child's week, grades, teachers and groups,
// progress, identity journey and money transfers. Everything is demo data; "pay" only marks the item in this browser.
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {PublicMarketplaceShell} from './public-shell';
import {Mark,Marks,Scribble} from './fun';
import {SectionTabs} from './profile-kit';
import {WeekGrid} from './schedule';
import type {Block} from './schedule';
import {TeacherPortrait} from './teacher-card';
import {parentDemo} from '../adapters/parent-demo';
import type {Child,Transfer} from '../adapters/parent-demo';
import {teacherById,centerById,days,timeRange,hasProfile} from '../adapters/schedule';
import {swatchFor} from '../adapters/profile-demo';
import {subjectEmoji} from '../adapters/emoji';
import {identityDefinitions} from '../../data/identity-framework';
import s from './parent.module.css';

const money=(n:number)=>n.toLocaleString('ar-EG');
const statusLabel:Record<Transfer['status'],string>={paid:'✅ اتدفع',due:'⏳ مستحق',late:'⚠️ متأخر'};

export function ParentHome(){
 const [kid,setKid]=useState(0);
 const c=parentDemo.children[kid];
 return <PublicMarketplaceShell><div className={s.wrap}>
  <section className={s.hero} id="sec-kids" aria-labelledby="p-hello">
   <Marks items={[{e:'⭐',x:4,y:8,s:'md',a:'spin'},{e:'🎈',x:94,y:10,s:'md',a:'float'}]}/>
   <h1 id="p-hello">أهلًا يا {parentDemo.name.replace('أ. ','')} 👋</h1>
   <div className={s.kids} role="tablist" aria-label="الأبناء">{parentDemo.children.map((k,i)=>{const att=Math.round(k.attendance.present/(k.attendance.present+k.attendance.absent)*100);
    return <button key={k.id} type="button" role="tab" aria-selected={i===kid} className={s.kid} style={{'--kid':k.color} as React.CSSProperties} onClick={()=>setKid(i)}>
     <span className={s.kidFace} aria-hidden="true">{k.emoji}</span>
     <span className={s.kidText}><b>{k.name}</b><small>{k.grade}</small><span className={s.kidChips}><em>🔥 {k.streak}</em><em>✅ {att}%</em></span></span>
    </button>;})}</div>
  </section>
  <ChildView key={c.id} child={c}/>
  <p className={s.demo}>تجريبي · كل الأسماء والأرقام والتحويلات بيانات توضيحية</p>
 </div>
 <SectionTabs items={[{id:'sec-kids',label:'الأبناء',emoji:'👨‍👩‍👧'},{id:'sec-week',label:'الجدول',emoji:'📅'},{id:'sec-grades',label:'الدرجات',emoji:'📝'},{id:'sec-money',label:'المدفوعات',emoji:'💳'}]}/>
 </PublicMarketplaceShell>;
}

function ChildView({child:c}:{child:Child}){
 const [paid,setPaid]=useState<Set<string>>(new Set());
 const [history,setHistory]=useState(false);
 const order=[...new Set(c.groups.map(g=>g.teacherId))];
 const blocks:Block[]=c.groups.map(g=>{const t=teacherById(g.teacherId);return {id:g.id,day:g.day,start:g.start,dur:g.dur,tone:'booked',color:swatchFor(g.teacherId,order),title:`${subjectEmoji(g.subject)} ${g.subject}`,sub:t?.name,href:t&&hasProfile(t.id)?`/teachers/${t.id}`:undefined};});
 const att=Math.round(c.attendance.present/(c.attendance.present+c.attendance.absent)*100);
 const avg=Math.round(c.grades.reduce((a,g)=>a+g.score,0)/Math.max(1,c.grades.length));
 const transfers=useMemo(()=>c.transfers.map(t=>paid.has(t.id)?{...t,status:'paid' as const}:t),[c.transfers,paid]);
 const totalPaid=transfers.filter(t=>t.status==='paid').reduce((a,t)=>a+t.amount,0),open=transfers.filter(t=>t.status!=='paid');
 const idIdx=identityDefinitions.findIndex(d=>d.name===c.identity.name);
 const maxP=Math.max(...c.progress.map(p=>p.score));
 return <>
  <section className={s.card} style={{'--kid':c.color} as React.CSSProperties} aria-labelledby="kid-name">
   <div className={s.kidHead}><span className={s.bigFace} aria-hidden="true">{c.emoji}</span><div><h2 id="kid-name">{c.name}</h2><p>{c.grade}</p></div>
    <span className={s.idChip}>🧭 {c.identity.name} · {c.identity.stage}</span></div>
   <Scribble items={[{emoji:'✅',text:`الحضور ${att}%`,hl:'green'},{emoji:'📚',text:`الواجبات ${c.homework.done}/${c.homework.total}`,hl:'amber'},{emoji:'⭐',text:`المتوسط ${avg}%`,hl:'indigo'},{emoji:'🔥',text:`${c.streak} أيام ورا بعض`,hl:'pink'}]}/>
   <ul className={s.badges} aria-label="الشارات">{c.badges.map(b=><li key={b.name} data-on={b.earned}><span aria-hidden="true">{b.e}</span><small>{b.name}</small></li>)}</ul>
  </section>

  <section className={s.card} id="sec-week" aria-labelledby="p-week"><h2 id="p-week" className={s.h}><Mark e="📅" a="none" s="md"/>جدول {c.name}</h2>
   <WeekGrid label={`جدول ${c.name}`} blocks={blocks}/>
  </section>

  <section className={s.card} id="sec-grades" aria-labelledby="p-grades"><h2 id="p-grades" className={s.h}><Mark e="📝" a="none" s="md"/>الدرجات</h2>
   <ul className={s.grades}>{c.grades.map(g=><li key={g.subject}><span className={s.gHead}><b>{subjectEmoji(g.subject)} {g.subject}</b><em data-up={g.trend>=0}>{g.trend>=0?'▲':'▼'} {Math.abs(g.trend)}</em></span>
    <strong><bdi>{g.score}</bdi>%</strong><i className={s.bar}><i style={{width:`${g.score}%`}}/></i>
    <span className={s.exams}>{g.exams.map(x=><small key={x.name}>{x.name}: <bdi>{x.score}/{x.of}</bdi></small>)}</span></li>)}</ul>
  </section>

  <section className={s.card} id="sec-groups" aria-labelledby="p-groups"><h2 id="p-groups" className={s.h}><Mark e="🧑‍🏫" a="none" s="md"/>المدرسين والمجموعات</h2>
   <ul className={s.groups}>{c.groups.map(g=>{const t=teacherById(g.teacherId),ct=centerById(g.centerId);if(!t)return null;return <li key={g.id}>
    <Link href={`/teachers/${t.id}`} className={s.gTeacher}><TeacherPortrait teacher={t} className={s.gPhoto}/><span><b>{t.name}</b><small>{subjectEmoji(g.subject)} {g.subject}</small></span></Link>
    <span className={s.gMeta}><span>🗓️ {days[g.day]} · {timeRange(g.start,g.dur)}</span>{ct&&<Link href={`/centers/${ct.id}`}>🏫 {ct.name}</Link>}</span></li>;})}</ul>
  </section>

  <section className={s.card} id="sec-progress" aria-labelledby="p-progress"><h2 id="p-progress" className={s.h}><Mark e="📈" a="none" s="md"/>التقدّم</h2>
   <ol className={s.chart}>{c.progress.map(p=><li key={p.month}><b><bdi>{p.score}</bdi></b><i style={{height:`${Math.round(p.score/maxP*100)}%`}}/><small>{p.month}</small></li>)}</ol>
  </section>

  <section className={s.card} id="sec-identity" aria-labelledby="p-identity"><h2 id="p-identity" className={s.h}><Mark e="🧭" a="none" s="md"/>الهوية</h2>
   <ol className={s.path}>{identityDefinitions.map((d,i)=><li key={d.id} data-state={i<idIdx?'done':i===idIdx?'now':'next'}><span aria-hidden="true">{i<idIdx?'✅':i===idIdx?'📍':'🔒'}</span><b>{d.name}</b></li>)}</ol>
   <p className={s.idNow}>{c.name} دلوقتي <b>{c.identity.name}</b> في مرحلة <b>{c.identity.stage}</b> · الجاية: <b>{c.identity.next}</b></p>
   <div className={s.steps} aria-label={`${c.identity.steps} من ${c.identity.of}`}>{Array.from({length:c.identity.of},(_,i)=><i key={i} data-on={i<c.identity.steps}/>)}</div>
  </section>

  <section className={s.card} id="sec-money" aria-labelledby="p-money"><h2 id="p-money" className={s.h}><Mark e="💳" a="none" s="md"/>المدفوعات</h2>
   <div className={s.moneyTop}><div><small>اتدفع</small><b><bdi>{money(totalPaid)}</bdi> ج.م</b></div><div data-tone="due"><small>مستحق</small><b><bdi>{money(open.reduce((a,t)=>a+t.amount,0))}</bdi> ج.م</b></div></div>
   <ul className={s.transfers}>{(history?transfers:open).map(t=><li key={t.id} data-status={t.status}><span><b>{t.group}</b><small>{t.teacher} · {t.month}</small></span><span className={s.tSide}><b><bdi>{money(t.amount)}</bdi> ج.م</b><em>{statusLabel[t.status]}</em>
    {t.status!=='paid'&&<button type="button" onClick={()=>setPaid(v=>new Set(v).add(t.id))}>ادفع</button>}</span></li>)}</ul>
   {!open.length&&!history&&<p className={s.allPaid}>🎉 كله مدفوع</p>}
   <button type="button" className={s.more} onClick={()=>setHistory(v=>!v)}>{history?'المستحق بس':`كل التحويلات (${transfers.length})`}</button>
  </section>
 </>;
}
