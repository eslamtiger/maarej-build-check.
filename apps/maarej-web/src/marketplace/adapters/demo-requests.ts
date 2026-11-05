'use client';
// Demo requests (room reservations, group joins) kept only in this browser. No payment, nothing is sent anywhere.
import {useSyncExternalStore} from 'react';

export type RoomRequest={kind:'room';id:string;centerId:string;room:number;days:number[];start:number;end:number;repeat:'once'|'weekly';period:'term1'|'term2'|'year';collect:boolean;createdAt:string};
export type JoinRequest={kind:'join';id:string;sessionId:string;createdAt:string};
export type DemoRequest=RoomRequest|JoinRequest;

const KEY='maarej.demoRequests',EVT='maarej-demo-requests';
const read=():string=>{try{return localStorage.getItem(KEY)??'[]';}catch{return '[]';}};
const parse=(s:string):DemoRequest[]=>{try{const v=JSON.parse(s);return Array.isArray(v)?v:[];}catch{return [];}};
const subscribe=(cb:()=>void)=>{addEventListener(EVT,cb);addEventListener('storage',cb);return()=>{removeEventListener(EVT,cb);removeEventListener('storage',cb);};};
export function useDemoRequests(){const raw=useSyncExternalStore(subscribe,read,()=>'[]');return parse(raw);}
export function addDemoRequest(r:DemoRequest){const list=parse(read());list.push(r);try{localStorage.setItem(KEY,JSON.stringify(list));}catch{}dispatchEvent(new Event(EVT));}
export const newId=()=>Math.random().toString(36).slice(2,9);
