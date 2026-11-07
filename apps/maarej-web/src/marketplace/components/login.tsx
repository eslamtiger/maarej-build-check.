'use client';
// Sign in / sign up. With the database connected, accounts are real (Supabase Auth, email + password);
// students and parents land in their own areas. Without it, the old demo sign-in (this browser only) is used.
import {useState} from 'react';
import {PublicMarketplaceShell} from './public-shell';
import {Mark,Marks} from './fun';
import {Arrow} from './doodles';
import {marketplaceTeachers} from '../adapters/teachers';
import {marketplaceCenters,placePhoto} from '../adapters/places';
import {signIn,useDemoUser,signOut} from '../adapters/demo-auth';
import * as real from '../adapters/backend';
import type {DemoRole} from '../adapters/demo-auth';
import l from './login.module.css';

const roles:{id:DemoRole;emoji:string;label:string}[]=[{id:'student',emoji:'🧑‍🎓',label:'طالب'},{id:'parent',emoji:'👨‍👩‍👧',label:'ولي أمر'},{id:'teacher',emoji:'🧑‍🏫',label:'مدرس'}];
const safeNext=()=>{try{const n=new URLSearchParams(location.search).get('next')??'/';return n.startsWith('/')&&!n.startsWith('//')?n:'/';}catch{return '/';}};

