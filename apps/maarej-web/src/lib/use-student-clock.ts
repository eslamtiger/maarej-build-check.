"use client";
import {useSyncExternalStore} from "react";
import {cairoClock,studentClockMode,initialStudentClock,type StudentClock} from "./student-clock";
let current:StudentClock=initialStudentClock;
const listeners=new Set<()=>void>();
let timer:ReturnType<typeof setInterval>|undefined;
function refresh(){const next=studentClockMode==="demo"?initialStudentClock:cairoClock(new Date());if(next.date!==current.date||next.minutes!==current.minutes){current=next;listeners.forEach(fn=>fn());}}
function subscribe(fn:()=>void){listeners.add(fn);if(listeners.size===1){refresh();timer=setInterval(refresh,60000);window.addEventListener("focus",refresh);}return()=>{listeners.delete(fn);if(!listeners.size){clearInterval(timer);window.removeEventListener("focus",refresh);}};}
export function useStudentClock(){return useSyncExternalStore(subscribe,()=>current,()=>initialStudentClock);}
