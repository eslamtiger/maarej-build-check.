'use client';
// The six parent pages. All demo data from parent-demo; money moves only in this browser (parent-state).
import Link from 'next/link';
import {useState} from 'react';
import {ChevronLeft,AlertTriangle,ArrowUpRight,ArrowDownLeft,Plus,Send,CheckCircle2} from 'lucide-react';
import {ParentShell,Avatar,Trend,Meter,Card} from './parent-shell';
import {parentDemo,avgScore,attendanceRate,homeworkRate,alertsFor} from '../../adapters/parent-demo';
import type {Child,SubjectRecord} from '../../adapters/parent-demo';
import {useParent,topUp,sendToChild,payItem,saveSettings,pickChild} from '../../adapters/parent-state';
import {teacherById,centerById,days,timeRange,hasProfile} from '../../adapters/schedule';
import {WeekGrid} from '../schedule';
import type {Block} from '../schedule';
import {TeacherPortrait} from '../teacher-card';
import {placePhoto} from '../../adapters/places';
import p from './parent.module.css';

const egp=(n:number)=><><bdi>{n.toLocaleString('ar-EG')}</bdi> ج.م</>;
const levelName=['','بادئ','بيتحسّن','كويس','قوي','ثابت'];

/* ---------- 1. Dashboard ---------- */
export function ParentDashboard(){
 const st=useParent();
 const due=parentDemo.children.flatMap(c=>c.payments).filter(x=>x.status!=='paid'&&!st.paid.includes(x.id));
 const upcoming=parentDemo.children.flatMap(c=>c.subjects.map(s=>({c,s}))).sort((a,b)=>a.s.session.day-b.s.session.day||a.s.session.start-b.s.session.start).slice(0,5);
 return <ParentShell title={`أهلًا، ${parentDemo.name.split(' ')[0]}`}>
  <div className={p.kpis}>
   <Link href="/parent/finance" className={p.kpi}><small>رصيدك</small><b>{egp(st.wallet)}</b></Link>
   <Link href="/parent/finance" className={p.kpi} data-tone={due.length?'warn':undefined}><small>مستحق الشهر ده</small><b>{egp(due.reduce((a,x)=>a+x.amount,0))}</b></Link>
   <div className={p.kpi}><small>الأبناء</small><b><bdi>{parentDemo.children.length}</bdi></b></div>
  </div>
  <div className={p.kids}>{parentDemo.children.map(c=><KidSummary key={c.id} c={c}/>)}</div>
  <Card title="الحصص الجاية">
   <ul className={p.rows}>{upcoming.map(({c,s})=><li key={c.id+s.subject}><span className={p.rowMain}><b>{s.subject}</b><small>{c.name} · {teacherById(s.teacherId)?.name}</small></span><span className={p.rowSide}>{days[s.session.day]} · {timeRange(s.session.start,s.session.dur)}</span></li>)}</ul>
  </Card>
 </ParentShell>;
}
function KidSummary({c}:{c:Child}){
 const alerts=alertsFor(c),avg=avgScore(c),trend=Math.round(c.subjects.reduce((a,s)=>a+s.trend,0)/Math.max(1,c.subjects.length));
 return <article className={p.kid}>
  <div className={p.kidHead}><Avatar c={c} size={52}/><div><h2>{c.name}</h2><small>{c.grade}</small></div></div>
  <dl className={p.stats}>
   <div><dt>المتوسط</dt><dd><bdi>{avg}%</bdi> <Trend v={trend}/></dd></div>
   <div><dt>الحضور</dt><dd><bdi>{attendanceRate(c)}%</bdi></dd></div>
   <div><dt>الواجبات</dt><dd><bdi>{homeworkRate(c)}%</bdi></dd></div>
  </dl>
  <p className={p.identityLine}>الهوية: <b>{c.identity.name}</b> · مرحلة {c.identity.stage}</p>
  {alerts.length>0?<ul className={p.alerts}>{alerts.map(a=><li key={a.text}><Link href={a.href} onClick={()=>pickChild(c.id)}><AlertTriangle size={15} aria-hidden="true"/>{a.text}</Link></li>)}</ul>:<p className={p.ok}><CheckCircle2 size={15} aria-hidden="true"/>مفيش حاجة محتاجة انتباه</p>}
  <div className={p.kidLinks}><Link href="/parent/learning" onClick={()=>pickChild(c.id)}>المستوى التعليمي<ChevronLeft size={16}/></Link><Link href="/parent/upbringing" onClick={()=>pickChild(c.id)}>التربية<ChevronLeft size={16}/></Link></div>
 </article>;
}

