'use client';
// Parent area state kept only in this browser (demo): chosen child, wallet moves, paid items and settings.
import {useSyncExternalStore} from 'react';
import {parentDemo,parentLedger} from './parent-demo';
import type {LedgerItem} from './parent-demo';

export type ParentSettings={absence:boolean;grades:boolean;payments:boolean;weekly:boolean;childPays:boolean;limit:number;defaultChild:string};
type State={child:string;ledger:LedgerItem[];paid:string[];settings:ParentSettings};
const KEY='maarej.parent',EVT='maarej-parent';
const initial:State={child:parentDemo.children[0].id,ledger:[],paid:[],settings:{absence:true,grades:true,payments:true,weekly:false,childPays:true,limit:500,defaultChild:parentDemo.children[0].id}};
const read=():string=>{try{return localStorage.getItem(KEY)??'';}catch{return '';}};
const parse=(s:string):State=>{try{const v=s?JSON.parse(s):{};return {...initial,...v,settings:{...initial.settings,...(v.settings??{})}};}catch{return initial;}};
const subscribe=(cb:()=>void)=>{addEventListener(EVT,cb);addEventListener('storage',cb);return()=>{removeEventListener(EVT,cb);removeEventListener('storage',cb);};};
const write=(f:(s:State)=>State)=>{const next=f(parse(read()));try{localStorage.setItem(KEY,JSON.stringify(next));}catch{}dispatchEvent(new Event(EVT));};

export function useParent(){
 const s=parse(useSyncExternalStore(subscribe,read,()=>''));
 const ledger=[...s.ledger,...parentLedger];
 // Wallet = demo opening balance + this browser's moves (top-ups add, transfers and payments subtract).
 const moved=s.ledger.reduce((a,l)=>a+(l.kind==='topup'?l.amount:-l.amount),0);
 const kidExtra=(id:string)=>s.ledger.filter(l=>l.kind==='toChild'&&l.childId===id).reduce((a,l)=>a+l.amount,0);
 return {...s,ledger,wallet:parentDemo.wallet+moved,kidWallet:(id:string)=>(parentDemo.children.find(c=>c.id===id)?.wallet??0)+kidExtra(id),
  child:parentDemo.children.find(c=>c.id===s.child)??parentDemo.children[0]};
}
const today=()=>{const d=new Date();return `${d.getDate()}/${d.getMonth()+1}`;};
export const pickChild=(id:string)=>write(s=>({...s,child:id}));
export const topUp=(amount:number)=>write(s=>({...s,ledger:[{id:`t${Date.now()}`,kind:'topup',amount,label:'شحن الرصيد',date:today()},...s.ledger]}));
export const sendToChild=(childId:string,amount:number,name:string)=>write(s=>({...s,ledger:[{id:`c${Date.now()}`,kind:'toChild',amount,childId,label:`تحويل ل${name}`,date:today()},...s.ledger]}));
export const payItem=(id:string,amount:number,label:string,childId:string)=>write(s=>({...s,paid:[...s.paid,id],ledger:[{id:`p${Date.now()}`,kind:'payment',amount,childId,label,date:today()},...s.ledger]}));
export const saveSettings=(patch:Partial<ParentSettings>)=>write(s=>({...s,settings:{...s.settings,...patch}}));
