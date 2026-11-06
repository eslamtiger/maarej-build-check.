'use client';
// Reviews written in this browser (demo): stars + comment per teacher / center / study space. Shown first in the list.
import {useSyncExternalStore} from 'react';
export type MyReview={target:string;name:string;role:'students'|'parents'|'teachers'|'centers';rating:number;text:string;at:string};
const KEY='maarej.myReviews',EVT='maarej-my-reviews';
const read=():string=>{try{return localStorage.getItem(KEY)??'[]';}catch{return '[]';}};
const parse=(s:string):MyReview[]=>{try{const v=JSON.parse(s);return Array.isArray(v)?v:[];}catch{return [];}};
const subscribe=(cb:()=>void)=>{addEventListener(EVT,cb);addEventListener('storage',cb);return()=>{removeEventListener(EVT,cb);removeEventListener('storage',cb);};};
export const useMyReviews=(target:string)=>parse(useSyncExternalStore(subscribe,read,()=>'[]')).filter(r=>r.target===target);
export function addMyReview(r:MyReview){const list=parse(read());list.push(r);try{localStorage.setItem(KEY,JSON.stringify(list));}catch{}dispatchEvent(new Event(EVT));}
