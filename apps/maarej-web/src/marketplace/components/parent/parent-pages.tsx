'use client';
// Parent pages. Data comes from useParentData(): the database when signed in as a parent, the demo family otherwise.
import Link from 'next/link';
import {useState} from 'react';
import type {ReactNode} from 'react';
import {ChevronLeft,AlertTriangle,CheckCircle2,Phone,MessageCircle,Mail,Send,ArrowDownLeft,ArrowUpRight,Lock,MapPin,Clock3,LogOut} from 'lucide-react';
import {ParentShell,KidPhoto,Card,egp,Meter,Empty} from './parent-shell';
import {useParentData,kidAvg,kidAttendance,kidHomework,kidDue,kidExpected,groupDue,siteDay,hm} from '../../adapters/parent-data';
import type {Kid,Group,ParentData,Me} from '../../adapters/parent-data';
import {signOut} from '../../adapters/backend';
import {days} from '../../adapters/schedule';
import {WeekGrid} from '../schedule';
import type {Block} from '../schedule';
import p from './parent.module.css';

const intl=(ph?:string)=>{const d=(ph??'').replace(/\D/g,'');return d.startsWith('0')?'2'+d:d;};
const when=(iso?:string)=>{if(!iso)return '';const d=new Date(iso);return isNaN(+d)?iso:`${d.getDate()}/${d.getMonth()+1}`;};
const scheduleText=(g:Group)=>g.schedule.map(s=>`${days[siteDay(s.day)]} ${hm(s.start)}`).join('، ')||'لسه مفيش ميعاد';
// One short verdict from the numbers we have.
function verdict(k:Kid){const a=kidAvg(k),t=kidAttendance(k);if(a===null&&t===null)return {e:'⏳',text:'لسه مفيش بيانات كفاية'};
 const s=Math.min(a??100,t??100);return s>=85?{e:'🌟',text:'ماشي ممتاز'}:s>=70?{e:'👍',text:'كويس ومستقر'}:{e:'⚠️',text:'محتاج متابعة'};}
function useAct(){const [msg,setMsg]=useState<{ok:boolean;text:string}|null>(null);const [busy,setBusy]=useState(false);
 const go=async(fn:()=>Promise<unknown>,ok:string)=>{setBusy(true);setMsg(null);try{await fn();setMsg({ok:true,text:ok});}catch(e:any){setMsg({ok:false,text:e?.message??'حصلت مشكلة'});}finally{setBusy(false);}};
 const note=msg&&<p className={msg.ok?p.okMsg:p.error} role="status">{msg.text}</p>;return {go,busy,note};}

