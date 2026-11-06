'use client';
// Demo sign-in / sign-up page. Reached when a visitor who is not signed in tries to reserve a room. No real account is created.
import {useState} from 'react';
import {PublicMarketplaceShell} from './public-shell';
import {Mark,Marks} from './fun';
import {Arrow} from './doodles';
import {marketplaceTeachers} from '../adapters/teachers';
import {marketplaceCenters,placePhoto} from '../adapters/places';
import {signIn,useDemoUser,signOut} from '../adapters/demo-auth';
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
 const [forgot,setForgot]=useState(false);
 const faces=marketplaceTeachers.filter(t=>t.image).slice(0,4);
 const go=()=>{location.assign(safeNext());};
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
   {user?<div className={l.done}><Mark e="🎉" a="none" s="lg"/><b>أهلًا {user.name}</b><button type="button" className={l.primary} onClick={go}>كمّل</button><button type="button" className={l.ghost} onClick={signOut}>خروج</button></div>:<>
    <div className={l.tabs} role="tablist"><button type="button" role="tab" aria-selected={mode==='up'} onClick={()=>setMode('up')}>✨ حساب جديد</button><button type="button" role="tab" aria-selected={mode==='in'} onClick={()=>setMode('in')}>👋 دخول</button></div>
    <div className={l.roles} role="radiogroup" aria-label="أنا">{roles.map(r=><button key={r.id} type="button" role="radio" aria-checked={role===r.id} onClick={()=>setRole(r.id)}><Mark e={r.emoji} a="none" s="lg"/><b>{r.label}</b></button>)}</div>
    {mode==='up'&&<label className={l.field}>👤 الاسم<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>}
    <label className={l.field}>📱 رقم الموبايل<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" autoComplete="tel" dir="ltr"/></label>
    <button type="button" className={l.primary} disabled={!ok} onClick={()=>{signIn({name:name.trim()||'ضيفنا',phone:phone.trim(),role});go();}}>{mode==='up'?'ابدأ':'ادخل'} 🚀</button>
    {mode==='in'&&<button type="button" className={l.ghost} onClick={()=>setForgot(f=>!f)}>🔑 نسيت الرقم؟</button>}
    {forgot&&<small className={l.demo}>تجريبي: اكتب أي رقم وادخل.</small>}
    <small className={l.demo}>تجريبي · مفيش حساب حقيقي ولا كلمة سر</small>
   </>}
  </section>
 </div></PublicMarketplaceShell>;
}
