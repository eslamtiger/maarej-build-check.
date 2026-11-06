'use client';
// Saved teachers, centers and study spaces, kept only in this browser (demo). The same list shows on the "المحفوظات" page.
import {useSyncExternalStore} from 'react';
export type SavedKind='teacher'|'center'|'space';
export type SavedItem={kind:SavedKind;id:string};
const KEY='maarej.saved',EVT='maarej-saved';
const read=():string=>{try{return localStorage.getItem(KEY)??'[]';}catch{return '[]';}};
const parse=(s:string):SavedItem[]=>{try{const v=JSON.parse(s);return Array.isArray(v)?v:[];}catch{return [];}};
const subscribe=(cb:()=>void)=>{addEventListener(EVT,cb);addEventListener('storage',cb);return()=>{removeEventListener(EVT,cb);removeEventListener('storage',cb);};};
export const useSaved=()=>parse(useSyncExternalStore(subscribe,read,()=>'[]'));
export function toggleSaved(item:SavedItem){const list=parse(read()),has=list.some(x=>x.kind===item.kind&&x.id===item.id);const next=has?list.filter(x=>!(x.kind===item.kind&&x.id===item.id)):[...list,item];try{localStorage.setItem(KEY,JSON.stringify(next));}catch{}dispatchEvent(new Event(EVT));}
