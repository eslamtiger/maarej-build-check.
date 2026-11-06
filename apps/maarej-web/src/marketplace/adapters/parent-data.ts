'use client';
// One shape for the parent area, filled either from the database (signed in as a parent) or from the demo family.
// Live mode: guardian_overview() + the money / badge / goal functions. Demo mode: the same actions change a copy
// kept in memory only, so the pages behave the same and nothing pretends to be saved.
import {useCallback,useEffect,useState,useSyncExternalStore} from 'react';
import {hasBackend,useSession,rpc,update,insert} from './backend';
import {parentDemo} from './parent-demo';
import {teacherById,centerById} from './schedule';
import {demoContact} from './profile-demo';

export type Money={balance:number;reward:number;free:number};
export type Invoice={id:string;period:string;amount:number;paid:number;status:'due'|'partial'|'paid'|'overdue'|'waived';due?:string;payments:{amount:number;method:string;at:string}[]};
export type Group={id:string;name:string;subject:string;price:number;online:boolean;center?:string;
 teacher:{id:string;name:string;phone?:string;whatsapp?:string;avatar?:string};schedule:{day:number;start:string;end:string}[];monthSessions:number;
 attendance:{present:number;absent:number;late:number};homework:{done:number;total:number};exams:{title:string;date?:string;max:number;score:number|null}[];invoices:Invoice[]};
export type Badge={id:string;name:string;icon:string;category:'study'|'behavior';from?:string;fromRole?:string;note?:string;at:string};
export type Reward={id:string;title:string;condition?:string;amount:number;status:'funded'|'released'|'cancelled';kind:'reward'|'goal';due?:string;mine:boolean;at:string};
export type Withdrawal={id:string;amount:number;status:'pending'|'approved'|'rejected';at:string;note?:string};
export type Kid={id:string;name:string;avatar?:string;phone?:string;stage?:string;school?:string;money:Money;groups:Group[];badges:Badge[];rewards:Reward[];withdrawals:Withdrawal[];
 extra?:{domains:{name:string;level:number;note:string}[];habits:{label:string;value:number}[];strengths:string[];watch:string[];activities:{name:string;note:string}[];identity:{name:string;stage:string;next:string;steps:number;of:number};yearTrend:{label:string;score:number}[]}};
export type Me={id:string;name:string;phone?:string;phone2?:string;whatsapp?:string;avatar?:string;job?:string;birthYear?:number;area?:string;address?:string;lat?:number;lng?:number;availableHours?:string;about?:string};
export type Ledger={id:string;kind:string;ref?:string;amount:number;dir:'in'|'out';note?:string;at:string;other?:string};
export type ParentData={me:Me;wallet:number;ledger:Ledger[];behaviorBadges:{id:string;name:string;icon:string;mine:boolean}[];children:Kid[]};

/* ---------- helpers used by the pages ---------- */
export const kidAvg=(k:Kid)=>{const s=k.groups.flatMap(g=>g.exams.filter(e=>e.score!==null).map(e=>(e.score as number)/e.max*100));return s.length?Math.round(s.reduce((a,b)=>a+b,0)/s.length):null;};
export const kidAttendance=(k:Kid)=>{const p=k.groups.reduce((a,g)=>a+g.attendance.present,0),t=p+k.groups.reduce((a,g)=>a+g.attendance.absent,0);return t?Math.round(p/t*100):null;};
export const kidHomework=(k:Kid)=>{const d=k.groups.reduce((a,g)=>a+g.homework.done,0),t=k.groups.reduce((a,g)=>a+g.homework.total,0);return t?Math.round(d/t*100):null;};
export const groupDue=(g:Group)=>g.invoices.filter(i=>i.status!=='paid'&&i.status!=='waived').reduce((a,i)=>a+(i.amount-i.paid),0);
export const kidDue=(k:Kid)=>k.groups.reduce((a,g)=>a+groupDue(g),0);
// Expected this month = price per session × this month's sessions (same rule as the teacher's monthly invoices).
export const kidExpected=(k:Kid)=>k.groups.reduce((a,g)=>a+g.price*(g.monthSessions||g.schedule.length*4),0);
export const siteDay=(dow:number)=>(dow+1)%7; // DB: 0 = Sunday · site week starts Saturday
export const hm=(t:string)=>{const [h,m]=t.split(':').map(Number);const x=h%12||12;return `${x}${m?':'+String(m).padStart(2,'0'):''} ${h<12?'ص':'م'}`;};