/* ---------- 1. Home ---------- */
export function ParentDashboard(){
 const {data,kid,live,error}=useParentData();
 return <ParentShell title="الرئيسية" emoji="🏠" data={data} kid={kid} live={live} error={error}>{data&&kid&&<HomeBody data={data} k={kid}/>}</ParentShell>;
}
function HomeBody({data,k}:{data:ParentData;k:Kid}){
 const v=verdict(k),avg=kidAvg(k),att=kidAttendance(k),hw=kidHomework(k),due=kidDue(k);
 const alerts:{text:string;href:string}[]=[];
 for(const g of k.groups){if(g.invoices.some(i=>i.status==='overdue'))alerts.push({text:`💸 فلوس ${g.subject} متأخرة`,href:'/parent/finance'});
  const sc=g.exams.filter(e=>e.score!==null),l1=sc[sc.length-1],l2=sc[sc.length-2];if(l1&&l2&&(l1.score as number)/l1.max<(l2.score as number)/l2.max)alerts.push({text:`📉 درجة ${g.subject} نزلت`,href:'/parent/learning'});
  if(g.attendance.absent>=2)alerts.push({text:`🚪 ${g.attendance.absent} غياب في ${g.subject}`,href:'/parent/learning'});}
 const pending=k.withdrawals.filter(w=>w.status==='pending').length;if(pending)alerts.push({text:`⏳ ${pending} طلب استرجاع مستني موافقة ${k.name.split(' ')[0]}`,href:'/parent/finance'});
 const next=k.groups.flatMap(g=>g.schedule.map(s=>({g,s}))).sort((a,b)=>((a.s.day+1)%7)-((b.s.day+1)%7)).slice(0,4);
 return <>
  <section className={p.hero}>
   <KidPhoto kid={k} size={72}/>
   <div><h2>{k.name}</h2><p>{k.stage}{k.school?` · ${k.school}`:''}</p><span className={p.verdict}>{v.e} {v.text}</span></div>
  </section>
  <div className={p.tiles}>
   <Tile e="📈" label="متوسط الاختبارات" value={avg===null?'—':`${avg}%`} href="/parent/learning" tone="blue"/>
   <Tile e="✅" label="الحضور" value={att===null?'—':`${att}%`} href="/parent/learning" tone="green"/>
   <Tile e="📝" label="الواجبات" value={hw===null?'—':`${hw}%`} href="/parent/learning" tone="violet"/>
   <Tile e="💰" label="رصيده" value={egp(k.money.balance)} href="/parent/finance" tone="amber"/>
   <Tile e="📅" label="مستحق عليه" value={egp(due)} href="/parent/finance" tone={due?'pink':'gray'}/>
   <Tile e="🏅" label="شاراته" value={String(k.badges.length)} href="/parent/rewards" tone="violet"/>
  </div>
  <Card title="محتاج انتباهك" emoji="🔔" tone={alerts.length?'pink':'green'}>{alerts.length?<ul className={p.alerts}>{alerts.map(a=><li key={a.text}><Link href={a.href}>{a.text}<ChevronLeft size={16}/></Link></li>)}</ul>:<p className={p.okMsg}><CheckCircle2 size={16}/> كله تمام</p>}</Card>
  <div className={p.twoCol}>
   <Card title="حصصه في الأسبوع" emoji="🗓️" tone="blue">{next.length?<ul className={p.rows}>{next.map(({g,s})=><li key={g.id+s.day}><span className={p.rowMain}><b>{g.subject}</b><small>{g.teacher.name}{g.center?` · ${g.center}`:''}</small></span><span className={p.rowSide}>{days[siteDay(s.day)]} · {hm(s.start)}</span></li>)}</ul>:<Empty>مفيش حصص لسه</Empty>}</Card>
   <Card title="آخر الشارات" emoji="🏅" tone="amber">{k.badges.length?<ul className={p.rows}>{k.badges.slice(0,3).map(b=><li key={b.id}><span className={p.badgeIcon} aria-hidden="true">{b.icon.length<=2?b.icon:'🏅'}</span><span className={p.rowMain}><b>{b.name}</b><small>{b.from}{b.note?` · ${b.note}`:''}</small></span></li>)}</ul>:<Empty>لسه مفيش شارات</Empty>}</Card>
  </div>
  {data.children.length>1&&<Card title="كل الأبناء" emoji="👨‍👩‍👧" tone="gray"><ul className={p.rows}>{data.children.map(c=>{const vv=verdict(c);return <li key={c.id}><span className={p.person}><KidPhoto kid={c} size={36}/><span className={p.rowMain}><b>{c.name}</b><small>{vv.e} {vv.text}</small></span></span><span className={p.rowSide}>مستحق {egp(kidDue(c))}</span></li>;})}</ul></Card>}
 </>;
}
function Tile({e,label,value,href,tone}:{e:string;label:string;value:ReactNode;href:string;tone:string}){return <Link href={href} className={p.tile} data-tone={tone}><span aria-hidden="true">{e}</span><small>{label}</small><b>{value}</b></Link>;}

