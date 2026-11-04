"use client";
import { useMemo, useSyncExternalStore } from "react";
export type DemoTransaction={id:string;title:string;amount:number;status:string;createdAt:string;reference:string;kind:"pay"|"topup"|"withdraw";groupId?:string;balanceChange:number;method?:string;fundingSource?:string;approvalRequired?:boolean};
export type StudentAppState={submissions:Record<string,{text:string;submittedAt:string}>;readNotifications:string[];transactions:DemoTransaction[];preferences:{notifications:boolean;reduceMotion:boolean;largeText:boolean};planCancelled:boolean};
const initial:StudentAppState={submissions:{},readNotifications:[],transactions:[],preferences:{notifications:true,reduceMotion:false,largeText:false},planCancelled:false};
const key="maarej-student-v107";const event="maarej-student-change";
function snapshot(){try{return localStorage.getItem(key) ?? "";}catch{return "";}}
function subscribe(callback:()=>void){window.addEventListener(event,callback);window.addEventListener("storage",callback);return()=>{window.removeEventListener(event,callback);window.removeEventListener("storage",callback);};}
function parse(value:string):StudentAppState{try{const saved=JSON.parse(value);return {...initial,...saved,preferences:{...initial.preferences,...saved.preferences}};}catch{return initial;}}
export function updateStudentAppState(update:(state:StudentAppState)=>StudentAppState){const state=update(parse(snapshot()));try{localStorage.setItem(key,JSON.stringify(state));}catch{}window.dispatchEvent(new Event(event));}
export function useStudentAppState(){const value=useSyncExternalStore(subscribe,snapshot,()=>"");return useMemo(()=>parse(value),[value]);}