/* ---------- demo family in the same shape ---------- */
const faces=['👧','🧒','👦'];
function demoData():ParentData{
 const months=[['2026-11-01','نوفمبر'],['2026-10-01','أكتوبر'],['2026-09-01','سبتمبر']];
 const children:Kid[]=parentDemo.children.map((c,ci)=>({id:c.id,name:c.name,avatar:faces[ci],stage:c.grade,school:c.school,
  money:{balance:c.wallet+(ci===2?100:0),reward:ci===2?100:0,free:c.wallet},
  groups:c.subjects.map(s=>{const t=teacherById(s.teacherId),ct=centerById(s.centerId),contact=demoContact(s.teacherId);
   const dow=(s.session.day+6)%7,start=`${s.session.start}:00`,end=`${s.session.start+s.session.dur}:00`;
   return {id:s.session.id,name:s.subject,subject:s.subject,price:s.session.price,online:false,center:ct?.name,
    teacher:{id:s.teacherId,name:t?.name??'',phone:contact.phone,whatsapp:contact.whatsapp??contact.phone,avatar:t?.image},
    schedule:[{day:dow,start,end}],monthSessions:4,attendance:s.attendance,homework:s.homework,
    exams:s.exams.map(e=>({title:e.name,date:e.date,max:e.of,score:e.score})),
    invoices:c.payments.filter(p=>p.subject===s.subject).map((p,i)=>({id:p.id,period:months[i]?.[0]??'2026-09-01',amount:p.amount,paid:p.status==='paid'?p.amount:0,status:(p.status==='late'?'overdue':p.status==='due'?'due':'paid') as Invoice['status'],due:undefined,payments:p.status==='paid'?[{amount:p.amount,method:p.payer==='child'?'wallet':'cash',at:''}]:[]}))};}),
  badges:[{id:`${c.id}-b1`,name:'ملتزم',icon:'🛡️',category:'study' as const,from:c.recognitions[0]?.from,fromRole:'teacher',note:c.recognitions[0]?.text,at:'2026-10-12'},...(ci===0?[{id:`${c.id}-b2`,name:'مرتّب',icon:'🧹',category:'behavior' as const,from:'إنتِ',fromRole:'parent',note:'رتبت أوضتها لوحدها',at:'2026-11-02'}]:[])],
  rewards:ci===1?[{id:`${c.id}-g1`,title:'يجيب 18 من 20 في رياضيات نوفمبر',condition:'اختبار نوفمبر',amount:200,status:'funded' as const,kind:'goal' as const,due:'2026-11-30',mine:true,at:'2026-11-01'}]:ci===2?[{id:`${c.id}-r1`,title:'مكافأة المبادرة',condition:'حل كل مسائل الوحدة',amount:100,status:'released' as const,kind:'reward' as const,mine:false,at:'2026-10-20'}]:[],
  withdrawals:[],extra:{domains:c.domains,habits:c.habits,strengths:c.strengths,watch:c.watch,activities:c.activities,identity:c.identity,yearTrend:c.yearTrend}}));
 return {me:{id:'demo-parent',name:parentDemo.name,phone:'01011112222',whatsapp:'01011112222',phone2:'01222223333',job:'مهندسة ديكور',birthYear:1984,area:'مصر الجديدة',address:'ش الحجاز، مصر الجديدة',lat:30.0911,lng:31.3302,availableHours:'يوميًا من 6 م لـ 9 م',about:'أم لتلات أبناء. بفضّل التواصل على واتساب.'},
  wallet:parentDemo.wallet,ledger:[{id:'d1',kind:'top_up',amount:3000,dir:'in',note:'رصيد تجريبي',at:'2026-11-01'},...parentDemo.children.map((c,i)=>({id:`d${i+2}`,kind:'transfer',ref:'guardian_deposit',amount:c.wallet,dir:'out' as const,at:'2026-11-02',other:c.name}))],
  behaviorBadges:[['مطيع','🙏'],['مرتّب','🧹'],['صادق','🤍'],['إيد مساعدة','🤲'],['صاحي بدري','⏰'],['أخ كبير','🫶']].map(([name,icon],i)=>({id:`bb${i}`,name,icon,mine:false})),children};
}