/* ---------- 2. Learning ---------- */
export function ParentLearning(){
 const {data,kid:k,live,error}=useParentData();
 const [open,setOpen]=useState<string|null>(null);
 return <ParentShell title="المستوى التعليمي" emoji="📚" data={data} kid={k} live={live} error={error}>{k&&<>
  <div className={p.tiles}>
   <Tile e="📈" label="متوسط الاختبارات" value={kidAvg(k)===null?'—':`${kidAvg(k)}%`} href="#subjects" tone="blue"/>
   <Tile e="✅" label="الحضور" value={kidAttendance(k)===null?'—':`${kidAttendance(k)}%`} href="#subjects" tone="green"/>
   <Tile e="📝" label="الواجبات" value={kidHomework(k)===null?'—':`${kidHomework(k)}%`} href="#subjects" tone="violet"/>
  </div>
  {k.extra?.yearTrend&&<Card title="التطور على مدار السنة" emoji="📊" tone="blue"><LineChart points={k.extra.yearTrend}/></Card>}
  <Card title="المواد" emoji="📖" tone="gray" id="subjects">{k.groups.length?<ul className={p.subjects}>{k.groups.map(g=>{const sc=g.exams.filter(e=>e.score!==null),last=sc[sc.length-1],prev=sc[sc.length-2];
   const pct=last?Math.round((last.score as number)/last.max*100):null,diff=last&&prev?pct!-Math.round((prev.score as number)/prev.max*100):0;
   return <li key={g.id}><button type="button" className={p.subjectRow} aria-expanded={open===g.id} onClick={()=>setOpen(v=>v===g.id?null:g.id)}>
    <span className={p.rowMain}><b>{g.subject}</b><small>{g.teacher.name}</small></span>
    <span className={p.subjectNums}><span><small>آخر اختبار</small><b>{pct===null?'—':<bdi>{pct}%</bdi>}</b></span>{diff!==0&&<span className={p.trend} data-dir={diff>0?'up':'down'}>{diff>0?'▲':'▼'} <bdi>{Math.abs(diff)}</bdi></span>}<span><small>الحضور</small><b><bdi>{g.attendance.present}/{g.attendance.present+g.attendance.absent}</bdi></b></span></span>
    <ChevronLeft size={18} className={p.chev} aria-hidden="true"/></button>
    {open===g.id&&<div className={p.detail}><div className={p.detailGrid}>
     <div><h3>📝 الاختبارات</h3>{g.exams.length?<ul className={p.mini}>{g.exams.map(e=><li key={e.title}><span>{e.title} <small>{when(e.date)}</small></span><b>{e.score===null?'—':<bdi>{e.score}/{e.max}</bdi>}</b></li>)}</ul>:<Empty>مفيش اختبارات</Empty>}</div>
     <div><h3>✅ الحضور والواجبات</h3><ul className={p.mini}><li><span>حضور</span><b><bdi>{g.attendance.present}</bdi></b></li><li><span>غياب</span><b><bdi>{g.attendance.absent}</bdi></b></li><li><span>تأخير</span><b><bdi>{g.attendance.late}</bdi></b></li><li><span>واجبات اتسلّمت</span><b><bdi>{g.homework.done}/{g.homework.total}</bdi></b></li></ul></div>
    </div></div>}</li>;})}</ul>:<Empty>{k.name.split(' ')[0]} مش مشترك في مجموعات لسه</Empty>}</Card>
 </>}</ParentShell>;
}
function LineChart({points}:{points:{label:string;score:number}[]}){
 const W=420,H=200,pad=26,min=Math.min(...points.map(x=>x.score))-6,max=Math.max(...points.map(x=>x.score))+4;
 const x=(i:number)=>W-pad-(i*(W-pad*2))/(points.length-1),y=(v:number)=>H-pad-((v-min)/(max-min))*(H-pad*2);
 return <figure className={p.chart}><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={points.map(pt=>`${pt.label} ${pt.score}%`).join('، ')}>
  {[0,.5,1].map(f=><line key={f} x1={pad} x2={W-pad} y1={pad+f*(H-pad*2)} y2={pad+f*(H-pad*2)} className={p.grid}/>)}
  <path d={points.map((pt,i)=>`${i?'L':'M'}${x(i)} ${y(pt.score)}`).join(' ')} className={p.line}/>
  {points.map((pt,i)=><g key={pt.label}><circle cx={x(i)} cy={y(pt.score)} r={i===points.length-1?6:4} className={i===points.length-1?p.dotNow:p.dot}/><text x={x(i)} y={y(pt.score)-11} className={p.val}>{pt.score}</text><text x={x(i)} y={H-6} className={p.lbl}>{pt.label}</text></g>)}
 </svg></figure>;
}

/* ---------- 3. Upbringing ---------- */
const levelName=['','بادئ','بيتحسّن','كويس','قوي','ثابت'];
export function ParentUpbringing(){
 const {data,kid:k,live,error}=useParentData();
 const behavior=k?.badges.filter(b=>b.category==='behavior')??[];
 return <ParentShell title="التربية" emoji="🌱" data={data} kid={k} live={live} error={error}>{k&&<>
  <Card title="سلوكه في البيت" emoji="🏡" tone="green" action={<Link href="/parent/rewards" className={p.linkBtn}>امنح شارة</Link>}>{behavior.length?<ul className={p.badgeGrid}>{behavior.map(b=><li key={b.id}><span aria-hidden="true">{b.icon}</span><b>{b.name}</b><small>{when(b.at)}{b.note?` · ${b.note}`:''}</small></li>)}</ul>:<Empty>لسه مفيش شارات سلوك. ابدأ من «امنح شارة».</Empty>}</Card>
  {k.extra?<>
   <Card title="الهوية" emoji="🧭" tone="violet"><p className={p.identityBig}><b>{k.extra.identity.name}</b><span>مرحلة {k.extra.identity.stage}</span></p>
    <div className={p.steps}>{Array.from({length:k.extra.identity.of},(_,i)=><i key={i} data-on={i<k.extra!.identity.steps}/>)}</div><small className={p.muted}>الجاية: {k.extra.identity.next} · الهوية مش بتنزل، بتكبر بالمجهود</small></Card>
   <Card title="جوانب الشخصية" emoji="🧩" tone="blue"><ul className={p.domains}>{k.extra.domains.map(d=><li key={d.name}><span className={p.rowMain}><b>{d.name}</b><small>{d.note}</small></span><span className={p.level}><span className={p.dots}>{[1,2,3,4,5].map(n=><i key={n} data-on={n<=d.level}/>)}</span><em>{levelName[d.level]}</em></span></li>)}</ul></Card>
   <div className={p.twoCol}><Card title="شاطر في" emoji="💪" tone="green"><ul className={p.tags}>{k.extra.strengths.map(x=><li key={x} data-tone="good">{x}</li>)}</ul></Card><Card title="محتاج متابعة" emoji="👀" tone="amber"><ul className={p.tags}>{k.extra.watch.map(x=><li key={x} data-tone="mid">{x}</li>)}</ul></Card></div>
   <Card title="عادات المذاكرة" emoji="⏱️" tone="gray"><ul className={p.habits}>{k.extra.habits.map(x=><li key={x.label}><span>{x.label}</span><Meter value={x.value}/><b><bdi>{x.value}%</bdi></b></li>)}</ul></Card>
   <Card title="أنشطة برّه المذاكرة" emoji="⚽" tone="pink"><ul className={p.mini}>{k.extra.activities.map(a=><li key={a.name}><span>{a.name}</span><small>{a.note}</small></li>)}</ul></Card>
  </>:<Card title="تقييم المدرسين لشخصيته" emoji="🧩" tone="gray"><Empty>لسه المدرسين ما سجلوش تقييمات للشخصية والعادات. أول ما يسجلوا هتظهر هنا.</Empty></Card>}
 </>}</ParentShell>;
}