/* ---------- 2. Educational level ---------- */
export function ParentLearning(){
 const {child:c}=useParent();
 const [open,setOpen]=useState<string|null>(null);
 return <ParentShell title="المستوى التعليمي" childPicker>
  <div className={p.kpis}>
   <div className={p.kpi}><small>المتوسط</small><b><bdi>{avgScore(c)}%</bdi></b></div>
   <div className={p.kpi}><small>الحضور</small><b><bdi>{attendanceRate(c)}%</bdi></b></div>
   <div className={p.kpi}><small>الواجبات</small><b><bdi>{homeworkRate(c)}%</bdi></b></div>
  </div>
  <Card title="التطور على مدار السنة"><LineChart points={c.yearTrend}/></Card>
  <Card title="المواد">
   <ul className={p.subjects}>{c.subjects.map(s=><li key={s.subject}><button type="button" className={p.subjectRow} aria-expanded={open===s.subject} onClick={()=>setOpen(v=>v===s.subject?null:s.subject)}>
    <span className={p.rowMain}><b>{s.subject}</b><small>{teacherById(s.teacherId)?.name}</small></span>
    <span className={p.subjectNums}><span><small>الدرجة</small><b><bdi>{s.score}%</bdi></b></span><Trend v={s.trend}/><span><small>الحضور</small><b><bdi>{s.attendance.present}/{s.attendance.present+s.attendance.absent}</bdi></b></span></span>
    <ChevronLeft size={18} className={p.chev} aria-hidden="true"/></button>
    {open===s.subject&&<SubjectDetail s={s}/>}</li>)}</ul>
  </Card>
 </ParentShell>;
}
function SubjectDetail({s}:{s:SubjectRecord}){
 const t=teacherById(s.teacherId);
 return <div className={p.detail}>
  <div className={p.detailGrid}>
   <div><h3>الاختبارات</h3><ul className={p.mini}>{s.exams.map(e=><li key={e.name}><span>{e.name} <small>{e.date}</small></span><b><bdi>{e.score}/{e.of}</bdi></b></li>)}</ul></div>
   <div><h3>الحضور والواجبات</h3><ul className={p.mini}><li><span>حضور</span><b><bdi>{s.attendance.present}</bdi></b></li><li><span>غياب</span><b><bdi>{s.attendance.absent}</bdi></b></li><li><span>تأخير</span><b><bdi>{s.attendance.late}</bdi></b></li><li><span>واجبات اتسلّمت</span><b><bdi>{s.homework.done}/{s.homework.total}</bdi></b></li></ul></div>
  </div>
  <blockquote className={p.note}><b>ملاحظة {t?.name}:</b> {s.note}</blockquote>
 </div>;
}
// One line over the school year; values printed on each point so nothing depends on colour or hover.
function LineChart({points}:{points:{label:string;score:number}[]}){
 const W=420,H=200,pad=26,min=Math.min(...points.map(x=>x.score))-6,max=Math.max(...points.map(x=>x.score))+4;
 const x=(i:number)=>W-pad-(i*(W-pad*2))/(points.length-1),y=(v:number)=>H-pad-((v-min)/(max-min))*(H-pad*2);
 const d=points.map((pt,i)=>`${i?'L':'M'}${x(i)} ${y(pt.score)}`).join(' ');
 return <figure className={p.chart}><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={points.map(pt=>`${pt.label} ${pt.score}%`).join('، ')}>
  {[0,.5,1].map(f=><line key={f} x1={pad} x2={W-pad} y1={pad+f*(H-pad*2)} y2={pad+f*(H-pad*2)} className={p.grid}/>)}
  <line x1={(x(3)+x(4))/2} x2={(x(3)+x(4))/2} y1={pad-10} y2={H-pad+6} className={p.split}/>
  <path d={d} className={p.line}/>
  {points.map((pt,i)=><g key={pt.label}><circle cx={x(i)} cy={y(pt.score)} r={i===points.length-1?6:4} className={i===points.length-1?p.dotNow:p.dot}/><text x={x(i)} y={y(pt.score)-12} className={p.val}>{pt.score}</text><text x={x(i)} y={H-8} className={p.lbl}>{pt.label}</text></g>)}
 </svg><figcaption>السنة اللي فاتت ← السنة دي</figcaption></figure>;
}

