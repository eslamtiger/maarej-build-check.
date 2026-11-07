'use client';
// Week timetable (Saturday → Friday rows, hours right → left) used on center and teacher profiles,
// plus the sheets that open from it: reserve a room, join a group. Everything ends in a demo confirmation.
import Link from 'next/link';
import {useMemo,useState,useCallback,useEffect,useRef} from 'react';
import type {ReactNode} from 'react';
import {CalendarDays,DoorOpen,UsersRound,CheckCircle2,Plus,Star,MapPin,Clock3} from 'lucide-react';
import {days,OPEN,CLOSE,hasProfile,sessionsForCenter,sessionsForTeacher,centerById,teacherById,hourLabel,timeRange,spaceRooms} from '../adapters/schedule';
import type {Session} from '../adapters/schedule';
import {useDemoRequests,addDemoRequest,newId} from '../adapters/demo-requests';
import {Mark} from './fun';
import type {RoomRequest} from '../adapters/demo-requests';
import {featureLabel,placePhotos,roomPhotos} from '../adapters/places';
import {swatchFor} from '../adapters/profile-demo';
import {Gallery} from './gallery';
import {emojiFor,subjectEmoji} from '../adapters/emoji';
import type {CenterDTO,SpaceDTO} from '../types/place';
import {Sheet} from './search-kit';
import {TeacherPortrait} from './teacher-card';
import s from './schedule.module.css';

const allHours=Array.from({length:CLOSE-OPEN},(_,i)=>OPEN+i);
type Swatch={bg:string;fg:string;bd:string};
export type Block={id:string;day:number;start:number;dur:number;tone:'booked'|'request'|'mine'|'full';title:string;sub?:string;href?:string;count?:{n:number;cap:number};price?:number;color?:Swatch;onClick?:()=>void};
export const fillOf=(n:number,cap:number)=>n>=cap?'full':n/cap>=.85?'hot':n/cap>=.6?'warm':'ok';

// Without free slots to book, only the hours that have sessions are shown (one hour of margin each side).
export function WeekGrid({blocks,onFree,label}:{blocks:Block[];onFree?:(day:number,hour:number)=>void;label:string}){
 const from=onFree||!blocks.length?OPEN:Math.max(OPEN,Math.min(...blocks.map(b=>b.start))-1),to=onFree||!blocks.length?CLOSE:Math.min(CLOSE,Math.max(...blocks.map(b=>b.start+b.dur))+1);
 const hours=allHours.filter(h=>h>=from&&h<to);
 const shown=days.map((d,i)=>i).filter(i=>onFree||blocks.some(b=>b.day===i)); // teacher view: only days with sessions
 const box=useRef<HTMLDivElement>(null);
 // Open scrolled to the first session of the week (RTL: scrollLeft goes negative to the left).
 useEffect(()=>{const el=box.current;if(!el||!blocks.length)return;const first=onFree?15:Math.min(...blocks.map(b=>b.start));el.scrollLeft=-Math.max(0,(first-from-1)*96);},[from]); // eslint-disable-line react-hooks/exhaustive-deps
 return <div className={s.scroller} role="region" aria-label={label} tabIndex={0} ref={box}>
  <div className={s.grid} style={{gridTemplateColumns:`72px repeat(${hours.length},96px)`}}>
   <span className={s.corner} aria-hidden="true"/>
   {hours.map(h=><span key={h} className={s.hour}>{hourLabel(h)}</span>)}
   {shown.map(di=>{const d=days[di];const row=blocks.filter(b=>b.day===di);const taken=new Set(row.flatMap(b=>Array.from({length:b.dur},(_,k)=>b.start+k)));
    return <div key={d} className={s.row} style={{gridColumn:`1 / -1`,gridTemplateColumns:'subgrid'}}>
     <span className={s.day}>{d}</span>
     {onFree&&hours.filter(h=>!taken.has(h)).map(h=><button key={h} type="button" className={s.free} style={{gridColumn:`${h-from+2} / span 1`}} onClick={()=>onFree(di,h)} aria-label={`احجز ${d} ${hourLabel(h)}`}><Plus size={16} aria-hidden="true"/></button>)}
     {row.map(b=>{const style={gridColumn:`${b.start-from+2} / span ${b.dur}`,...(b.color?{background:b.color.bg,color:b.color.fg,boxShadow:`inset 0 0 0 1.5px ${b.color.bd}`}:{})};
      return <div key={b.id} className={s.block} data-tone={b.tone} style={style}>
       {b.onClick&&<button type="button" className={s.hit} onClick={b.onClick} aria-label={`${b.title} ${b.sub??''}`}/>}
       <b>{b.title}</b>
       {b.sub&&(b.href?<Link href={b.href} className={s.who}>{b.sub}</Link>:<span className={s.who}>{b.sub}</span>)}
       {(b.count||b.price!==undefined)&&<span className={s.stat}>{b.count&&<CountPill n={b.count.n} cap={b.count.cap}/>}{b.price!==undefined&&<em className={s.price}>💰 <bdi>{b.price}</bdi></em>}</span>}
      </div>;})}
    </div>;})}
  </div>
 </div>;
}