/* ---------- 4. Rewards and badges ---------- */
export function ParentRewards(){
 const {data,kid:k,live,error,actions}=useParentData();
 const a=useAct();
 const [badge,setBadge]=useState('');const [bnote,setBnote]=useState('');
 const [goal,setGoal]=useState({title:'',condition:'',amount:100,due:''});
 return <ParentShell title="المكافآت والشارات" emoji="🏅" data={data} kid={k} live={live} error={error}>{k&&data&&<>
  <Card title={`شارات ${k.name.split(' ')[0]}`} emoji="🎖️" tone="amber">{k.badges.length?<ul className={p.badgeGrid}>{k.badges.map(b=><li key={b.id} data-cat={b.category}><span aria-hidden="true">{b.icon.length<=2?b.icon:'🏅'}</span><b>{b.name}</b><small>{b.fromRole==='parent'?'منك':b.from} · {when(b.at)}</small></li>)}</ul>:<Empty>لسه مفيش شارات</Empty>}</Card>
  <Card title="امنح شارة سلوك" emoji="🙏" tone="green">
   <div className={p.chips} role="radiogroup" aria-label="الشارة">{data.behaviorBadges.map(b=><button key={b.id} type="button" role="radio" aria-checked={badge===b.id} onClick={()=>setBadge(b.id)}><span aria-hidden="true">{b.icon}</span>{b.name}</button>)}</div>
   <label className={p.field}>كلمة صغيرة (اختياري)<input value={bnote} onChange={e=>setBnote(e.target.value)} placeholder="مثلًا: ساعد في البيت النهارده"/></label>
   <button type="button" className={p.primary} disabled={!badge||a.busy} onClick={()=>a.go(()=>actions.awardBadge(k.id,badge,bnote).then(()=>{setBadge('');setBnote('');}),'🎉 الشارة اتبعتت')}>امنح الشارة</button>{a.note}
  </Card>
  <Card title="أهداف بمكافأة" emoji="🎯" tone="violet">
   {k.rewards.length?<ul className={p.rows}>{k.rewards.map(r=><li key={r.id}><span className={p.rowMain}><b>{r.kind==='goal'?'🎯':'🎁'} {r.title}</b><small>{r.condition}{r.due?` · لحد ${when(r.due)}`:''} · {r.mine?'منك':'من المدرس'}</small></span>
    <span className={p.payCol}><b>{egp(r.amount)}</b><em className={p.status} data-s={r.status}>{r.status==='funded'?'محجوزة':r.status==='released'?'اتصرفت':'اتلغت'}</em>
     {r.mine&&r.status==='funded'&&<span className={p.inlineBtns}><button type="button" onClick={()=>a.go(()=>actions.releaseReward(k.id,r.id),'✅ المكافأة اتحولت لابنك')}>حقق الهدف</button><button type="button" className={p.ghostBtn} onClick={()=>a.go(()=>actions.cancelReward(k.id,r.id),'الفلوس رجعت لرصيدك')}>إلغاء</button></span>}</span></li>)}</ul>:<Empty>مفيش أهداف لسه</Empty>}
   <h3 className={p.subhead}>➕ هدف جديد</h3>
   <div className={p.form}>
    <label className={p.full}>الهدف<input value={goal.title} onChange={e=>setGoal({...goal,title:e.target.value})} placeholder="مثلًا: يجيب 18 من 20 في الرياضيات"/></label>
    <label className={p.full}>الشرط (اختياري)<input value={goal.condition} onChange={e=>setGoal({...goal,condition:e.target.value})} placeholder="مثلًا: اختبار آخر الشهر"/></label>
    <label>المكافأة (ج.م)<input type="number" min={1} value={goal.amount} onChange={e=>setGoal({...goal,amount:Number(e.target.value)})} dir="ltr"/></label>
    <label>لحد يوم<input type="date" value={goal.due} onChange={e=>setGoal({...goal,due:e.target.value})} dir="ltr"/></label>
    <button type="button" className={p.primary} disabled={!goal.title.trim()||goal.amount<=0||a.busy} onClick={()=>a.go(()=>actions.createGoal(k.id,goal.title.trim(),goal.condition.trim(),goal.amount,goal.due).then(()=>setGoal({title:'',condition:'',amount:100,due:''})),'🎯 الهدف اتسجل والمبلغ اتحجز من رصيدك')}>سجّل الهدف واحجز المبلغ</button>
   </div>
   <small className={p.muted}>المبلغ بيتحجز من رصيدك. لما تضغط «حقق الهدف» بيروح لرصيد ابنك كفلوس مكافأة، ومش هتقدر تسحبها غير بموافقته.</small>
  </Card>
 </>}</ParentShell>;
}

