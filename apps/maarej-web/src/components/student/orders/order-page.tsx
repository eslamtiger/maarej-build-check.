'use client';
import {useEffect,useId,useState,type ReactNode} from 'react';
import Link from 'next/link';
import {Copy,Check,Clock3,BookOpen,CalendarDays,MapPin,UserRound,WalletCards,History,ReceiptText,ListChecks,FileSearch,TriangleAlert,Star,CircleCheck,CircleX,Send,FilePenLine,type LucideIcon} from 'lucide-react';
import {Card,Button,Avatar,Skeleton} from '../V101Primitives';
import {StudentV101Shell} from '../StudentV101Shell';
import {StudentBackButton} from '../student-record-details';
import {StudentContextLink} from '../student-context-link';
import {safeStudentReturn} from '@/lib/student-navigation';
import {studentTransactions} from '@/data/student-records';
import {statusContent,type Order,type OrderStatus,type OrderEventType} from '@/data/student-orders';
import {orderDate,orderTime,orderDay,orderMoney,receiptHref,orderNavigationContext} from './order-format';
import styles from './orders.module.css';
const statusIcons:Record<OrderStatus,LucideIcon>={draft:FilePenLine,submitted:Send,pending:Clock3,approved:CircleCheck,confirmed:CircleCheck,rejected:CircleX,cancelled:CircleX,completed:CircleCheck};
const eventIcons:Record<OrderEventType,LucideIcon>={created:BookOpen,submitted:Send,payment_recorded:ReceiptText,approved:CircleCheck,confirmed:CircleCheck,rejected:CircleX,cancelled:CircleX,completed:CircleCheck};
function Section({title,icon:Icon,children,surface=false,className=''}:{title:string;icon:LucideIcon;children:ReactNode;surface?:boolean;className?:string}){
 const id=useId(),content=<><h2 id={id}><Icon size={20} aria-hidden="true"/>{title}</h2>{children}</>;
 return <section aria-labelledby={id} className={`${styles.section} ${className}`}>{surface?<Card className={styles.card}>{content}</Card>:content}</section>;
}
export function OrderCopyButton({value,label,visibleLabel}:{value:string;label:string;visibleLabel?:string}){
 const [state,setState]=useState<'idle'|'busy'|'copied'|'failed'>('idle');const id=useId();
 async function copy(){setState('busy');try{if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText(value);setState('copied');}catch{setState('failed');}}
 return <span className={styles.copy}><Button type="button" variant="ghost" whileTap={undefined} disabled={state==='busy'} aria-busy={state==='busy'} aria-label={label} aria-describedby={id} onClick={copy}>{state==='copied'?<Check size={16} aria-hidden="true"/>:<Copy size={16} aria-hidden="true"/>}{visibleLabel}</Button><span id={id} role="status">{state==='copied'?'تم النسخ':state==='failed'?'تعذّر النسخ؛ يمكنك تحديد النص ونسخه يدويًا.':''}</span></span>;
}
export function OrderHeader({order}:{order:Order}){return <header className={styles.header}><div className={styles.titleRow}><h1>طلب الحجز</h1><div className={styles.reference}><bdi dir="ltr">{order.displayId}</bdi><OrderCopyButton value={order.displayId} label="نسخ رقم الطلب"/></div></div><time className={styles.note} dateTime={order.createdAt}><bdi>{orderDate(order.createdAt)}</bdi></time></header>;}
export function OrderStatusBadge({status}:{status:OrderStatus}){const c=statusContent[status],Icon=statusIcons[status];return <span className={styles.badge} data-tone={c.tone}><Icon size={18} aria-hidden="true"/>{c.label}</span>;}
export function OrderStatusSummary({status}:{status:OrderStatus}){const c=statusContent[status];return <section className={styles.status} data-tone={c.tone} aria-label="حالة الطلب"><OrderStatusBadge status={status}/><p>{c.description}</p></section>;}
function TimeRange({schedule}:{schedule:Order['schedule']}){return <span className={styles.time}><bdi>{orderTime(schedule?.startAt)}</bdi>{orderTime(schedule?.startAt)&&orderTime(schedule?.endAt)&&' – '}<bdi>{orderTime(schedule?.endAt)}</bdi></span>;}
export function OrderScheduleCard({schedule:s}:{schedule:Order['schedule']}){
 if(!s||(!orderDate(s.startAt)&&!orderDate(s.endAt)&&s.durationMinutes==null))return null;
 return <div className={styles.schedule} aria-label="موعد الحجز"><CalendarDays size={20} aria-hidden="true"/><div>{orderDate(s.startAt)&&<p><bdi>{orderDay(s.startAt)}، {orderDate(s.startAt)}</bdi></p>}{(orderTime(s.startAt)||orderTime(s.endAt))&&<p><TimeRange schedule={s}/>{s.durationMinutes!=null&&<span className={styles.duration}> · {s.durationMinutes} دقيقة</span>}</p>}{orderDate(s.endAt)&&orderDate(s.endAt)!==orderDate(s.startAt)&&<p className={styles.note}>ينتهي في <bdi>{orderDate(s.endAt)}</bdi></p>}{!orderTime(s.startAt)&&!orderTime(s.endAt)&&s.durationMinutes!=null&&<p>{s.durationMinutes} دقيقة</p>}</div></div>;
}
function ProviderImage({provider:p}:{provider:NonNullable<Order['provider']>}){const [failed,setFailed]=useState(false);return p.image&&!failed?<img src={p.image} className={styles.avatar} width={44} height={44} alt="" onError={()=>setFailed(true)}/>:<Avatar className={styles.avatar}><UserRound size={22} aria-hidden="true"/></Avatar>;}
// Provider identity and location share one plain section, without repeating summary fields.
export function OrderProviderCard({provider:p,subjectName}:{provider:Order['provider'];subjectName?:string}){
 if(!p)return null;const subject=p.subject&&p.subject!==subjectName?p.subject:undefined;
 return <div className={styles.provider}><ProviderImage provider={p} key={`${p.id}-${p.image}`}/><div><h3>{p.name}</h3><p className={styles.note}>{[{teacher:'مدرس',center:'سنتر',cospace:'مساحة مشتركة'}[p.type],subject].filter(Boolean).join(' · ')}</p></div>{p.rating!=null&&<span className={styles.rating} aria-label={`التقييم ${p.rating} من 5`}><Star size={14} aria-hidden="true"/><bdi dir="ltr">{p.rating}</bdi></span>}</div>;
}
export function OrderBookingSummary({order:o}:{order:Order}){
 return <Section title="ملخص الحجز" icon={BookOpen} surface className={styles.booking}><p className={styles.note}>{o.typeLabel}</p>{o.service?.subjectName&&<h3 className={styles.subject}>{o.service.subjectName}</h3>}{o.service?.groupName&&<p>{o.service.groupName}</p>}{o.service?.teacherName&&o.service.teacherName!==o.provider?.name&&<p>{o.service.teacherName}</p>}<OrderScheduleCard schedule={o.schedule}/></Section>;
}
export function OrderLocationCard({location:l,provider:p}:{location:Order['location'];provider?:Order['provider']}){
 if(!l||![l.centerName,l.branchName,l.roomName,l.address].some(Boolean))return null;
 const center=l.centerName!==p?.name?l.centerName:undefined; // Same provider name isn't repeated as a location title.
 return <div className={styles.locationDetails}>{center&&<h3>{center}</h3>}{(l.branchName||l.roomName)&&<p>{[l.branchName?`فرع ${l.branchName}`:null,l.roomName].filter(Boolean).join(' · ')}</p>}{l.address&&<address>{l.address}</address>}<div className={styles.locationActions}>{l.address&&<OrderCopyButton value={l.address} label="نسخ العنوان" visibleLabel="نسخ العنوان"/>}{l.address&&<a className={styles.link} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.address)}`} target="_blank" rel="noopener noreferrer">افتح على الخريطة</a>}</div></div>;
}
function OrderProviderLocation({order:o}:{order:Order}){
 const hasLocation=o.location&&[o.location.centerName,o.location.branchName,o.location.roomName,o.location.address].some(Boolean);
 if(!o.provider&&!hasLocation)return null;
 return <Section title={o.provider?.type==='teacher'?'المدرس والمكان':'مقدم الخدمة والمكان'} icon={MapPin} className={styles.location}><OrderProviderCard provider={o.provider} subjectName={o.service?.subjectName}/>{o.provider&&hasLocation&&<hr className={styles.divider}/>}<OrderLocationCard location={o.location} provider={o.provider}/></Section>;
}
function OrderReceipt({payment:t,currency}:{payment:NonNullable<Order['finance']>['transactions'][number];currency:string}){const href=receiptHref(t,studentTransactions);return <div className={styles.receipt}><div><strong><bdi>{orderMoney(t.amount,currency)}</bdi></strong><time dateTime={t.recordedAt} className={styles.note}><bdi>{orderDate(t.recordedAt)}</bdi></time></div>{href?<StudentContextLink className={styles.link} href={href}>إيصال الدفعة</StudentContextLink>:<small className={styles.note}>الإيصال بيظهر هنا بعد تأكيد الدفعة</small>}</div>;}
export function OrderReceipts({finance:f}:{finance:Order['finance']}){
 if(!f?.transactions.length)return null;
 const payments=[...f.transactions].sort((a,b)=>Date.parse(b.recordedAt)-Date.parse(a.recordedAt));

 return <div className={styles.receipts}><h3>آخر دفعة</h3><OrderReceipt payment={payments[0]} currency={f.currency}/>{payments.length>1&&<details><summary>الدفعات السابقة ({payments.length-1})</summary>{payments.slice(1).map(t=><OrderReceipt key={t.id} payment={t} currency={f.currency}/>)}</details>}</div>;
}
export function OrderFinanceSummary({finance:f}:{finance:Order['finance']}){
 if(!f)return null;
 return <Section title="المالية" icon={WalletCards} surface className={styles.finance}><dl className={styles.rows}>{[['قيمة الخدمة',f.total],['المدفوع',f.paid],['المتبقي',f.remaining]].map(([label,value])=>typeof value==='number'&&<div key={label} data-emphasis={label==='المتبقي'}><dt>{label}</dt><dd><bdi>{orderMoney(value,f.currency)}</bdi></dd></div>)}</dl>{f.paymentStatus&&<span className={styles.paymentBadge}>{f.paymentStatus}</span>}<OrderReceipts finance={f}/><p className={styles.note}>التفاصيل المالية مبنية على السجلات المسجلة على الطلب.</p></Section>;
}
export function OrderTimeline({events,status}:{events:Order['timeline'];status:OrderStatus}){
 let previousDate:string|undefined;
 return <Section title="سجل الطلب" icon={History} className={styles.timelineSection}>{!events.length&&<p className={styles.note}>لم تُسجّل تحديثات على الطلب بعد.</p>}<ol className={styles.timeline}>{events.map(e=>{const Icon=eventIcons[e.type],date=orderDate(e.timestamp),newDate=date!==previousDate;previousDate=date;return <li key={e.id}>{newDate&&<time className={styles.dateGroup} dateTime={e.timestamp}><bdi>{date}</bdi></time>}<div className={styles.event}><span className={styles.eventIcon}><Icon size={14} aria-hidden="true"/></span><div><h3>{e.title}</h3><time dateTime={e.timestamp}><bdi>{orderTime(e.timestamp)}</bdi></time>{e.description&&<p>{e.description}</p>}</div></div></li>;})}{status==='pending'&&<li><div className={`${styles.event} ${styles.current}`}><span className={styles.eventIcon}><Clock3 size={14} aria-hidden="true"/></span><div><h3>في انتظار المراجعة</h3><span className={styles.note}>الحالة الحالية</span></div></div></li>}</ol></Section>;
}
export function OrderNextStep({status}:{status:OrderStatus}){const c=statusContent[status];return <Section title="الخطوة التالية" icon={ListChecks} className={styles.nextStep}><h3>{c.next}</h3><p className={styles.note}>{c.nextDescription}</p></Section>;}
export function OrderActions({order:o}:{order:Order}){return <footer className={styles.footer}><h2>إجراءات الطلب</h2><div className={styles.actions}><Link className={styles.link} href="/student/learning">العودة لتعلّمي</Link></div></footer>;}
function useOrderNavigation(id?:string){const [context,setContext]=useState('');useEffect(()=>{const origin=safeStudentReturn(new URLSearchParams(window.location.search).get('returnTo'));setContext(orderNavigationContext(origin));},[id]);return context;}
// No booking, payment, cancellation or support rules changed. Actions without a working flow are not shown.
export function OrderPage({order:o}:{order?:Order}){const navigationContext=useOrderNavigation(o?.id);if(!o)return <OrderEmptyState/>;return <StudentV101Shell active="" compactHeader navigationContext={navigationContext}><div className={styles.page}><StudentBackButton fallback="/student/learning"/><OrderHeader order={o}/><div className={styles.layout}><OrderStatusSummary status={o.status}/><OrderBookingSummary order={o}/><OrderProviderLocation order={o}/><OrderFinanceSummary finance={o.finance}/><OrderTimeline events={o.timeline} status={o.status}/><OrderNextStep status={o.status}/><OrderActions order={o}/></div></div></StudentV101Shell>;}
function ReturnLinks(){return <div className={styles.actions}><Link className={styles.link} href="/student">العودة للرئيسية</Link><Link className={styles.link} href="/student/learning">العودة لتعلّمي</Link></div>;}
export function OrderEmptyState(){return <StudentV101Shell active="" compactHeader><div className={styles.page}><Card className={styles.card}><FileSearch size={32} aria-hidden="true"/><h1>تعذر العثور على الطلب</h1><p>قد يكون الرابط غير صحيح أو لم يعد الطلب متاحًا.</p><ReturnLinks/></Card></div></StudentV101Shell>;}
export function OrderErrorState({onRetry}:{onRetry?:()=>void}){return <StudentV101Shell active="" compactHeader><div className={styles.page}><Card className={styles.card}><TriangleAlert size={32} aria-hidden="true"/><h1>تعذّر تحميل الطلب</h1><p>تعذّر عرض تفاصيل الطلب الآن. حاول مرة أخرى.</p>{onRetry&&<Button type="button" whileTap={undefined} onClick={onRetry}>إعادة المحاولة</Button>}<ReturnLinks/></Card></div></StudentV101Shell>;}
export function OrderLoadingState(){return <StudentV101Shell active="" compactHeader><div className={styles.page} aria-busy="true" aria-label="جارٍ تحميل تفاصيل الطلب"><h1>طلب الحجز</h1><span className="v102-sr-only" role="status">جارٍ تحميل تفاصيل الطلب</span><div aria-hidden="true"><Skeleton className={styles.skeletonStatus}/><Skeleton className={styles.skeletonCard}/><Skeleton className={styles.skeletonCard}/></div></div></StudentV101Shell>;}
