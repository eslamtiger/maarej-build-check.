'use client';
// /me: any signed-in person edits their own details (student or parent). Students also see their money,
// approve or refuse a parent's request to take reward money back, and accept a parent's link request.
// /parent/card?id=…: a parent's page as a teacher (or the child) sees it, read through the database rules.
import Link from 'next/link';
import {useEffect,useState} from 'react';
import type {ReactNode} from 'react';
import {SiteHeader} from '@/components/site/site-header';
import {hasBackend,useSession,rpc,select,update,signOut,ensureDemo} from '../../adapters/backend';
import {ProfileCard} from './parent-pages';
import {Card,egp,Empty} from './parent-shell';
import type {Me} from '../../adapters/parent-data';
import {useParentData} from '../../adapters/parent-data';
import p from './parent.module.css';

const toMe=(r:any):Me=>({id:r.id,name:r.full_name,phone:r.phone,phone2:r.phone2,whatsapp:r.whatsapp,avatar:r.avatar_url,job:r.job,birthYear:r.birth_year,area:r.area,address:r.address,lat:r.lat,lng:r.lng,availableHours:r.available_hours,about:r.about});
const cols='id,role,full_name,phone,phone2,whatsapp,avatar_url,job,birth_year,area,address,lat,lng,available_hours,about';
function Frame({title,emoji,children}:{title:string;emoji:string;children:ReactNode}){
 return <div className={p.shell} dir="rtl"><SiteHeader/><div className={p.frame} style={{gridTemplateColumns:'minmax(0,760px)',justifyContent:'center'}}><main className={p.main}>
  <header className={p.pageHead}><h1><span aria-hidden="true">{emoji}</span>{title}</h1></header>{children}</main></div></div>;
}