/* ---------- 3. Upbringing ---------- */
export function ParentUpbringing(){
 const {child:c}=useParent();
 return <ParentShell title="التربية" childPicker>
  <Card title="الهوية">
   <p className={p.identityBig}><b>{c.identity.name}</b><span>مرحلة {c.identity.stage}</span></p>
   <div className={p.steps} aria-label={`${c.identity.steps} من ${c.identity.of} خطوات للمرحلة الجاية`}>{Array.from({length:c.identity.of},(_,i)=><i key={i} data-on={i<c.identity.steps}/>)}</div>
   <small className={p.muted}>الجاية: {c.identity.next} · الهوية مش بتنزل، بتكبر بالمجهود</small>
  </Card>
  <Card title="جوانب الشخصية">
   <ul className={p.domains}>{c.domains.map(d=><li key={d.id}><span className={p.rowMain}><b>{d.name}</b><small>{d.note}</small></span><span className={p.level}><span className={p.dots} aria-hidden="true">{[1,2,3,4,5].map(n=><i key={n} data-on={n<=d.level}/>)}</span><em>{levelName[d.level]}</em></span></li>)}</ul>
  </Card>
  <div className={p.twoCol}>
   <Card title="شاطر في"><ul className={p.tags}>{c.strengths.map(x=><li key={x} data-tone="good">{x}</li>)}</ul></Card>
   <Card title="محتاج متابعة"><ul className={p.tags}>{c.watch.map(x=><li key={x} data-tone="mid">{x}</li>)}</ul></Card>
  </div>
  <Card title="عادات المذاكرة"><ul className={p.habits}>{c.habits.map(x=><li key={x.label}><span>{x.label}</span><Meter value={x.value}/><b><bdi>{x.value}%</bdi></b></li>)}</ul></Card>
  <div className={p.twoCol}>
   <Card title="أنشطة برّه المذاكرة"><ul className={p.mini}>{c.activities.map(a=><li key={a.name}><span>{a.name}</span><small>{a.note}</small></li>)}</ul></Card>
   <Card title="تقدير من المدرسين"><ul className={p.mini}>{c.recognitions.map(r=><li key={r.text}><span>{r.text}<small> · {r.from}</small></span><small>{r.date}</small></li>)}</ul></Card>
  </div>
 </ParentShell>;
}

