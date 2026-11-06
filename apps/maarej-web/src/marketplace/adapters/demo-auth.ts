'use client';
// Demo sign-in kept only in this browser (no server, no password). Anyone — student, parent or teacher — can reserve a room once signed in.
import {useSyncExternalStore} from 'react';

export type DemoRole='student'|'parent'|'teacher';
export type DemoUser={name:string;phone:string;role:DemoRole};
const KEY='maarej.demoUser',EVT='maarej-demo-user';
const read=():string=>{try{return localStorage.getItem(KEY)??'';}catch{return '';}};
const subscribe=(cb:()=>void)=>{addEventListener(EVT,cb);addEventListener('storage',cb);return()=>{removeEventListener(EVT,cb);removeEventListener('storage',cb);};};
export function useDemoUser():DemoUser|null{const raw=useSyncExternalStore(subscribe,read,()=>'');try{return raw?JSON.parse(raw):null;}catch{return null;}}
export function signIn(u:DemoUser){try{localStorage.setItem(KEY,JSON.stringify(u));}catch{}dispatchEvent(new Event(EVT));}
export function signOut(){try{localStorage.removeItem(KEY);}catch{}dispatchEvent(new Event(EVT));}
// Sends a visitor who is not signed in to the sign-in page, then back to where they were.
export function loginUrl(next:string){return `/login?next=${encodeURIComponent(next)}`;}
