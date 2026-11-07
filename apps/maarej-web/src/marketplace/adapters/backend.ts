'use client';
// Connection to the shared Maarej database (Supabase) without extra packages: Auth and REST over fetch.
// The session lives in this browser; every read and write goes through the database's row-level security
// and its functions, so the page can only see and change what the signed-in person is allowed to.
import {useSyncExternalStore} from 'react';

const URL_=process.env.NEXT_PUBLIC_SUPABASE_URL??'';
const KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'';
export const hasBackend=Boolean(URL_&&KEY);

export type Session={access_token:string;refresh_token:string;expires_at:number;user:{id:string;email?:string;user_metadata?:Record<string,unknown>};role?:string;name?:string};
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
 const next={...fromAuth(b),role:s.role,name:s.name};save(next);return next.access_token;
}

// First sign-in after sign-up: create the profile (and the student row) from the sign-up details.
async function ensureProfile(s:Session){
 const rows=await call(`/rest/v1/profiles?id=eq.${s.user.id}&select=role,full_name`,{},s.access_token);
 if(rows.length)return rows[0];
 const m=s.user.user_metadata??{},role=['student','parent'].includes(String(m.role))?String(m.role):'student';
 const [p]=await call('/rest/v1/profiles',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({id:s.user.id,role,full_name:String(m.full_name??'مستخدم'),phone:m.phone??null})},s.access_token);
 if(role==='student')await call('/rest/v1/students',{method:'POST',body:JSON.stringify({user_id:s.user.id})},s.access_token);
 return p;
}
export async function signIn(email:string,password:string){
 const s=fromAuth(await call('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})}));
 const p=await ensureProfile(s);const full={...s,role:p.role,name:p.full_name};save(full);return full;
}
export async function signUp(email:string,password:string,meta:{full_name:string;phone:string;role:'student'|'parent'}){
 const b=await call('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:meta})});
 if(!b.access_token)return null; // email confirmation is on: they confirm, then sign in
 const s=fromAuth(b);const p=await ensureProfile(s);const full={...s,role:p.role,name:p.full_name};save(full);return full;
}
export function signOut(){const s=currentSession();save(null);if(s)call('/auth/v1/logout',{method:'POST'},s.access_token).catch(()=>{});}

export async function rpc<T=unknown>(fn:string,args:Record<string,unknown>={}):Promise<T>{return call(`/rest/v1/rpc/${fn}`,{method:'POST',body:JSON.stringify(args)},await token());}
export async function select<T=any>(table:string,query:string):Promise<T[]>{return call(`/rest/v1/${table}?${query}`,{},await token());}
export async function update(table:string,match:string,patch:Record<string,unknown>){return call(`/rest/v1/${table}?${match}`,{method:'PATCH',body:JSON.stringify(patch)},await token());}
export async function insert(table:string,row:Record<string,unknown>){return call(`/rest/v1/${table}`,{method:'POST',body:JSON.stringify(row)},await token());}