/* ---------- 4. Teachers and centers ---------- */
export function ParentTeachers(){
 const {child:c}=useParent();
 const blocks:Block[]=c.subjects.map(s=>{const t=teacherById(s.teacherId);return {id:s.session.id,day:s.session.day,start:s.session.start,dur:s.session.dur,tone:'booked',title:s.subject,sub:t?.name,href:t&&hasProfile(t.id)?`/teachers/${t.id}`:undefined};});
 const centers=[...new Set(c.subjects.map(s=>s.centerId))].map(id=>centerById(id)).filter(Boolean);
 return <ParentShell title="المدرسين والسناتر" childPicker>
  <Card title="الجدول الأسبوعي"><WeekGrid label={`جدول ${c.name}`} blocks={blocks}/></Card>
  <Card title="المدرسين"><ul className={p.people}>{c.subjects.map(s=>{const t=teacherById(s.teacherId),ct=centerById(s.centerId);if(!t)return null;return <li key={s.subject}>
   <Link href={`/teachers/${t.id}`} className={p.person}><TeacherPortrait teacher={t} className={p.photo}/><span className={p.rowMain}><b>{t.name}</b><small>{s.subject} · {days[s.session.day]} {timeRange(s.session.start,s.session.dur)}{ct?` · ${ct.name}`:''}</small></span><span className={p.rowSide}>{egp(s.session.price)}<small> / حصة</small></span></Link></li>;})}</ul></Card>
  <Card title="السناتر"><ul className={p.people}>{centers.map(ct=><li key={ct!.id}><Link href={`/centers/${ct!.id}`} className={p.person}><img src={placePhoto('center',ct!.id,200)} alt="" className={p.photo}/><span className={p.rowMain}><b>{ct!.name}</b><small>{ct!.area} · {c.subjects.filter(s=>s.centerId===ct!.id).map(s=>s.subject).join('، ')}</small></span><ChevronLeft size={18} aria-hidden="true"/></Link></li>)}</ul></Card>
 </ParentShell>;
}