// Student count of a group: green while there is room, yellow when it fills, flashing warning when nearly full, lock when full.
export function CountPill({n,cap,className}:{n:number;cap:number;className?:string}){
 const f=fillOf(n,cap);
 return <em className={`${s.cnt} ${className??''}`} data-fill={f}>{f==='full'?'🔒 كاملة':<>{f==='hot'&&<span className={s.warn} aria-hidden="true">⚠️</span>}👥 <bdi>{n}/{cap}</bdi></>}</em>;
}

export function Legend({items}:{items:{tone?:Block['tone'];color?:Swatch;label:string}[]}){
 return <ul className={s.legend}>{items.map(i=><li key={i.label}><i data-tone={i.tone} style={i.color?{background:i.color.bg,boxShadow:`inset 0 0 0 1.5px ${i.color.bd}`}:undefined} aria-hidden="true"/>{i.label}</li>)}</ul>;
}

function Done({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
 return <div className={s.done}><span className={s.doneIcon}><CheckCircle2 size={34} aria-hidden="true"/></span><h3>{title}</h3>{children}<small className={s.demoTag}>تجريبي · مفيش دفع</small><button type="button" className={s.primary} onClick={onClose}>تمام</button></div>;
}

/* ---------- Join a group ---------- */
export function JoinSheet({session:x,onClose}:{session:Session|null;onClose:()=>void}){
 const [sent,setSent]=useState(false);
 const requests=useDemoRequests();
 if(!x)return null;
 const t=teacherById(x.teacherId),c=centerById(x.centerId),left=x.capacity-x.enrolled;
 const already=requests.some(r=>r.kind==='join'&&r.sessionId===x.id);
 const close=()=>{setSent(false);onClose();};
 return <Sheet open icon={UsersRound} title="عايز تنضم للحصة دي؟" onClose={close}
  footer={sent||already?undefined:<>{left>0?<button type="button" className={s.primary} onClick={()=>{addDemoRequest({kind:'join',id:newId(),sessionId:x.id,createdAt:new Date().toISOString()});setSent(true);}}>انضم للمجموعة</button>:<span className={s.fullTag}>المجموعة كاملة</span>}</>}>
  {sent||already?<Done title="طلبك اتبعت للمدرس" onClose={close}><p className={s.doneText}>{t?.name} هيوافق على طلبك، وبعدها الحصة هتظهر في جدولك.</p></Done>:<>
   <div className={s.groupHead}>{t&&<TeacherPortrait teacher={t} className={s.groupPhoto}/>}<div><b>{subjectEmoji(x.subject)} {x.subject}</b><span>{t?.name}</span></div></div>
   <dl className={s.kv}>
    <div><dt><CalendarDays size={16}/>الميعاد</dt><dd>{days[x.day]} · {timeRange(x.start,x.dur)}</dd></div>
    <div><dt><MapPin size={16}/>السنتر</dt><dd>{c?<Link href={`/centers/${c.id}`}>{c.name} · {c.area}</Link>:'—'}</dd></div>
    <div><dt><UsersRound size={16}/>الطلاب</dt><dd>{x.enrolled} من {x.capacity} {left>0&&<em className={s.left}>باقي {left}</em>}</dd></div>
    <div><dt><Star size={16}/>المرحلة</dt><dd>{x.stage}</dd></div>
    <div><dt><Clock3 size={16}/>سعر الحصة</dt><dd><b>{x.price}</b> ج.م</dd></div>
   </dl>
  </>}
 </Sheet>;
}

/* ---------- Reserve a room ---------- */
const periods=[['term1','الترم الأول'],['term2','الترم التاني'],['year','السنة كلها']] as const;
export function RoomSheet({center:c,init,onClose}:{center:CenterDTO;init:{room:number;day:number;hour:number}|null;onClose:()=>void}){
 const [room,setRoom]=useState(init?.room??0);
 const [sel,setSel]=useState<number[]>(init?[init.day]:[]);
 const [start,setStart]=useState(init?.hour??16);
 const [end,setEnd]=useState(Math.min((init?.hour??16)+2,CLOSE));
 const [repeat,setRepeat]=useState<'once'|'weekly'>('weekly');
 const [period,setPeriod]=useState<RoomRequest['period']>('term1');
 const [collect,setCollect]=useState(false);
 const [sent,setSent]=useState(false);
 const requests=useDemoRequests();
 const taken=useMemo(()=>{const all=[...sessionsForCenter(c.id),...requests.filter((r):r is RoomRequest=>r.kind==='room'&&r.centerId===c.id).flatMap(r=>r.days.map(d=>({room:r.room,day:d,start:r.start,dur:r.end-r.start})))];
  return (d:number)=>all.some(x=>x.room===room&&x.day===d&&x.start<end&&start<x.start+x.dur);},[c.id,requests,room,start,end]);
 if(!init)return null;
 const r=c.rooms[room],hoursN=Math.max(0,end-start),perSession=hoursN*r.price,clash=sel.filter(taken);
 const ok=sel.length>0&&hoursN>0&&clash.length===0;
 const close=()=>{setSent(false);onClose();};
 return <Sheet open icon={DoorOpen} title="احجز قاعة" onClose={close}
  footer={sent?undefined:<button type="button" className={s.primary} disabled={!ok} onClick={()=>{addDemoRequest({kind:'room',id:newId(),centerId:c.id,room,days:sel,start,end,repeat,period,collect,createdAt:new Date().toISOString()});setSent(true);}}>ابعت طلب الحجز{ok&&<> · <bdi>{perSession*sel.length}</bdi> ج.م {repeat==='weekly'?'/ أسبوع':''}</>}</button>}>
  {sent?<Done title="طلبك اتبعت للسنتر" onClose={close}><p className={s.doneText}>{c.name} هيراجع الطلب ويوافق عليه أو يتواصل معاك. هتلاقيه في الجدول باللون البنفسجي.</p></Done>:<>
   <section className={s.field}><h3>القاعة</h3><div className={s.rooms}>{c.rooms.map((x,i)=><button key={x.name} type="button" aria-pressed={i===room} onClick={()=>setRoom(i)}><b>{x.name}</b><span>👥 {x.seats} · <bdi>{x.price}</bdi> ج.م/ساعة</span></button>)}</div>
    <ul className={s.feats}>{r.features.map(f=><li key={f}>{emojiFor(featureLabel(f))} {featureLabel(f)}</li>)}</ul></section>
   <section className={s.field}><h3>الأيام</h3><div className={s.chips}>{days.map((d,i)=><button key={d} type="button" aria-pressed={sel.includes(i)} data-clash={sel.includes(i)&&taken(i)} onClick={()=>setSel(v=>v.includes(i)?v.filter(x=>x!==i):[...v,i].sort())}>{d}</button>)}</div>
    {clash.length>0&&<p className={s.clash}>محجوز في الوقت ده: {clash.map(d=>days[d]).join('، ')}</p>}</section>
   <section className={s.field}><h3>الوقت</h3><div className={s.times}>
    <label>من<select value={start} onChange={e=>{const v=Number(e.target.value);setStart(v);if(end<=v)setEnd(Math.min(v+2,CLOSE));}}>{allHours.map(h=><option key={h} value={h}>{hourLabel(h)}</option>)}</select></label>
    <label>إلى<select value={end} onChange={e=>setEnd(Number(e.target.value))}>{allHours.map(h=>h+1).filter(h=>h>start).map(h=><option key={h} value={h}>{hourLabel(h)}</option>)}</select></label>
   </div></section>
   <section className={s.field}><h3>التكرار</h3><div className={s.chips}><button type="button" aria-pressed={repeat==='once'} onClick={()=>setRepeat('once')}>مرة واحدة</button><button type="button" aria-pressed={repeat==='weekly'} onClick={()=>setRepeat('weekly')}>كل أسبوع</button></div>
    {repeat==='weekly'&&<div className={s.chips}>{periods.map(([v,l])=><button key={v} type="button" aria-pressed={period===v} onClick={()=>setPeriod(v)}>{l}</button>)}</div>}</section>
   <label className={s.toggle}><input type="checkbox" checked={collect} onChange={e=>setCollect(e.target.checked)}/><span>💵 السنتر يحصّل الفلوس من الطلاب</span></label>
   <dl className={s.sum}><div><dt>الحصة</dt><dd><bdi>{hoursN}</bdi> ساعة × <bdi>{r.price}</bdi> = <b><bdi>{perSession}</bdi> ج.م</b></dd></div>{sel.length>1&&<div><dt>في الأسبوع</dt><dd><b><bdi>{perSession*sel.length}</bdi> ج.م</b></dd></div>}</dl>
  </>}
 </Sheet>;
}

/* ---------- Center: rooms timetable + teachers ---------- */
// Rooms: the tabs on top switch everything below together — photos, details, equipment and the week timetable.
export function CenterSchedule({center:c}:{center:CenterDTO}){
 const [room,setRoom]=useState(0);
 const [booking,setBooking]=useState<{room:number;day:number;hour:number}|null>(null);
 const [join,setJoin]=useState<Session|null>(null);
 const requests=useDemoRequests();
 const book=(day:number,hour:number)=>setBooking({room,day,hour}); // sign-in is optional for now
 const list=sessionsForCenter(c.id).filter(x=>x.room===room);
 const order=[...new Set(list.filter(x=>x.status==='booked').map(x=>x.teacherId))];
 const mine=requests.filter((r):r is RoomRequest=>r.kind==='room'&&r.centerId===c.id&&r.room===room);
 const blocks:Block[]=[
  ...list.map(x=>{const t=teacherById(x.teacherId);const full=x.enrolled>=x.capacity;
   return x.status==='request'?{id:x.id,day:x.day,start:x.start,dur:x.dur,tone:'request' as const,title:'طلب حجز',sub:t?.name}
   :{id:x.id,day:x.day,start:x.start,dur:x.dur,tone:full?'full' as const:'booked' as const,color:swatchFor(x.teacherId,order),title:`${subjectEmoji(x.subject)} ${x.subject} · ${x.stage}`,sub:t?.name,href:t&&hasProfile(t.id)?`/teachers/${t.id}`:undefined,count:{n:x.enrolled,cap:x.capacity},price:x.price,onClick:()=>setJoin(x)};}),
  ...mine.flatMap(r=>r.days.map(d=>({id:`${r.id}-${d}`,day:d,start:r.start,dur:r.end-r.start,tone:'mine' as const,title:'طلبك',sub:'مستني الموافقة'}))),
 ];
 const r=c.rooms[room],photos=roomPhotos(c.id,room,1000,4);
 const close=useCallback(()=>setBooking(null),[]),closeJoin=useCallback(()=>setJoin(null),[]);
 return <section className={s.section} aria-labelledby="sch-title" id="rooms">
  <div className={s.head}><h2 id="sch-title">🚪 القاعات</h2><button type="button" className={s.primary} onClick={()=>book(0,16)}><Plus size={18} aria-hidden="true"/>احجز قاعة</button></div>
  <div className={s.roomTabs} role="tablist" aria-label="القاعات">{c.rooms.map((x,i)=><button key={x.name} type="button" role="tab" aria-selected={i===room} onClick={()=>setRoom(i)}><b>{x.name}</b><span>👥 {x.seats} · <bdi>{x.price}</bdi> ج.م</span></button>)}</div>
  <div className={s.roomPanel} key={`panel-${room}`}>
   <div className={s.roomGallery}><Gallery photos={photos} size="hero"/></div>
   <div className={s.roomInfo}>
    <h3>{r.name}</h3>
    <dl className={s.roomRows}>
     <div><dt>👥 السعة</dt><dd>{r.seats} طالب</dd></div>
     <div><dt>💰 سعر الساعة</dt><dd><bdi>{r.price}</bdi> ج.م</dd></div>
     <div><dt>📚 المجموعات في الأسبوع</dt><dd>{list.filter(x=>x.status==='booked').length}</dd></div>
    </dl>
    <ul className={s.roomChips}>{r.features.map(f=><li key={f}><span aria-hidden="true">{emojiFor(featureLabel(f))}</span>{featureLabel(f)}</li>)}</ul>
   </div>
  </div>
  <div className={s.calHead}><h3><CalendarDays size={18} aria-hidden="true"/>جدول {r.name}</h3></div>
  <Legend items={[{tone:'request' as const,label:'طلب حجز'},{tone:'mine' as const,label:'طلبك'}]}/>
  <WeekGrid key={`grid-${room}`} label={`جدول ${r.name}`} blocks={blocks} onFree={book}/>
  <RoomSheet key={booking?`${booking.room}-${booking.day}-${booking.hour}`:'none'} center={c} init={booking} onClose={close}/>
  <JoinSheet session={join} onClose={closeJoin}/>
 </section>;
}

export function CenterTeachers({center:c}:{center:CenterDTO}){
 const [open,setOpen]=useState<string|null>(null);
 const [join,setJoin]=useState<Session|null>(null);
 const byTeacher=useMemo(()=>{const m=new Map<string,Session[]>();for(const x of sessionsForCenter(c.id))if(x.status==='booked')m.set(x.teacherId,[...(m.get(x.teacherId)??[]),x]);return [...m.entries()];},[c.id]);
 if(!byTeacher.length)return null;
 const groups=open?byTeacher.find(([id])=>id===open)?.[1]??[]:[];
 const [more,setMore]=useState(false);
 const visible=more?byTeacher:byTeacher.slice(0,8);
 const t=open?teacherById(open):undefined;
 return <section className={s.section} id="sec-our-t" aria-labelledby="our-t"><div className={s.head}><h2 id="our-t">🧑‍🏫 مدرسينا</h2></div>
  <ul className={s.teachers}>{visible.map(([id,list])=>{const x=teacherById(id);if(!x)return null;return <li key={id}>
   <button type="button" className={s.tCard} onClick={()=>setOpen(id)} aria-label={`حصص ${x.name}`}><TeacherPortrait teacher={x} className={s.tPhoto}/><b>{x.name}</b><em>{list.length}</em></button>
  </li>;})}</ul>
  {byTeacher.length>8&&<button type="button" className={s.moreBtn} onClick={()=>setMore(v=>!v)}>{more?'أقل':`كل المدرسين (${byTeacher.length})`}</button>}
  <Sheet open={!!open&&!join} icon={UsersRound} title={t?`مجموعات ${t.name}`:''} onClose={()=>setOpen(null)}>
   <ul className={s.groups}>{groups.map(x=>{const full=x.enrolled>=x.capacity;return <li key={x.id}><button type="button" className={s.gBtn} onClick={()=>setJoin(x)} aria-label={`تفاصيل حصة ${x.subject} ${days[x.day]}`}>
    <span className={s.gMain}><b>{days[x.day]} · {timeRange(x.start,x.dur)}</b><span>{subjectEmoji(x.subject)} {x.subject} · {x.stage}</span></span>
    <span className={s.gSide}><b><bdi>{x.price}</bdi> ج.م</b><CountPill n={x.enrolled} cap={x.capacity}/></span>
    <span className={s.gGo}>{full?'تفاصيل':'طلب انضمام'}</span></button></li>;})}</ul>
  </Sheet>
  <JoinSheet session={join} onClose={()=>{setJoin(null);}}/>
 </section>;
}

/* ---------- Teacher: own week + where he teaches ---------- */
// `between` is rendered after the timetable and before the centers (the teacher page puts the tips there).
export function TeacherSchedule({teacherId,between}:{teacherId:string;between?:ReactNode}){
 const [join,setJoin]=useState<Session|null>(null);
 const list=sessionsForTeacher(teacherId);
 const closeJoin=useCallback(()=>setJoin(null),[]);
 if(!list.length)return <>{between}</>;
 const order=[...new Set(list.map(x=>x.centerId))];
 const blocks:Block[]=list.map(x=>{const c=centerById(x.centerId);const full=x.enrolled>=x.capacity;return {id:x.id,day:x.day,start:x.start,dur:x.dur,tone:full?'full':'booked',color:swatchFor(x.centerId,order),title:`${subjectEmoji(x.subject)} ${x.subject} · ${x.stage}`,sub:c?.name,href:c?`/centers/${c.id}`:undefined,count:{n:x.enrolled,cap:x.capacity},price:x.price,onClick:()=>setJoin(x)};});
 const centers=[...new Set(list.map(x=>x.centerId))].map(id=>({c:centerById(id),n:list.filter(x=>x.centerId===id).length})).filter(x=>x.c);
 return <>
  <section className={s.section} id="sec-t-sch" aria-labelledby="t-sch"><div className={s.head}><h2 id="t-sch"><CalendarDays size={20} aria-hidden="true"/>جدول الحصص</h2></div>
   <Legend items={order.map(id=>({color:swatchFor(id,order),label:centerById(id)?.name??''}))}/>
   <WeekGrid label="جدول حصص المدرس" blocks={blocks}/>
   <JoinSheet session={join} onClose={closeJoin}/>
  </section>
  {between}
  <section className={s.section} id="sec-t-ctr" aria-labelledby="t-ctr"><div className={s.head}><h2 id="t-ctr">🤝 شراكات مع السناتر</h2></div>
   <ul className={s.cPills}>{centers.map(({c,n})=><li key={c!.id}><Link href={`/centers/${c!.id}`} title={`${n} مجموعات`}><img src={placePhotos('center',c!.id,120,1)[0]} alt="" loading="lazy"/><b>{c!.name}</b><small>⭐ {c!.rating.toFixed(1)}</small></Link></li>)}</ul>
  </section>
 </>;
}

/* ---------- Study space: rooms, their features and a week calendar ---------- */
export function SpaceSchedule({space:sp}:{space:SpaceDTO}){
 const rooms=useMemo(()=>spaceRooms(sp),[sp]);
 const [room,setRoom]=useState(0);
 const [booking,setBooking]=useState<{day:number;hour:number}|null>(null);
 const requests=useDemoRequests();
 const book=(day:number,hour:number)=>setBooking({day,hour});
 const r=rooms[room];
 const mine=requests.filter((x):x is RoomRequest=>x.kind==='room'&&x.centerId===sp.id&&x.room===room);
 const blocks:Block[]=[
  ...r.booked.map((b,i)=>({id:`b${room}-${i}`,day:b.day,start:b.start,dur:b.dur,tone:'booked' as const,title:'محجوز'})),
  ...mine.flatMap(x=>x.days.map(d=>({id:`${x.id}-${d}`,day:d,start:x.start,dur:x.end-x.start,tone:'mine' as const,title:'طلبك',sub:'مستني الموافقة'}))),
 ];
 const photos=useMemo(()=>placePhotos('space',sp.id,1000,15).slice(room*2%10,room*2%10+4),[sp.id,room]);
 const close=useCallback(()=>setBooking(null),[]);
 return <section className={s.section} id="rooms" aria-labelledby="sp-sch"><div className={s.head}><h2 id="sp-sch">🚪 القاعات</h2><button type="button" className={s.primary} onClick={()=>book(0,16)}><Plus size={18} aria-hidden="true"/>احجز مكان</button></div>
  <div className={s.roomTabs} role="tablist" aria-label="القاعات">{rooms.map((x,i)=><button key={x.name} type="button" role="tab" aria-selected={i===room} onClick={()=>setRoom(i)}><b>{x.name}</b><span>👥 {x.seats} · <bdi>{x.price}</bdi> ج.م</span></button>)}</div>
  <div className={s.roomPanel} key={`panel-${room}`}>
   <div className={s.roomGallery}><Gallery photos={photos} size="hero" controls={false}/></div>
   <div className={s.roomInfo}><h3>{r.name}</h3>
    <dl className={s.roomRows}><div><dt>👥 السعة</dt><dd>{r.seats} فرد</dd></div><div><dt>💰 سعر الساعة</dt><dd><bdi>{r.price}</bdi> ج.م</dd></div></dl>
    {r.features.length>0&&<ul className={s.roomChips}>{r.features.map(f=><li key={f}><span aria-hidden="true">{emojiFor(featureLabel(f))}</span>{featureLabel(f)}</li>)}</ul>}
   </div>
  </div>
  <div className={s.calHead}><h3><CalendarDays size={18} aria-hidden="true"/>جدول {r.name}</h3></div>
  <WeekGrid key={`grid-${room}`} label={`جدول ${r.name}`} blocks={blocks} onFree={book}/>
  <SpaceSheet space={sp} room={room} roomName={r.name} price={r.price} init={booking} onClose={close}/>
 </section>;
}

function SpaceSheet({space:sp,room,roomName,price,init,onClose}:{space:SpaceDTO;room:number;roomName:string;price:number;init:{day:number;hour:number}|null;onClose:()=>void}){
 const [sel,setSel]=useState<number[]>(init?[init.day]:[]);
 const [start,setStart]=useState(init?.hour??16);
 const [end,setEnd]=useState(Math.min((init?.hour??16)+2,CLOSE));
 const [sent,setSent]=useState(false);
 if(!init)return null;
 const hoursN=Math.max(0,end-start),ok=sel.length>0&&hoursN>0,close=()=>{setSent(false);onClose();};
 return <Sheet open icon={DoorOpen} title={`احجز ${roomName}`} onClose={close}
  footer={sent?undefined:<button type="button" className={s.primary} disabled={!ok} onClick={()=>{addDemoRequest({kind:'room',id:newId(),centerId:sp.id,room,days:sel,start,end,repeat:'once',period:'term1',collect:false,createdAt:new Date().toISOString()});setSent(true);}}>ابعت طلب الحجز{ok&&<> · <bdi>{hoursN*price*sel.length}</bdi> ج.م</>}</button>}>
  {sent?<Done title="طلبك اتبعت للمساحة" onClose={close}><p className={s.doneText}>{sp.name} هيراجع الطلب ويتواصل معاك. هتلاقيه في الجدول باللون البنفسجي.</p></Done>:<>
   <section className={s.field}><h3>الأيام</h3><div className={s.chips}>{days.map((d,i)=><button key={d} type="button" aria-pressed={sel.includes(i)} onClick={()=>setSel(v=>v.includes(i)?v.filter(x=>x!==i):[...v,i].sort())}>{d}</button>)}</div></section>
   <section className={s.field}><h3>الوقت</h3><div className={s.times}>
    <label>من<select value={start} onChange={e=>{const v=Number(e.target.value);setStart(v);if(end<=v)setEnd(Math.min(v+2,CLOSE));}}>{allHours.map(h=><option key={h} value={h}>{hourLabel(h)}</option>)}</select></label>
    <label>إلى<select value={end} onChange={e=>setEnd(Number(e.target.value))}>{allHours.map(h=>h+1).filter(h=>h>start).map(h=><option key={h} value={h}>{hourLabel(h)}</option>)}</select></label>
   </div></section>
  </>}
 </Sheet>;
}