export function LoginPage(){
 const user=useDemoUser();
 const [mode,setMode]=useState<'in'|'up'>('up');
 const [role,setRole]=useState<DemoRole>('student');
 const [name,setName]=useState('');
 const [phone,setPhone]=useState('');
 const ok=phone.trim().length>=8&&(mode==='in'||name.trim().length>1);
 const faces=marketplaceTeachers.filter(t=>t.image).slice(0,4);
 const go=()=>{location.assign(safeNext());};
 const session=real.useSession();
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');
 const [busy,setBusy]=useState(false);const [err,setErr]=useState('');const [info,setInfo]=useState('');
 const home=(r?:string)=>{const n=new URLSearchParams(location.search).get('next');location.assign(n&&n.startsWith('/')&&!n.startsWith('//')?n:r==='parent'?'/parent':'/me');};
 const realSubmit=async(e?:string,pw?:string)=>{setBusy(true);setErr('');setInfo('');try{
  if(role==='teacher'&&!e){setInfo('حساب المدرس من موقع «كراسة»: maarej-teacher.vercel.app');return;}
  const s=mode==='up'&&!e?await real.signUp(email.trim(),password,{full_name:name.trim(),phone:phone.trim(),role:role==='parent'?'parent':'student'}):await real.signIn((e??email).trim(),pw??password);
  if(!s){setInfo('📧 بعتنالك إيميل تأكيد. أكّده وبعدين ادخل.');return;}
  signIn({name:s.name??'',phone:phone.trim(),role:s.role==='parent'?'parent':'student'});home(s.role);
 }catch(x:any){setErr(x?.message==='Invalid login credentials'?'الإيميل أو كلمة السر غلط':x?.message??'حصلت مشكلة');}finally{setBusy(false);}};
 const realOk=email.includes('@')&&password.length>=6&&(mode==='in'||name.trim().length>1);
 return <PublicMarketplaceShell><div className={l.wrap}>
  <aside className={l.side} aria-hidden="true">
   <Marks items={[{e:'⭐',x:2,y:2,s:'md',a:'spin'},{e:'🚀',x:92,y:4,s:'lg',a:'float'}]}/>
   <h2>أهلًا بيك 👋</h2>
   <div className={l.pics}><img src={placePhoto('center',marketplaceCenters[1].id,420)} alt=""/><img src={placePhoto('center',marketplaceCenters[4].id,420)} alt=""/><span className={l.faces}>{faces.map(t=><img key={t.id} src={t.image} alt=""/>)}</span></div>
   <ul className={l.perks}><li><Mark e="🏫" a="none" s="md"/>احجز قاعة</li><li><Mark e="📅" a="none" s="md"/>حصصك في مكان</li><li><Mark e="🚀" a="none" s="md"/>رحلتك بتكبر</li></ul>
   <Arrow w={90} mirror/>
  </aside>
  <section className={l.card} aria-labelledby="lg-title">
   <span className={l.heroWrap}><Mark e="🔐" a="none" s="xl"/><Marks items={[{e:'✨',x:-110,y:-10,s:'md',a:'pulse'},{e:'⭐',x:170,y:-20,s:'md',a:'spin'},{e:'🎈',x:190,y:60,s:'md',a:'float'},{e:'📚',x:-130,y:70,s:'md',a:'bob'}]}/></span>
   <h1 id="lg-title">{mode==='up'?'اعمل حساب في معارج':'سجّل دخولك'}</h1>
   {real.hasBackend?(session?<div className={l.done}><Mark e="🎉" a="none" s="lg"/><b>أهلًا {session.name}</b><button type="button" className={l.primary} onClick={()=>home(session.role)}>كمّل</button><button type="button" className={l.ghost} onClick={()=>{real.signOut();signOut();}}>خروج</button></div>:<>
    <div className={l.tabs} role="tablist"><button type="button" role="tab" aria-selected={mode==='up'} onClick={()=>setMode('up')}>✨ حساب جديد</button><button type="button" role="tab" aria-selected={mode==='in'} onClick={()=>setMode('in')}>👋 دخول</button></div>
    {mode==='up'&&<div className={l.roles} role="radiogroup" aria-label="أنا">{roles.map(r=><button key={r.id} type="button" role="radio" aria-checked={role===r.id} onClick={()=>setRole(r.id)}><Mark e={r.emoji} a="none" s="lg"/><b>{r.label}</b></button>)}</div>}
    {mode==='up'&&<label className={l.field}>👤 الاسم<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>}
    {mode==='up'&&<label className={l.field}>📱 رقم الموبايل<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" autoComplete="tel" dir="ltr"/></label>}
    <label className={l.field}>📧 الإيميل<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" dir="ltr"/></label>
    <label className={l.field}>🔑 كلمة السر<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete={mode==='up'?'new-password':'current-password'} dir="ltr"/></label>
    <button type="button" className={l.primary} disabled={!realOk||busy} onClick={()=>realSubmit()}>{busy?'لحظة…':mode==='up'?'ابدأ 🚀':'ادخل 🚀'}</button>
    {err&&<small className={l.err} role="alert">{err}</small>}{info&&<small className={l.demo} role="status">{info}</small>}
    <div className={l.tryRow}><small>جرّب بحساب جاهز:</small><button type="button" disabled={busy} onClick={()=>realSubmit('parent@demo.maarej.app','Maarej2026!')}>👨‍👩‍👧 ولي أمر</button><button type="button" disabled={busy} onClick={()=>realSubmit('youssef@demo.maarej.app','Maarej2026!')}>🧑‍🎓 طالب</button></div>
   </>):user?<div className={l.done}><Mark e="🎉" a="none" s="lg"/><b>أهلًا {user.name}</b><button type="button" className={l.primary} onClick={go}>كمّل</button><button type="button" className={l.ghost} onClick={signOut}>خروج</button></div>:<>
    <div className={l.tabs} role="tablist"><button type="button" role="tab" aria-selected={mode==='up'} onClick={()=>setMode('up')}>✨ حساب جديد</button><button type="button" role="tab" aria-selected={mode==='in'} onClick={()=>setMode('in')}>👋 دخول</button></div>
    <div className={l.roles} role="radiogroup" aria-label="أنا">{roles.map(r=><button key={r.id} type="button" role="radio" aria-checked={role===r.id} onClick={()=>setRole(r.id)}><Mark e={r.emoji} a="none" s="lg"/><b>{r.label}</b></button>)}</div>
    {mode==='up'&&<label className={l.field}>👤 الاسم<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>}
    <label className={l.field}>📱 رقم الموبايل<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" autoComplete="tel" dir="ltr"/></label>
    <button type="button" className={l.primary} disabled={!ok} onClick={()=>{signIn({name:name.trim()||'ضيفنا',phone:phone.trim(),role});go();}}>{mode==='up'?'ابدأ':'ادخل'} 🚀</button>
    <small className={l.demo}>تجريبي · مفيش حساب حقيقي ولا كلمة سر</small>
   </>}
  </section>
 </div></PublicMarketplaceShell>;
}