/* ---------- 5. Teachers and centers ---------- */
export function ParentTeachers(){
 const {data,kid:k,live,error,actions}=useParentData();
 const [chat,setChat]=useState<Group|null>(null);const [body,setBody]=useState('');
 const [ledger,setLedger]=useState<string|null>(null);
 const a=useAct();
 const blocks:Block[]=k?k.groups.flatMap(g=>g.schedule.map(s=>{const st=Number(s.start.split(':')[0]),en=Number(s.end.split(':')[0]);return {id:g.id+s.day,day:siteDay(s.day),start:st,dur:Math.max(1,en-st),tone:'booked' as const,title:g.subject,sub:g.teacher.name};})):[];
 return <ParentShell title="المدرسين والسناتر" emoji="👩‍🏫" data={data} kid={k} live={live} error={error}>{k&&<>
  <Card title="المدرسين" emoji="📞" tone="blue">{k.groups.length?<ul className={p.teachers}>{k.groups.map(g=>{const due=groupDue(g);return <li key={g.id}>
   <div className={p.person}><KidPhoto kid={{name:g.teacher.name,avatar:g.teacher.avatar}} size={52}/><span className={p.rowMain}><b>{g.teacher.name}</b><small>📖 {g.subject} · 🗓️ {scheduleText(g)}{g.center?` · 🏫 ${g.center}`:''}</small><small>💵 {egp(g.price)} / حصة</small></span></div>
   <div className={p.contact}>
    {g.teacher.phone&&<a href={`tel:+${intl(g.teacher.phone)}`} aria-label={`اتصال بـ${g.teacher.name}`}><Phone size={18}/>اتصال</a>}
    {(g.teacher.whatsapp||g.teacher.phone)&&<a href={`https://wa.me/${intl(g.teacher.whatsapp||g.teacher.phone)}`} target="_blank" rel="noopener noreferrer" data-k="wa"><MessageCircle size={18}/>واتساب</a>}
    {g.teacher.phone&&<a href={`sms:+${intl(g.teacher.phone)}`}><Mail size={18}/>SMS</a>}
    <button type="button" onClick={()=>{setChat(g);setBody('');}} data-k="app"><Send size={18}/>رسالة</button>
   </div>
   <button type="button" className={p.dueRow} data-has={due>0} aria-expanded={ledger===g.id} onClick={()=>setLedger(v=>v===g.id?null:g.id)}>{due>0?<>💸 عليه {egp(due)}</>:<>✅ مفيش مستحقات</>}<span>سجل الفلوس<ChevronLeft size={16}/></span></button>
   {ledger===g.id&&<InvoiceLedger g={g}/>}
  </li>;})}</ul>:<Empty>مفيش مدرسين لسه</Empty>}</Card>
  <Card title="الجدول الأسبوعي" emoji="🗓️" tone="gray">{blocks.length?<WeekGrid label={`جدول ${k.name}`} blocks={blocks}/>:<Empty>مفيش مواعيد</Empty>}</Card>
  {chat&&<div className={p.sheetBack} onClick={()=>setChat(null)}><div className={p.sheet} role="dialog" aria-label={`رسالة لـ${chat.teacher.name}`} onClick={e=>e.stopPropagation()}>
   <h2>✉️ رسالة لـ{chat.teacher.name}</h2><small className={p.muted}>بخصوص {k.name} · {chat.subject}</small>
   <textarea rows={4} value={body} onChange={e=>setBody(e.target.value)} placeholder="اكتب رسالتك" maxLength={2000}/>
   <div className={p.inlineBtns}><button type="button" className={p.primary} disabled={!body.trim()||a.busy} onClick={()=>a.go(()=>actions.message(chat.teacher.id,k.id,body.trim()).then(()=>setBody('')),live?'✅ الرسالة اتبعتت':'تجريبي: الرسالة مش بتتبعت فعلًا')}>ابعت</button><button type="button" className={p.ghostBtn} onClick={()=>setChat(null)}>إغلاق</button></div>{a.note}
  </div></div>}
 </>}</ParentShell>;
}
// One invoice per session (teacher app rule): label each with its session date.
const monthName=(iso:string)=>{const d=new Date(iso);return isNaN(+d)?iso:d.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});};
function InvoiceLedger({g}:{g:Group}){
 return g.invoices.length?<ul className={p.ledger}>{g.invoices.map(i=><li key={i.id} data-s={i.status}><span className={p.rowMain}><b>{monthName(i.period)}</b><small>{i.payments.length?i.payments.map(x=>`اتدفع ${x.amount} (${x.method==='wallet'?'من رصيده':x.method==='cash'?'كاش':x.method})${x.at?' · '+when(x.at):''}`).join('، '):i.due?`آخر ميعاد ${when(i.due)}`:''}</small></span>
  <span className={p.payCol}><b>{egp(i.amount)}</b><em className={p.status} data-s={i.status}>{i.status==='paid'?'مدفوع':i.status==='overdue'?'متأخر':i.status==='partial'?`باقي ${i.amount-i.paid}`:'مستحق'}</em></span></li>)}</ul>:<Empty>مفيش فواتير</Empty>;
}

