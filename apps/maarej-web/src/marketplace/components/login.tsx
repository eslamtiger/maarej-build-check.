'use client';
// Sign in / sign up (optional for now: every page also works without an account).
// Sign-up follows page 01 of the product sketches: student (name, birth date, education system, stage, grade, school…)
// or parent (name, relation, phone, job, area, children's phones). Accounts are real (Supabase Auth, email + password);
// the extra details travel in the account metadata and are written to the profile on first sign-in.
import {useState} from 'react';
import {PublicMarketplaceShell} from './public-shell';
import {Mark,Marks} from './fun';
import {marketplaceTeachers} from '../adapters/teachers';
import {marketplaceCenters,placePhoto} from '../adapters/places';
import {signIn as demoSignIn,signOut as demoSignOut} from '../adapters/demo-auth';
import * as real from '../adapters/backend';
import l from './login.module.css';

type Role='student'|'parent'|'teacher'|'center';
const roles:{id:Role;emoji:string;label:string;note?:string}[]=[{id:'student',emoji:'🧑‍🎓',label:'طالب'},{id:'parent',emoji:'👨‍👩‍👧',label:'ولي أمر'},{id:'teacher',emoji:'🧑‍🏫',label:'مدرس',note:'من موقع كراسة'},{id:'center',emoji:'🏫',label:'سنتر',note:'قريبًا'}];
const stages={'ابتدائي':['الأول','الثاني','الثالث','الرابع','الخامس','السادس'],'إعدادي':['الأول','الثاني','الثالث'],'ثانوي':['الأول','الثاني','الثالث']} as const;
const systems=[['normal','عام'],['azhar','أزهري'],['private','خاص / لغات']] as const;
const relations=['أب','أم','أخ','أخت','وصي'];
const govs=['القاهرة','الجيزة','الإسكندرية','القليوبية','أخرى'];
const nextOr=(fallback:string)=>{try{const n=new URLSearchParams(location.search).get('next');return n&&n.startsWith('/')&&!n.startsWith('//')?n:fallback;}catch{return fallback;}};