/* ---------- 5. Finance ---------- */
export function ParentFinance(){
 const st=useParent();
 const [kid,setKid]=useState(parentDemo.children[0].id);
 const [amount,setAmount]=useState(100);
 const [msg,setMsg]=useState('');
 const [who,setWho]=useState('all');
 const [more,setMore]=useState(false);
 const all=parentDemo.children.flatMap(c=>c.payments.map(x=>({...x,status:st.paid.includes(x.id)?'paid' as const:x.status,name:c.name}))).filter(x=>who==='all'||x.childId===who);
 const due=all.filter(x=>x.status!=='paid').sort((a,b)=>(a.status==='late'?0:1)-(b.status==='late'?0:1)),done=all.filter(x=>x.status==='paid');
 const filter=<div className={p.filter} role="tablist" aria-label="فلترة حسب الابن">{[{id:'all',name:'الكل'},...parentDemo.children].map(c=><button key={c.id} type="button" role="tab" aria-selected={who===c.id} onClick={()=>{setWho(c.id);setMore(false);}}>{c.name}</button>)}</div>;
 const kidName=(id?:string)=>parentDemo.children.find(c=>c.id===id)?.name??'';
 const send=()=>{if(amount<=0||amount>st.wallet){setMsg('الرصيد مش كفاية');return;}sendToChild(kid,amount,kidName(kid));setMsg(`اتحوّل ${amount} ج.م ل${kidName(kid)}`);};
 return <ParentShell title="المالية">
  <div className={p.walletRow}>
   <section className={p.wallet}><small>رصيدك على معارج</small><b>{egp(st.wallet)}</b>
    <div className={p.walletBtns}>{[200,500,1000].map(v=><button key={v} type="button" onClick={()=>{topUp(v);setMsg(`اتشحن ${v} ج.م`);}}><Plus size={15} aria-hidden="true"/>{v}</button>)}</div></section>
   <Card title="حوّل لابن">
    <div className={p.form}>
     <label>الابن<select value={kid} onChange={e=>setKid(e.target.value)}>{parentDemo.children.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
     <label>المبلغ<input type="number" min={1} value={amount} onChange={e=>setAmount(Number(e.target.value))} dir="ltr"/></label>
     <button type="button" className={p.primary} onClick={send}><Send size={16} aria-hidden="true"/>حوّل</button>
    </div>
    {msg&&<p className={p.msg} role="status">{msg}</p>}
   </Card>
  </div>
  <Card title="رصيد الأبناء"><ul className={p.rows}>{parentDemo.children.map(c=><li key={c.id}><span className={p.person}><Avatar c={c} size={36}/><span className={p.rowMain}><b>{c.name}</b><small>اتصرف الشهر ده {egp(c.payments.filter(x=>x.payer==='child'&&x.month==='أكتوبر').reduce((a,x)=>a+x.amount,0))}</small></span></span><b>{egp(st.kidWallet(c.id))}</b></li>)}</ul></Card>
  {filter}
  <Card title={`المستحق (${due.length})`} action={<b className={p.sum}>{egp(due.reduce((a,x)=>a+x.amount,0))}</b>}><ul className={p.rows}>{due.map(x=><li key={x.id} data-status={x.status}><span className={p.rowMain}><b>{x.subject} · {x.name}</b><small>{x.teacher} · {x.center} · {x.month}</small></span>
   <span className={p.payCol}><b>{egp(x.amount)}</b>{x.status==='late'&&<em className={p.late}>متأخر</em>}<button type="button" disabled={x.amount>st.wallet} onClick={()=>payItem(x.id,x.amount,`${x.subject} · ${x.name}`,x.childId)}>ادفع من الرصيد</button></span></li>)}</ul>
   {!due.length&&<p className={p.ok}><CheckCircle2 size={15} aria-hidden="true"/>كله مدفوع</p>}</Card>
  <Card title="حركة الرصيد"><ul className={p.rows}>{st.ledger.map(l=><li key={l.id}><span className={p.person}><span className={p.moveIcon} data-kind={l.kind} aria-hidden="true">{l.kind==='topup'?<ArrowDownLeft size={16}/>:<ArrowUpRight size={16}/>}</span><span className={p.rowMain}><b>{l.label}</b><small>{l.date}</small></span></span><b data-kind={l.kind}>{l.kind==='topup'?'+':'−'}{egp(l.amount)}</b></li>)}</ul></Card>
  <Card title={`المدفوعات اللي فاتت (${done.length})`}><ul className={p.rows}>{(more?done:done.slice(0,5)).map(x=><li key={x.id}><span className={p.rowMain}><b>{x.subject} · {x.name}</b><small>{x.teacher} · {x.month} · {x.payer==='child'?`دفع ${kidName(x.childId)} من رصيده`:'دفعتها إنت'}</small></span><b>{egp(x.amount)}</b></li>)}</ul>
   {done.length>5&&<button type="button" className={p.moreBtn} onClick={()=>setMore(v=>!v)}>{more?'أقل':`عرض الكل (${done.length})`}</button>}</Card>
 </ParentShell>;
}

/* ---------- 6. Settings ---------- */
export function ParentSettings(){
 const {settings:s}=useParent();
 const toggle=(k:'absence'|'grades'|'payments'|'weekly'|'childPays',label:string)=><label className={p.toggle}><span>{label}</span><input type="checkbox" checked={s[k]} onChange={e=>saveSettings({[k]:e.target.checked})}/></label>;
 return <ParentShell title="الإعدادات">
  <Card title="التنبيهات">{toggle('absence','لما ابني يغيب')}{toggle('grades','لما درجة تنزل')}{toggle('payments','قبل ميعاد الدفع')}{toggle('weekly','تقرير أسبوعي')}</Card>
  <Card title="مصروف الأبناء">{toggle('childPays','الأبناء يدفعوا الحصص من رصيدهم')}
   <label className={p.field}>أقصى مبلغ يتصرف من رصيد كل ابن في الشهر<input type="number" min={0} value={s.limit} onChange={e=>saveSettings({limit:Number(e.target.value)})} dir="ltr"/></label></Card>
  <Card title="العرض"><label className={p.field}>الابن اللي يظهر الأول<select value={s.defaultChild} onChange={e=>{saveSettings({defaultChild:e.target.value});pickChild(e.target.value);}}>{parentDemo.children.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></Card>
  <Card title="الأبناء المربوطين"><ul className={p.rows}>{parentDemo.children.map(c=><li key={c.id}><span className={p.person}><Avatar c={c} size={36}/><span className={p.rowMain}><b>{c.name}</b><small>{c.grade} · {c.school}</small></span></span><span className={p.okTag}>مربوط</span></li>)}</ul></Card>
 </ParentShell>;
}
