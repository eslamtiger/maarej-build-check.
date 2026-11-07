'use client';
// Connection to the shared Maarej database (Supabase) without extra packages: Auth and REST over fetch.
// The session lives in this browser; every read and write goes through the database's row-level security
// and its functions, so the page can only see and change what the signed-in person is allowed to.
import {useSyncExternalStore} from 'react';

const URL_=process.env.NEXT_PUBLIC_SUPABASE_URL??'';
const KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'';
export const hasBackend=Boolean(URL_&&KEY);

export type Session={access_token:string;refresh_token:string;expires_at:number;user:{id:string;email?:string;user_metadata?:Record<string,unknown>};role?:string;name?:string;demo?:boolean};
const SKEY='maarej.session',EVT='maarej-session';
const readRaw=():string=>{try{return localStorage.getItem(SKEY)??'';}catch{return '';}};
const parse=(s:string):Session|null=>{try{return s?JSON.parse(s):null;}catch{return null;}};
const save=(s:Session|null)=>{try{s?localStorage.setItem(SKEY,JSON.stringify(s)):localStorage.removeItem(SKEY);}catch{}dispatchEvent(new Event(EVT));};
const subscribe=(cb:()=>void)=>{addEventListener(EVT,cb);addEventListener('storage',cb);return()=>{removeEventListener(EVT,cb);removeEventListener('storage',cb);};};
export const useSession=()=>parse(useSyncExternalStore(subscribe,readRaw,()=>''));
export const currentSession=()=>parse(readRaw());

// Supabase returns Postgres error text (our functions raise Arabic messages); show that text as is.
async function call(path:string,init:RequestInit={},token?:string){
 if(!hasBackend)throw new Error('الموقع مش متوصّل بالداتابيز');
 const res=await fetch(URL_+path,{...init,headers:{apikey:KEY,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}),...(init.headers??{})}});
 const text=await res.text();const body=text?JSON.parse(text):null;
 if(!res.ok)throw new Error(body?.message??body?.msg??body?.error_description??body?.error??'حصلت مشكلة');
 return body;
}
const fromAuth=(b:any):Session=>({access_token:b.access_token,refresh_token:b.refresh_token,expires_at:Math.floor(Date.now()/1000)+(b.expires_in??3600),user:b.user});

async function token(){
 const s=currentSession();if(!s)throw new Error('لازم تسجّل دخول');
 if(s.expires_at-60>Date.now()/1000)return s.access_token;
 const b=await call('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:s.refresh_token})});
 const next={...fromAuth(b),role:s.role,name:s.name,demo:s.demo};save(next);return next.access_token;
}

// First sign-in after sign-up: create the profile (and the student row) from the sign-up details,
// then fill the extra details given in the sign-up form (kept in the account metadata until now).
async function ensureProfile(s:Session){
 const rows=await call(`/rest/v1/profiles?id=eq.${s.user.id}&select=role,full_name`,{},s.access_token);
 if(rows.length)return rows[0];
 const m=(s.user.user_metadata??{}) as Record<string,any>,role=['student','parent'].includes(String(m.role))?String(m.role):'student';
 const [p]=await call('/rest/v1/profiles',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({id:s.user.id,role,full_name:String(m.full_name??'مستخدم'),phone:m.phone??null})},s.access_token);
 if(role==='student')await call('/rest/v1/students',{method:'POST',body:JSON.stringify({user_id:s.user.id})},s.access_token);
 const tryIt=(f:()=>Promise<unknown>)=>f().catch(()=>{}); // a missing optional column must not block the account
 const pick=(keys:string[])=>Object.fromEntries(keys.filter(k=>m[k]!==undefined&&m[k]!=='').map(k=>[k,m[k]]));
 await tryIt(()=>call(`/rest/v1/profiles?id=eq.${s.user.id}`,{method:'PATCH',body:JSON.stringify(pick(['birth_date','gender','governorate','area','relation','job','whatsapp','phone2']))},s.access_token));
 if(role==='student')await tryIt(()=>call(`/rest/v1/students?user_id=eq.${s.user.id}`,{method:'PATCH',body:JSON.stringify(pick(['stage','grade','education_system','school_name']))},s.access_token));
 if(role==='parent'&&Array.isArray(m.children))for(const ph of m.children)await tryIt(()=>call('/rest/v1/rpc/guardian_link_child_by_phone',{method:'POST',body:JSON.stringify({p_phone:ph})},s.access_token));
 return p;
}
export async function signIn(email:string,password:string,demo=false){
 const s=fromAuth(await call('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})}));
 const p=await ensureProfile(s);const full={...s,role:p.role,name:p.full_name,demo};save(full);return full;
}
export async function signUp(email:string,password:string,meta:Record<string,unknown>&{full_name:string;role:'student'|'parent'}){
 const b=await call('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:meta})});
 if(!b.access_token)return null; // email confirmation is on: they confirm, then sign in
 const s=fromAuth(b);const p=await ensureProfile(s);const full={...s,role:p.role,name:p.full_name};save(full);return full;
}
// Sign-in is optional for now: pages that need an account open a shared demo account instead (clearly labelled).
export const DEMO={parent:'parent@demo.maarej.app',student:'youssef@demo.maarej.app',password:'Maarej2026!'};
let demoPending:Promise<Session>|null=null;
export async function ensureDemo(role:'parent'|'student'){
 const s=currentSession();if(s&&(s.role===role||!s.demo))return s;
 demoPending??=signIn(DEMO[role],DEMO.password,true).finally(()=>{demoPending=null;});
 return demoPending;
}
export function signOut(){const s=currentSession();save(null);if(s)call('/auth/v1/logout',{method:'POST'},s.access_token).catch(()=>{});}

export async function rpc<T=unknown>(fn:string,args:Record<string,unknown>={}):Promise<T>{return call(`/rest/v1/rpc/${fn}`,{method:'POST',body:JSON.stringify(args)},await token());}
export async function select<T=any>(table:string,query:string):Promise<T[]>{return call(`/rest/v1/${table}?${query}`,{},await token());}
export async function update(table:string,match:string,patch:Record<string,unknown>){return call(`/rest/v1/${table}?${match}`,{method:'PATCH',body:JSON.stringify(patch)},await token());}
export async function insert(table:string,row:Record<string,unknown>,upsert=false){return call(`/rest/v1/${table}`,{method:'POST',headers:upsert?{Prefer:'resolution=merge-duplicates'}:{},body:JSON.stringify(row)},await token());}

/* ---------- Public writes and reads (no account needed) ---------- */
export function deviceId(){try{let d=localStorage.getItem('maarej.device');if(!d){d=crypto.randomUUID?.()??String(Math.random()).slice(2);localStorage.setItem('maarej.device',d);}return d;}catch{return 'no-storage';}}
async function optToken(){try{return currentSession()?await token():undefined;}catch{return undefined;}}
export async function publicInsert(table:string,row:Record<string,unknown>){return call(`/rest/v1/${table}`,{method:'POST',body:JSON.stringify({device_id:deviceId(),...row})},await optToken());}
export async function publicRpc<T=unknown>(fn:string,args:Record<string,unknown>={}):Promise<T>{return call(`/rest/v1/rpc/${fn}`,{method:'POST',body:JSON.stringify(args)},await optToken());}
// Fire-and-forget record of what visitors do (search, booking, join, review, save). Never blocks the page.
export function track(table:string,row:Record<string,unknown>){if(!hasBackend)return;publicInsert(table,row).catch(()=>{});}