export function LoginPage(){
 const session=real.useSession();
 const [mode,setMode]=useState<'in'|'up'>('in');
 const [step,setStep]=useState(0);
 const [role,setRole]=useState<Role>('student');
 const [f,setF]=useState<Record<string,string>>({stage:'ثانوي',grade:'الأول',education_system:'normal',governorate:'القاهرة',relation:'أم',gender:''});
 const [kids,setKids]=useState<string[]>(['']);
 const [busy,setBusy]=useState(false);const [err,setErr]=useState('');const [info,setInfo]=useState('');
 const set=(k:string)=>(e:{target:{value:string}})=>setF(v=>({...v,[k]:e.target.value}));
 const faces=marketplaceTeachers.filter(t=>t.image).slice(0,4);
 const go=(r?:string)=>location.assign(nextOr(r==='parent'?'/parent':'/me'));
 const run=async(fn:()=>Promise<real.Session|null>)=>{setBusy(true);setErr('');setInfo('');try{const s=await fn();
  if(!s){setInfo('📧 بعتنالك إيميل تأكيد. أكّده وبعدين ادخل.');return;}
  demoSignIn({name:s.name??'',phone:f.phone??'',role:s.role==='parent'?'parent':'student'});go(s.role);
 }catch(x:any){setErr(x?.message==='Invalid login credentials'?'الإيميل أو كلمة السر غلط':x?.message==='User already registered'?'الإيميل ده عنده حساب. ادخل بيه.':x?.message??'حصلت مشكلة');}finally{setBusy(false);}};
 const signup=()=>run(()=>real.signUp(f.email.trim(),f.password,{
  full_name:f.full_name.trim(),phone:f.phone?.trim(),role:role==='parent'?'parent':'student',governorate:f.governorate,area:f.area?.trim(),
  ...(role==='student'?{birth_date:f.birth_date,gender:f.gender||undefined,education_system:f.education_system,stage:f.stage,grade:`الصف ${f.grade} ${f.stage==='ابتدائي'?'الابتدائي':f.stage==='إعدادي'?'الإعدادي':'الثانوي'}`,school_name:f.school_name?.trim(),guardian_phone:f.guardian_phone?.trim()}
   :{relation:f.relation,job:f.job?.trim(),whatsapp:f.whatsapp?.trim()||f.phone?.trim(),children:kids.map(k=>k.trim()).filter(Boolean)})}));
 const ok1=(f.full_name??'').trim().length>1&&(f.phone??'').trim().length>=10&&(role==='parent'||Boolean(f.birth_date));
 const ok2=(f.email??'').includes('@')&&(f.password??'').length>=6&&f.password===f.password2&&f.terms==='1';
 const skip=<a className={l.skip} href={nextOr('/')}>كمّل من غير حساب ←</a>;

 return <PublicMarketplaceShell><div className={l.wrap}>
  <aside className={l.side} aria-hidden="true">
   <Marks items={[{e:'⭐',x:2,y:2,s:'md',a:'spin'},{e:'🚀',x:92,y:4,s:'lg',a:'float'}]}/>
   <h2>أهلًا بيك 👋</h2>
   <div className={l.pics}><img src={placePhoto('center',marketplaceCenters[1].id,420)} alt=""/><img src={placePhoto('center',marketplaceCenters[4].id,420)} alt=""/><span className={l.faces}>{faces.map(t=><img key={t.id} src={t.image} alt=""/>)}</span></div>
   <ul className={l.perks}><li><Mark e="🧑‍🎓" a="none" s="md"/>حصصك ودرجاتك</li><li><Mark e="👨‍👩‍👧" a="none" s="md"/>تابع ولادك</li><li><Mark e="🏫" a="none" s="md"/>احجز قاعة</li></ul>
  </aside>
  <section className={l.card} aria-labelledby="lg-title">
   <span className={l.heroWrap}><Mark e={mode==='in'?'🔐':'✨'} a="none" s="xl"/></span>
   <h1 id="lg-title">{session&&!session.demo?`أهلًا ${session.name}`:mode==='in'?'سجّل دخولك':'اعمل حسابك'}</h1>
   <p className={l.optional}>الحساب اختياري دلوقتي: تقدر تستخدم الموقع كله من غيره.</p>
   {!real.hasBackend?<><p className={l.demo}>الموقع مش متوصّل بالداتابيز في النسخة دي.</p>{skip}</>
   :session&&!session.demo?<div className={l.done}><button type="button" className={l.primary} onClick={()=>go(session.role)}>كمّل لـ{session.role==='parent'?'مساحة ولي الأمر':'حسابي'}</button><button type="button" className={l.ghost} onClick={()=>{real.signOut();demoSignOut();}}>خروج</button></div>
   :<>
    <div className={l.tabs} role="tablist"><button type="button" role="tab" aria-selected={mode==='in'} onClick={()=>{setMode('in');setErr('');}}>👋 دخول</button><button type="button" role="tab" aria-selected={mode==='up'} onClick={()=>{setMode('up');setStep(0);setErr('');}}>✨ حساب جديد</button></div>
    {mode==='in'?<>
     <label className={l.field}>📧 الإيميل<input value={f.email??''} onChange={set('email')} type="email" autoComplete="email" dir="ltr"/></label>
     <label className={l.field}>🔑 كلمة السر<input value={f.password??''} onChange={set('password')} type="password" autoComplete="current-password" dir="ltr"/></label>
     <button type="button" className={l.primary} disabled={!(f.email??'').includes('@')||(f.password??'').length<6||busy} onClick={()=>run(()=>real.signIn(f.email.trim(),f.password))}>{busy?'لحظة…':'ادخل 🚀'}</button>
     <div className={l.tryRow}><small>أو جرّب بحساب جاهز:</small><button type="button" disabled={busy} onClick={()=>run(()=>real.signIn(real.DEMO.parent,real.DEMO.password,true))}>👨‍👩‍👧 ولي أمر</button><button type="button" disabled={busy} onClick={()=>run(()=>real.signIn(real.DEMO.student,real.DEMO.password,true))}>🧑‍🎓 طالب</button></div>
    </>:<>
     <ol className={l.steps} aria-label="خطوات التسجيل">{['مين إنت','بياناتك','الحساب'].map((t,i)=><li key={t} data-state={i<step?'done':i===step?'now':'next'}><span>{i<step?'✓':i+1}</span>{t}</li>)}</ol>
     {step===0&&<>
      <div className={l.roles4} role="radiogroup" aria-label="أنا">{roles.map(r=><button key={r.id} type="button" role="radio" aria-checked={role===r.id} onClick={()=>setRole(r.id)}><Mark e={r.emoji} a="none" s="lg"/><b>{r.label}</b>{r.note&&<small>{r.note}</small>}</button>)}</div>
      {role==='teacher'?<a className={l.primary} href="https://maarej-teacher.vercel.app">افتح موقع المدرس (كراسة)</a>:role==='center'?<p className={l.demo}>تسجيل السناتر هيتفتح قريب.</p>:<button type="button" className={l.primary} onClick={()=>setStep(1)}>التالي</button>}
     </>}
     {step===1&&<div className={l.grid}>
      <label className={`${l.field} ${l.full}`}>👤 الاسم بالكامل<input value={f.full_name??''} onChange={set('full_name')} autoComplete="name"/></label>
      <label className={l.field}>📱 الموبايل<input value={f.phone??''} onChange={set('phone')} inputMode="tel" autoComplete="tel" dir="ltr" placeholder="01xxxxxxxxx"/></label>
      {role==='student'?<>
       <label className={l.field}>🎂 تاريخ الميلاد<input type="date" value={f.birth_date??''} onChange={set('birth_date')} dir="ltr"/></label>
       <label className={l.field}>🧑 النوع<select value={f.gender} onChange={set('gender')}><option value="">—</option><option value="male">ولد</option><option value="female">بنت</option></select></label>
       <label className={l.field}>🏫 النظام التعليمي<select value={f.education_system} onChange={set('education_system')}>{systems.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
       <label className={l.field}>🎓 المرحلة<select value={f.stage} onChange={e=>setF(v=>({...v,stage:e.target.value,grade:'الأول'}))}>{Object.keys(stages).map(s=><option key={s}>{s}</option>)}</select></label>
       <label className={l.field}>📚 الصف<select value={f.grade} onChange={set('grade')}>{stages[f.stage as keyof typeof stages].map(g=><option key={g}>{g}</option>)}</select></label>
       <label className={`${l.field} ${l.full}`}>🏛️ المدرسة<input value={f.school_name??''} onChange={set('school_name')}/></label>
       <label className={`${l.field} ${l.full}`}>👨‍👩‍👧 موبايل ولي الأمر (اختياري)<input value={f.guardian_phone??''} onChange={set('guardian_phone')} inputMode="tel" dir="ltr"/></label>
      </>:<>
       <label className={l.field}>🤝 صلة القرابة<select value={f.relation} onChange={set('relation')}>{relations.map(r=><option key={r}>{r}</option>)}</select></label>
       <label className={l.field}>💬 واتساب<input value={f.whatsapp??''} onChange={set('whatsapp')} inputMode="tel" dir="ltr" placeholder="نفس الموبايل لو فاضي"/></label>
       <label className={l.field}>💼 الشغلانة<input value={f.job??''} onChange={set('job')}/></label>
       <div className={`${l.field} ${l.full}`}>🧒 أرقام موبايل ولادك (هيوصلهم طلب ربط)
        {kids.map((k,i)=><input key={i} value={k} onChange={e=>setKids(v=>v.map((x,j)=>j===i?e.target.value:x))} inputMode="tel" dir="ltr" placeholder={`ابن ${i+1}`} aria-label={`موبايل ابن ${i+1}`}/>)}
        {kids.length<5&&<button type="button" className={l.ghost} onClick={()=>setKids(v=>[...v,''])}>➕ ابن تاني</button>}</div>
      </>}
      <label className={l.field}>📍 المحافظة<select value={f.governorate} onChange={set('governorate')}>{govs.map(g=><option key={g}>{g}</option>)}</select></label>
      <label className={l.field}>🏘️ المنطقة<input value={f.area??''} onChange={set('area')}/></label>
      <div className={`${l.nav} ${l.full}`}><button type="button" className={l.ghost} onClick={()=>setStep(0)}>رجوع</button><button type="button" className={l.primary} disabled={!ok1} onClick={()=>setStep(2)}>التالي</button></div>
     </div>}
     {step===2&&<>
      <label className={l.field}>📧 الإيميل<input value={f.email??''} onChange={set('email')} type="email" autoComplete="email" dir="ltr"/></label>
      <label className={l.field}>🔑 كلمة السر (6 حروف أو أكتر)<input value={f.password??''} onChange={set('password')} type="password" autoComplete="new-password" dir="ltr"/></label>
      <label className={l.field}>🔁 أكّد كلمة السر<input value={f.password2??''} onChange={set('password2')} type="password" autoComplete="new-password" dir="ltr"/></label>
      {f.password2&&f.password!==f.password2&&<small className={l.err}>كلمتين السر مش زي بعض</small>}
      <label className={l.check}><input type="checkbox" checked={f.terms==='1'} onChange={e=>setF(v=>({...v,terms:e.target.checked?'1':''}))}/>موافق على الشروط وسياسة الخصوصية</label>
      <div className={l.nav}><button type="button" className={l.ghost} onClick={()=>setStep(1)}>رجوع</button><button type="button" className={l.primary} disabled={!ok2||busy} onClick={signup}>{busy?'لحظة…':'اعمل الحساب 🚀'}</button></div>
     </>}
    </>}
    {err&&<small className={l.err} role="alert">{err}</small>}{info&&<small className={l.demo} role="status">{info}</small>}
    {skip}
   </>}
  </section>
 </div></PublicMarketplaceShell>;
}