/* ---------- chosen child (shared by all parent pages) ---------- */
const CKEY='maarej.parentKid',CEVT='maarej-parent-kid';
const readKid=()=>{try{return localStorage.getItem(CKEY)??'';}catch{return '';}};
const subKid=(cb:()=>void)=>{addEventListener(CEVT,cb);return()=>removeEventListener(CEVT,cb);};
export const useKidId=()=>useSyncExternalStore(subKid,readKid,()=>'');
export const pickKid=(id:string)=>{try{localStorage.setItem(CKEY,id);}catch{}dispatchEvent(new Event(CEVT));};

/* ---------- the hook ---------- */
let demoCache:ParentData|null=null;
const DEVT='maarej-parent-demo';
export function useParentData(){
 const session=useSession();
 const live=hasBackend&&session?.role==='parent';
 const [data,setData]=useState<ParentData|null>(null);
 const [error,setError]=useState('');
 const [tick,setTick]=useState(0);
 const reload=useCallback(()=>setTick(t=>t+1),[]);
 useEffect(()=>{let off=false;
  if(live){rpc<ParentData>('guardian_overview').then(d=>{if(!off){setData(normalize(d));setError('');}}).catch(e=>!off&&setError(e.message));}
  else{demoCache??=demoData();setData(demoCache);}
  const on=()=>{if(!live)setData({...demoCache!});};addEventListener(DEVT,on);
  return()=>{off=true;removeEventListener(DEVT,on);};},[live,tick,session?.user.id]);
 const kidId=useKidId();
 const kid=data?.children.find(c=>c.id===kidId)??data?.children[0];
 const run=async(liveFn:()=>Promise<unknown>,demoFn:(d:ParentData)=>void)=>{
  if(live){await liveFn();reload();return;}
  demoCache??=demoData();demoFn(demoCache);dispatchEvent(new Event(DEVT));
 };
 const k=(id:string)=>demoCache!.children.find(c=>c.id===id)!;
 const actions={
  deposit:(kidId:string,amount:number)=>run(()=>rpc('guardian_deposit',{p_student_id:kidId,p_amount:amount}),d=>{if(amount>d.wallet)throw new Error('رصيدك مش كفاية');d.wallet-=amount;const c=k(kidId);c.money.balance+=amount;c.money.free+=amount;d.ledger.unshift({id:`x${Date.now()}`,kind:'transfer',ref:'guardian_deposit',amount,dir:'out',at:new Date().toISOString(),other:c.name});}),
  withdraw:(kidId:string,amount:number)=>run(()=>rpc('guardian_withdraw',{p_student_id:kidId,p_amount:amount}),d=>{const c=k(kidId);if(amount>c.money.free)throw new Error('المبلغ أكبر من الرصيد المتاح للسحب (فلوس المكافآت محتاجة موافقة ابنك)');c.money.balance-=amount;c.money.free-=amount;d.wallet+=amount;d.ledger.unshift({id:`x${Date.now()}`,kind:'withdrawal',ref:'guardian_withdraw',amount,dir:'in',at:new Date().toISOString(),other:c.name});}),
  requestReward:(kidId:string,amount:number,note:string)=>run(()=>rpc('guardian_request_reward_withdrawal',{p_student_id:kidId,p_amount:amount,p_note:note||null}),()=>{const c=k(kidId);if(amount>c.money.reward)throw new Error('المبلغ أكبر من فلوس المكافآت عند ابنك');c.withdrawals.unshift({id:`w${Date.now()}`,amount,status:'pending',at:new Date().toISOString(),note});}),
  createGoal:(kidId:string,title:string,condition:string,amount:number,due:string)=>run(()=>rpc('guardian_create_goal',{p_student_id:kidId,p_title:title,p_condition:condition||null,p_amount:amount,p_due:due||null}),d=>{if(amount>d.wallet)throw new Error('رصيدك مش كفاية');d.wallet-=amount;k(kidId).rewards.unshift({id:`g${Date.now()}`,title,condition,amount,status:'funded',kind:'goal',due,mine:true,at:new Date().toISOString()});}),
  releaseReward:(kidId:string,id:string)=>run(()=>rpc('release_reward',{p_reward_id:id}),()=>{const c=k(kidId),r=c.rewards.find(x=>x.id===id)!;r.status='released';c.money.balance+=r.amount;c.money.reward+=r.amount;}),
  cancelReward:(kidId:string,id:string)=>run(()=>rpc('cancel_reward',{p_reward_id:id}),d=>{const r=k(kidId).rewards.find(x=>x.id===id)!;r.status='cancelled';d.wallet+=r.amount;}),
  awardBadge:(kidId:string,badgeId:string,note:string)=>run(()=>rpc('guardian_award_badge',{p_badge_id:badgeId,p_student_id:kidId,p_note:note||null}),d=>{const b=d.behaviorBadges.find(x=>x.id===badgeId)!;k(kidId).badges.unshift({id:`a${Date.now()}`,name:b.name,icon:b.icon,category:'behavior',from:'إنتَ',fromRole:'parent',note,at:new Date().toISOString()});}),
  message:(teacherId:string,kidId:string,body:string)=>run(()=>insert('messages',{sender_id:session!.user.id,recipient_id:teacherId,student_id:kidId,body}),()=>{}),
  saveMe:(patch:Partial<Me>)=>run(()=>update('profiles',`id=eq.${session!.user.id}`,{full_name:patch.name,phone:patch.phone||null,phone2:patch.phone2||null,whatsapp:patch.whatsapp||null,job:patch.job||null,birth_year:patch.birthYear||null,area:patch.area||null,address:patch.address||null,available_hours:patch.availableHours||null,about:patch.about||null,avatar_url:patch.avatar||null}),d=>{d.me={...d.me,...patch};}),
  linkChild:(phone:string)=>run(()=>rpc('guardian_link_child_by_phone',{p_phone:phone}),()=>{throw new Error('ربط ابن حقيقي محتاج تسجيل دخول بحساب ولي أمر');}),
 };
 return {data,kid,live,error,reload,actions,session};
}
// Numbers arrive as strings from Postgres numeric; convert once.
function normalize(d:any):ParentData{
 const n=(x:any)=>Number(x??0);
 return {...d,wallet:n(d.wallet),me:d.me??{},ledger:(d.ledger??[]).map((l:any)=>({...l,amount:n(l.amount)})),
  children:(d.children??[]).map((c:any)=>({...c,money:{balance:n(c.money?.balance),reward:n(c.money?.reward),free:n(c.money?.free)},
   rewards:(c.rewards??[]).map((r:any)=>({...r,amount:n(r.amount)})),withdrawals:(c.withdrawals??[]).map((w:any)=>({...w,amount:n(w.amount)})),
   groups:(c.groups??[]).map((g:any)=>({...g,price:n(g.price),monthSessions:n(g.monthSessions),exams:(g.exams??[]).map((e:any)=>({...e,max:n(e.max),score:e.score===null?null:n(e.score)})),
    invoices:(g.invoices??[]).map((i:any)=>({...i,amount:n(i.amount),paid:n(i.paid),payments:(i.payments??[]).map((p:any)=>({...p,amount:n(p.amount)}))}))}))}))};
}
