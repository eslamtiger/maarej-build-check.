"use client";
// Gamification strip on the student home (demo): week streak, today's three quests that earn stars, and a badge shelf.
// Stars and streak are illustrative and kept only in this browser; there is no ranking between students, and nothing here ever goes down.
import {useEffect,useState} from "react";
import {Mark,Marks} from "@/marketplace/components/fun";
import g from "./game-strip.module.css";

type Quest={id:string;e:string;title:string};
type Badge={id:string;name:string;earned:boolean;progress?:number};
const KEY="maarej.quests";
const today=()=>new Date().toISOString().slice(0,10);
const badgeEmoji=["🏅","🎯","📚","⏰","🤝","🚀","🧠","🌟"];
const weekDays=["سبت","أحد","اتنين","تلات","أربع","خميس","جمعة"];

export function GameStrip({quests,badges,streak=6,baseStars=34}:{quests:Quest[];badges:Badge[];streak?:number;baseStars?:number}){
 const [done,setDone]=useState<string[]>([]);
 const [pop,setPop]=useState<string|null>(null);
 useEffect(()=>{try{const v=JSON.parse(localStorage.getItem(KEY)??"{}");if(v.day===today())setDone(v.done??[]);}catch{}},[]);
 const toggle=(id:string)=>{if(done.includes(id))return;const next=[...done,id];setDone(next);setPop(id);setTimeout(()=>setPop(null),900);try{localStorage.setItem(KEY,JSON.stringify({day:today(),done:next}));}catch{}};
 const stars=baseStars+done.length*5,all=done.length===quests.length;
 const todayIdx=(new Date().getDay()+1)%7;
 return <section className={g.strip} aria-labelledby="game-h">
  <Marks items={[{e:"✨",x:3,y:6,s:"sm",a:"pulse"},{e:"🎮",x:96,y:8,s:"md",a:"wiggle"}]}/>
  <h2 id="game-h" className={g.h}><Mark e="🏆" a="none" s="md"/>تحدّي النهارده</h2>
  <div className={g.top}>
   <div className={g.tile} data-tone="fire"><Mark e="🔥" a="pulse" s="lg"/><b><bdi>{streak}</bdi></b><small>أيام ورا بعض</small>
    <span className={g.week} aria-hidden="true">{weekDays.map((d,i)=><i key={d} data-on={(i<=todayIdx&&i>todayIdx-streak)||undefined} title={d}/>)}</span></div>
   <div className={g.tile} data-tone="star"><Mark e="⭐" a="spin" s="lg"/><b key={stars} className={g.count}><bdi>{stars}</bdi></b><small>نجمة الأسبوع ده</small></div>
  </div>
  <ul className={g.quests}>{quests.map(q=>{const on=done.includes(q.id);return <li key={q.id}>
   <button type="button" aria-pressed={on} onClick={()=>toggle(q.id)} className={g.quest}>
    <span className={g.qIcon} aria-hidden="true">{on?"✅":q.e}</span><span className={g.qText}>{q.title}</span><em>+5 ⭐</em>
    {pop===q.id&&<span className={g.burst} aria-hidden="true">🎉</span>}
   </button></li>;})}</ul>
  {all&&<p className={g.allDone}>🥳 خلّصت تحديات النهارده!</p>}
  <ul className={g.badges} aria-label="شاراتك">{badges.slice(0,6).map((b,i)=><li key={b.id} data-on={b.earned}><span aria-hidden="true">{b.earned?badgeEmoji[i%badgeEmoji.length]:"🔒"}</span><small>{b.name}</small>{!b.earned&&b.progress!==undefined&&<i><i style={{width:`${b.progress}%`}}/></i>}</li>)}</ul>
  <p className={g.demo}>تجريبي · النجوم مش بتقل، ومفيش ترتيب بين الطلاب</p>
 </section>;
}