export function MePage(){
 const session=useSession();
 const [me,setMe]=useState<Me|null>(null);const [role,setRole]=useState('');
 const [money,setMoney]=useState<{balance:number;reward:number;free:number}|null>(null);
 const [reqs,setReqs]=useState<any[]>([]);const [links,setLinks]=useState<any[]>([]);
 const [msg,setMsg]=useState('');const [err,setErr]=useState('');const [tick,setTick]=useState(0);
 useEffect(()=>{if(hasBackend&&!session)ensureDemo('student').catch(e=>setErr(e.message));},[session]);
 useEffect(()=>{if(!hasBackend||!session)return;(async()=>{try{
  const [r]=await select('profiles',`id=eq.${session.user.id}&select=${cols}`);setMe(toMe(r));setRole(r.role);
  if(r.role==='student'){const m:any=await rpc('child_money',{p_student_id:session.user.id});setMoney({balance:+m.balance,reward:+m.reward,free:+m.free});
   setReqs(await rpc<any[]>('my_withdrawal_requests'));setLinks(await select('guardian_links',`student_id=eq.${session.user.id}&status=eq.pending&select=guardian_id`));}
 }catch(e:any){setErr(e.message);}})();},[session?.user.id,tick]);
 if(!hasBackend)return <Frame title="حسابي" emoji="👤"><Empty>الموقع مش متوصّل بالداتابيز هنا.</Empty></Frame>;
 if(!session)return <Frame title="حسابي" emoji="👤"><Card><p>⏳ بنفتحلك الحساب التجريبي…</p></Card></Frame>;
 const act=async(fn:()=>Promise<unknown>,ok:string)=>{setErr('');setMsg('');try{await fn();setMsg(ok);setTick(t=>t+1);}catch(e:any){setErr(e.message);}};
 return <Frame title="حسابي" emoji="👤">
  {err&&<p className={p.error} role="alert">{err}</p>}{msg&&<p className={p.okMsg} role="status">{msg}</p>}
  {session.demo&&<p className={p.okMsg}>🧪 ده حساب تجريبي مشترك. <Link href="/login?next=/me">اعمل حسابك</Link> لو عايز بياناتك.</p>}
  {role==='parent'&&<Card><Link href="/parent" className={p.linkBtn}>افتح مساحة ولي الأمر ←</Link></Card>}
  {money&&<Card title="رصيدك" emoji="💰" tone="amber"><div className={p.split}><div><small>🔓 فلوسك العادية</small><b>{egp(money.free)}</b></div><div data-k="lock"><small>🔒 فلوس مكافآتك</small><b>{egp(money.reward)}</b></div></div>
   <small className={p.muted}>فلوس المكافآت بتاعتك، ومحدش يقدر يسحبها غير لو إنت وافقت.</small></Card>}
  {reqs.length>0&&<Card title="طلبات من ولي الأمر" emoji="📨" tone="pink"><ul className={p.rows}>{reqs.map(r=><li key={r.id}><span className={p.rowMain}><b>{r.from} عايز يسترجع {egp(+r.amount)}</b><small>من فلوس مكافآتك{r.note?` · ${r.note}`:''}</small></span>
   {r.status==='pending'?<span className={p.inlineBtns}><button type="button" onClick={()=>act(()=>rpc('decide_withdrawal',{p_request_id:r.id,p_approve:true}),'✅ وافقت والفلوس رجعت')}>موافق</button><button type="button" className={p.ghostBtn} onClick={()=>act(()=>rpc('decide_withdrawal',{p_request_id:r.id,p_approve:false}),'رفضت الطلب')}>لا</button></span>
    :<em className={p.status} data-s={r.status}>{r.status==='approved'?'وافقت':'رفضت'}</em>}</li>)}</ul></Card>}
  {links.length>0&&<Card title="طلب ربط من ولي أمر" emoji="🔗" tone="violet"><ul className={p.rows}>{links.map(l=><li key={l.guardian_id}><span className={p.rowMain}><b>ولي أمر عايز يتابعك</b><small>لو وافقت هيشوف درجاتك وحضورك ومصاريفك</small></span>
   <button type="button" className={p.secondary} onClick={()=>act(()=>update('guardian_links',`guardian_id=eq.${l.guardian_id}&student_id=eq.${session.user.id}`,{status:'accepted'}),'✅ اتربطتوا')}>موافق</button></li>)}</ul></Card>}
  {me&&<EditMe me={me} onSaved={()=>setTick(t=>t+1)} userId={session.user.id}/>}
  <button type="button" className={p.ghostBtn} onClick={()=>{signOut();location.assign('/login');}}>تسجيل خروج</button>
 </Frame>;
}
function EditMe({me,userId,onSaved}:{me:Me;userId:string;onSaved:()=>void}){
 const [f,setF]=useState<Me>(me);const [msg,setMsg]=useState('');const [err,setErr]=useState('');
 const set=(k:keyof Me)=>(e:{target:{value:string}})=>setF({...f,[k]:k==='birthYear'?Number(e.target.value)||undefined:e.target.value});
 const save=async()=>{setMsg('');setErr('');try{await update('profiles',`id=eq.${userId}`,{full_name:f.name,phone:f.phone||null,phone2:f.phone2||null,whatsapp:f.whatsapp||null,job:f.job||null,birth_year:f.birthYear||null,area:f.area||null,address:f.address||null,available_hours:f.availableHours||null,about:f.about||null,avatar_url:f.avatar||null});setMsg('✅ اتحفظ');onSaved();}catch(e:any){setErr(e.message);}};
 return <><Card title="كده بيشوفك الناس" emoji="🪪" tone="violet"><ProfileCard me={me}/></Card>
  <Card title="بياناتك" emoji="✏️" tone="blue"><div className={p.form}>
   <label className={p.full}>الاسم<input value={f.name??''} onChange={set('name')}/></label>
   <label>الموبايل<input value={f.phone??''} onChange={set('phone')} dir="ltr"/></label><label>واتساب<input value={f.whatsapp??''} onChange={set('whatsapp')} dir="ltr"/></label>
   <label>رقم تاني<input value={f.phone2??''} onChange={set('phone2')} dir="ltr"/></label><label>سنة الميلاد<input type="number" value={f.birthYear??''} onChange={set('birthYear')} dir="ltr"/></label>
   <label>الشغلانة / المدرسة<input value={f.job??''} onChange={set('job')}/></label><label>المنطقة<input value={f.area??''} onChange={set('area')}/></label>
   <label className={p.full}>العنوان<input value={f.address??''} onChange={set('address')}/></label>
   <label className={p.full}>متاح امتى<input value={f.availableHours??''} onChange={set('availableHours')}/></label>
   <label className={p.full}>رابط صورتك<input value={f.avatar??''} onChange={set('avatar')} dir="ltr" placeholder="https://"/></label>
   <label className={p.full}>نبذة<textarea rows={3} value={f.about??''} onChange={set('about')}/></label>
   <button type="button" className={p.primary} onClick={save} disabled={!f.name?.trim()}>احفظ</button></div>
   {msg&&<p className={p.okMsg}>{msg}</p>}{err&&<p className={p.error}>{err}</p>}</Card></>;
}

export function ParentCardPage(){
 const session=useSession();const {data}=useParentData();
 const [me,setMe]=useState<Me|null>(null);const [err,setErr]=useState('');
 const id=typeof window!=='undefined'?new URLSearchParams(location.search).get('id'):null;
 useEffect(()=>{if(!id||!hasBackend||!session)return;select('profiles',`id=eq.${id}&role=eq.parent&select=${cols}`).then(r=>r.length?setMe(toMe(r[0])):setErr('مش مسموح تشوف الصفحة دي، أو الحساب مش موجود')).catch(e=>setErr(e.message));},[id,session?.user.id]);
 const shown=id?me:data?.me??null;
 return <Frame title="ولي الأمر" emoji="👨‍👩‍👧">
  {!id&&<p className={p.muted}>نسخة تجريبية من صفحة ولي الأمر زي ما المدرس بيشوفها.</p>}
  {id&&!session&&<Card><p>سجّل دخولك عشان تشوف الصفحة.</p><Link href={`/login?next=/parent/card?id=${id}`} className={p.primary}>تسجيل الدخول</Link></Card>}
  {err&&<p className={p.error}>{err}</p>}
  {shown&&<Card tone="violet"><ProfileCard me={shown} kids={id?undefined:data?.children}/></Card>}
 </Frame>;
}