/* ---------- 6. Finance ---------- */
export function ParentFinance(){
 const {data,kid:k,live,error,actions}=useParentData();
 const a=useAct();
 const [amount,setAmount]=useState(100);
 const [rAmount,setRAmount]=useState(50);
 const [open,setOpen]=useState<string|null>(null);
 return <ParentShell title="المالية" emoji="💰" data={data} kid={k} live={live} error={error}>{k&&data&&<>
  <div className={p.twoCol}>
   <section className={p.wallet}><small>💳 رصيدك على معارج</small><b>{egp(data.wallet)}</b><small className={p.walletNote}>{live?'شحن الرصيد هيتفتح لما نربط بوابة دفع.':'نسخة تجريبية'}</small></section>
   <section className={p.kidWallet}>
    <div className={p.person}><KidPhoto kid={k} size={44}/><span className={p.rowMain}><b>رصيد {k.name.split(' ')[0]}</b><small>إجمالي {egp(k.money.balance)}</small></span></div>
    <div className={p.split}><div><small>🔓 تقدر تسحبه</small><b>{egp(k.money.free)}</b></div><div data-k="lock"><small><Lock size={13}/> فلوس مكافآت</small><b>{egp(k.money.reward)}</b></div></div>
   </section>
  </div>
  <Card title="حط أو اسحب فلوس" emoji="🔁" tone="green">
   <div className={p.form}>
    <label className={p.full}>المبلغ (ج.م)<input type="number" min={1} value={amount} onChange={e=>setAmount(Number(e.target.value))} dir="ltr"/></label>
    <button type="button" className={p.primary} disabled={amount<=0||a.busy} onClick={()=>a.go(()=>actions.deposit(k.id,amount),`✅ اتحط ${amount} ج.م في رصيد ${k.name.split(' ')[0]}`)}><ArrowUpRight size={16}/>حط لـ{k.name.split(' ')[0]}</button>
    <button type="button" className={p.secondary} disabled={amount<=0||a.busy} onClick={()=>a.go(()=>actions.withdraw(k.id,amount),`✅ اتسحب ${amount} ج.م لرصيدك`)}><ArrowDownLeft size={16}/>اسحب منه</button>
   </div>{a.note}
   <small className={p.muted}>تقدر تسحب لحد {egp(k.money.free)}. فلوس المكافآت ({egp(k.money.reward)}) مش بترجع غير لو {k.name.split(' ')[0]} وافق.</small>
   {k.money.reward>0&&<details className={p.details}><summary>🔒 اطلب استرجاع من فلوس المكافآت</summary>
    <div className={p.form}><label className={p.full}>المبلغ<input type="number" min={1} max={k.money.reward} value={rAmount} onChange={e=>setRAmount(Number(e.target.value))} dir="ltr"/></label>
     <button type="button" className={p.secondary} disabled={rAmount<=0||a.busy} onClick={()=>a.go(()=>actions.requestReward(k.id,rAmount,''),`⏳ الطلب اتبعت لـ${k.name.split(' ')[0]} يوافق عليه`)}>ابعت الطلب</button></div></details>}
   {k.withdrawals.length>0&&<ul className={p.rows}>{k.withdrawals.map(w=><li key={w.id}><span className={p.rowMain}><b>طلب استرجاع {egp(w.amount)}</b><small>{when(w.at)}</small></span><em className={p.status} data-s={w.status}>{w.status==='pending'?'مستني موافقته':w.status==='approved'?'وافق':'رفض'}</em></li>)}</ul>}
  </Card>
  <Card title="المتوقع يتسحب الشهر ده" emoji="📆" tone="amber"><p className={p.big}>{egp(kidExpected(k))}</p><ul className={p.rows}>{k.groups.map(g=><li key={g.id}><span className={p.rowMain}><b>{g.subject}</b><small>{g.teacher.name} · {g.monthSessions||g.schedule.length*4} حصص × {egp(g.price)}</small></span><b>{egp(g.price*(g.monthSessions||g.schedule.length*4))}</b></li>)}</ul>
   {k.money.balance<kidExpected(k)&&<p className={p.warnLine}><AlertTriangle size={15}/> رصيده أقل من المتوقع بـ{egp(kidExpected(k)-k.money.balance)}</p>}</Card>
  <Card title="الجهات اللي بيتعامل معاها" emoji="🧾" tone="blue"><ul className={p.rows}>{k.groups.map(g=>{const due=groupDue(g);return <li key={g.id} className={p.stack}>
   <button type="button" className={p.dueRow} data-has={due>0} aria-expanded={open===g.id} onClick={()=>setOpen(v=>v===g.id?null:g.id)}><span className={p.rowMain}><b>{g.teacher.name}</b><small>{g.subject}{g.center?` · ${g.center}`:''}</small></span><span>{due>0?<>عليه {egp(due)}</>:'✅'}<ChevronLeft size={16}/></span></button>
   {open===g.id&&<InvoiceLedger g={g}/>}</li>;})}</ul></Card>
  <Card title="حركة رصيدك" emoji="📒" tone="gray">{data.ledger.length?<ul className={p.rows}>{data.ledger.map(l=><li key={l.id}><span className={p.person}><span className={p.moveIcon} data-dir={l.dir} aria-hidden="true">{l.dir==='in'?<ArrowDownLeft size={16}/>:<ArrowUpRight size={16}/>}</span><span className={p.rowMain}><b>{ledgerLabel(l)}</b><small>{when(l.at)}</small></span></span><b data-dir={l.dir}>{l.dir==='in'?'+':'−'}{egp(l.amount)}</b></li>)}</ul>:<Empty>مفيش حركات</Empty>}</Card>
 </>}</ParentShell>;
}
function ledgerLabel(l:ParentData['ledger'][number]){
 if(l.kind==='top_up')return 'شحن رصيد';
 if(l.ref==='guardian_deposit')return `إيداع لـ${l.other??''}`;
 if(l.ref==='guardian_withdraw')return `سحب من ${l.other??''}`;
 if(l.ref==='reward_return')return `استرجاع مكافأة من ${l.other??''} (بموافقته)`;
 if(l.kind==='reward_funding')return `حجز مكافأة: ${l.note??''}`;
 if(l.ref==='reward_cancel')return `إلغاء مكافأة: ${l.note??''}`;
 return l.note??'حركة';
}

