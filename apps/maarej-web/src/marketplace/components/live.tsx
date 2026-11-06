'use client';
// Live status chips that depend on "now" (so they render after mount): open-now for centers/spaces, next free group for teachers.
import {useEffect,useState} from 'react';
import {days,OPEN,CLOSE,hourLabel,sessionsForTeacher} from '../adapters/schedule';
import l from './live.module.css';

function useNow(){const [now,setNow]=useState<Date|null>(null);useEffect(()=>{setNow(new Date());const t=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(t);},[]);return now;}
// JS getDay(): Sunday=0. Our week starts on Saturday.
const dayIdx=(d:Date)=>(d.getDay()+1)%7;

export function OpenNow({className}:{className?:string}){
 const now=useNow();
 if(!now)return null;
 const h=now.getHours()+now.getMinutes()/60,open=h>=OPEN&&h<CLOSE;
 return <span className={`${l.open} ${className??''}`} data-open={open}><i aria-hidden="true"/>{open?`مفتوح · بيقفل ${hourLabel(CLOSE)}`:h<OPEN?`مقفول · بيفتح ${hourLabel(OPEN)}`:`مقفول · بيفتح بكرة ${hourLabel(OPEN)}`}</span>;
}

export function NextSlot({teacherId,className}:{teacherId:string;className?:string}){
 const now=useNow();
 if(!now)return null;
 const today=dayIdx(now),nowH=now.getHours()+now.getMinutes()/60;
 const open=sessionsForTeacher(teacherId).filter(x=>x.enrolled<x.capacity);
 let best:{x:(typeof open)[number];away:number}|null=null;
 for(const x of open){let away=(x.day-today+7)%7;if(away===0&&x.start<=nowH)away=7;const score=away*24+x.start;if(!best||score<best.away*24+best.x.start)best={x,away};}
 if(!best)return <span className={`${l.next} ${className??''}`} data-full="true">🔒 مجموعاته كاملة</span>;
 const when=best.away===0?'النهارده':best.away===1?'بكرة':days[best.x.day];
 const left=best.x.capacity-best.x.enrolled;
 return <span className={`${l.next} ${className??''}`}>⏰ أقرب حصة: <b>{when} {hourLabel(best.x.start)}</b>{left<=5&&<em>باقي {left}</em>}</span>;
}