/* ---------- 7. My account: profile as others see it, edit, settings ---------- */
export function ParentSettings(){
 const {data,live,error,actions}=useParentData();
 return <ParentShell title="حسابي والإعدادات" emoji="👤" data={data} live={live} error={error} showKids={false}>{data&&<AccountBody data={data} live={live} actions={actions}/>}</ParentShell>;
}
function AccountBody({data,live,actions}:{data:ParentData;live:boolean;actions:ReturnType<typeof useParentData>['actions']}){
 const [f,setF]=useState<Me>(data.me);const a=useAct();const b=useAct();const [phone,setPhone]=useState('');
 const set=(k:keyof Me)=>(e:{target:{value:string}})=>setF({...f,[k]:k==='birthYear'?Number(e.target.value)||undefined:e.target.value});
 return <>
  <Card title="كده بيشوفك المدرس" emoji="🪪" tone="violet"><ProfileCard me={data.me} kids={data.children}/></Card>
  <Card title="بياناتك" emoji="✏️" tone="blue"><div className={p.form}>
   <label className={p.full}>الاسم<input value={f.name??''} onChange={set('name')}/></label>
   <label>الشغلانة<input value={f.job??''} onChange={set('job')}/></label>
   <label>سنة الميلاد<input type="number" value={f.birthYear??''} onChange={set('birthYear')} dir="ltr"/></label>
   <label>الموبايل<input value={f.phone??''} onChange={set('phone')} dir="ltr" inputMode="tel"/></label>
   <label>رقم تاني<input value={f.phone2??''} onChange={set('phone2')} dir="ltr" inputMode="tel"/></label>
   <label>واتساب<input value={f.whatsapp??''} onChange={set('whatsapp')} dir="ltr" inputMode="tel"/></label>
   <label>المنطقة<input value={f.area??''} onChange={set('area')}/></label>
   <label className={p.full}>العنوان<input value={f.address??''} onChange={set('address')}/></label>
   <label className={p.full}>متاح امتى<input value={f.availableHours??''} onChange={set('availableHours')} placeholder="مثلًا: يوميًا من 6 م لـ 9 م"/></label>
   <label className={p.full}>رابط صورتك<input value={f.avatar??''} onChange={set('avatar')} dir="ltr" placeholder="https://"/></label>
   <label className={p.full}>نبذة<textarea rows={3} value={f.about??''} onChange={set('about')}/></label>
   <button type="button" className={p.primary} disabled={a.busy||!f.name?.trim()} onClick={()=>a.go(()=>actions.saveMe(f),live?'✅ اتحفظ':'تجريبي: اتحفظ في الصفحة دي بس')}>احفظ</button>
  </div>{a.note}</Card>
  <Card title="الأبناء المربوطين" emoji="👨‍👩‍👧" tone="green"><ul className={p.rows}>{data.children.map(c=><li key={c.id}><span className={p.person}><KidPhoto kid={c} size={36}/><span className={p.rowMain}><b>{c.name}</b><small>{c.stage}{c.school?` · ${c.school}`:''}</small></span></span><span className={p.okTag}>مربوط</span></li>)}</ul>
   <div className={p.form}><label className={p.full}>اربط ابن برقم موبايله<input value={phone} onChange={e=>setPhone(e.target.value)} dir="ltr" inputMode="tel" placeholder="01xxxxxxxxx"/></label><button type="button" className={p.secondary} disabled={!phone.trim()||b.busy} onClick={()=>b.go(()=>actions.linkChild(phone.trim()),'⏳ اتبعت طلب الربط، ابنك هيوافق من حسابه')}>ابعت طلب ربط</button></div>{b.note}</Card>
  {live&&<button type="button" className={p.ghostBtn} onClick={()=>{signOut();location.assign('/login?next=/parent');}}><LogOut size={16}/>تسجيل خروج</button>}
 </>;
}
export function ProfileCard({me,kids}:{me:Me;kids?:{id:string;name:string;avatar?:string}[]}){
 const age=me.birthYear?new Date().getFullYear()-me.birthYear:null;
 return <div className={p.profile}>
  <div className={p.person}><KidPhoto kid={{name:me.name,avatar:me.avatar??'👤'}} size={72}/><span className={p.rowMain}><b className={p.pName}>{me.name}</b><small>{[me.job,age?`${age} سنة`:null].filter(Boolean).join(' · ')}</small>{me.about&&<small>{me.about}</small>}</span></div>
  <ul className={p.facts}>
   {me.area&&<li><MapPin size={16}/>{me.area}{me.address?` · ${me.address}`:''}{me.lat&&me.lng?<a href={`https://www.google.com/maps?q=${me.lat},${me.lng}`} target="_blank" rel="noopener noreferrer">الموقع على الخريطة</a>:null}</li>}
   {me.availableHours&&<li><Clock3 size={16}/>متاح: {me.availableHours}</li>}
   {me.phone&&<li><Phone size={16}/><a href={`tel:+${intl(me.phone)}`} dir="ltr">{me.phone}</a>{me.phone2&&<> · <a href={`tel:+${intl(me.phone2)}`} dir="ltr">{me.phone2}</a></>}</li>}
   {(me.whatsapp||me.phone)&&<li><MessageCircle size={16}/><a href={`https://wa.me/${intl(me.whatsapp||me.phone)}`} target="_blank" rel="noopener noreferrer">واتساب</a></li>}
  </ul>
  {kids&&kids.length>0&&<div className={p.kidChips}>{kids.map(c=><span key={c.id}><KidPhoto kid={c} size={26}/>{c.name}</span>)}</div>}
 </div>;
}
