'use client';
// Shared building blocks for center and teacher profiles: contact icons on top, hero, sections with
// info laid out as rows (no big boxes), reviews with small tabs, map, and a small section tab bar at the bottom.
import {useEffect,useState} from 'react';
import type {ReactNode,CSSProperties} from 'react';
import type {LucideIcon} from 'lucide-react';
import {Star,Phone,Globe,Mail} from 'lucide-react';
import {useDemoUser,loginUrl} from '../adapters/demo-auth';
import {useMyReviews,addMyReview} from '../adapters/my-reviews';
import p from './profile-kit.module.css';

export function Section({id,emoji,title,children,aside}:{id:string;emoji:string;title:string;children:ReactNode;aside?:ReactNode}){
 return <section className={p.section} id={`sec-${id}`} aria-labelledby={id}><div className={p.sHead}><h2 id={id}><span aria-hidden="true">{emoji}</span>{title}</h2>{aside}</div>{children}</section>;
}

export function Stars({value,count,size='md'}:{value:number;count?:number;size?:'md'|'lg'}){
 return <span className={p.stars} data-size={size}><Star aria-hidden="true"/><b><bdi>{value.toFixed(1)}</bdi></b>{count!==undefined&&<small>({count} تقييم)</small>}</span>;
}

export function Quote({who,role,text,initials}:{who:string;role:string;text:string;initials:string}){
 return <figure className={p.quote}><blockquote>{text}</blockquote><figcaption><span className={p.qAvatar} aria-hidden="true">{initials}</span><span><b>{who}</b><small>{role}</small></span></figcaption></figure>;
}

/* ---------- Contact: icons only; tapping opens the app. Only the website shows its address. ---------- */
export type ContactInfo={phone:string;whatsapp:string;email:string;website:string;facebook?:string;x?:string;instagram?:string;youtube?:string};
const svg=(d:ReactNode)=><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">{d}</svg>;
const WhatsApp=()=>svg(<><path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.8L2.4 21.8l4.9-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.6c-1.5 0-3-.4-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A7.9 7.9 0 1 1 12 19.8Z"/><path d="M16.4 14.1c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.8 2c0 1.2.9 2.3 1 2.5.1.1 1.7 2.6 4.1 3.6 1.5.7 2.1.7 2.9.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.2Z"/></>);
const Facebook=()=>svg(<path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z"/>);
const XLogo=()=>svg(<path d="M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2.2 3h6.2l4.3 5.8L17.8 3Zm-1 16.2h1.7L7.4 4.7H5.6l11.2 14.5Z"/>);
const Instagram=()=>svg(<><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/><circle cx="17.2" cy="6.8" r="1.1"/><path d="M16.5 2.5h-9a5 5 0 0 0-5 5v9a5 5 0 0 0 5 5h9a5 5 0 0 0 5-5v-9a5 5 0 0 0-5-5Zm3.2 14a3.2 3.2 0 0 1-3.2 3.2h-9a3.2 3.2 0 0 1-3.2-3.2v-9a3.2 3.2 0 0 1 3.2-3.2h9a3.2 3.2 0 0 1 3.2 3.2v9Z"/></>);
const YouTube=()=>svg(<path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/>);
const Icon=({I}:{I:LucideIcon})=><I size={19} aria-hidden="true"/>;

export function ContactBar({info,demo=true}:{info:ContactInfo;demo?:boolean}){
 const items:{key:string;label:string;href:string;icon:ReactNode;brand:string;external?:boolean}[]=[
  {key:'phone',label:'اتصل',href:`tel:${info.phone}`,icon:<Icon I={Phone}/>,brand:'#16133D'},
  {key:'wa',label:'واتساب',href:`https://wa.me/${info.whatsapp}`,icon:<WhatsApp/>,brand:'#25D366',external:true},
  {key:'mail',label:'إيميل',href:`mailto:${info.email}`,icon:<Icon I={Mail}/>,brand:'#4B3FD6'},
  ...(info.facebook?[{key:'fb',label:'فيسبوك',href:info.facebook,icon:<Facebook/>,brand:'#1877F2',external:true}]:[]),
  ...(info.x?[{key:'x',label:'إكس',href:info.x,icon:<XLogo/>,brand:'#000',external:true}]:[]),
  ...(info.instagram?[{key:'ig',label:'إنستجرام',href:info.instagram,icon:<Instagram/>,brand:'#E1306C',external:true}]:[]),
  ...(info.youtube?[{key:'yt',label:'يوتيوب',href:info.youtube,icon:<YouTube/>,brand:'#FF0000',external:true}]:[]),
 ];
 return <div className={p.contactBar}>
  <ul>{items.map(i=><li key={i.key}><a href={i.href} aria-label={i.label} title={i.label} style={{'--brand':i.brand} as CSSProperties} {...(i.external?{target:'_blank',rel:'noopener noreferrer'}:{})}>{i.icon}</a></li>)}</ul>
  <a className={p.site} href={info.website} target="_blank" rel="noopener noreferrer"><Globe size={16} aria-hidden="true"/><bdi dir="ltr">{info.website.replace(/^https?:\/\//,'')}</bdi>{demo&&<sup>تجريبي</sup>}</a>
 </div>;
}

/* ---------- Info as rows ---------- */
export function InfoList({rows}:{rows:{emoji:string;label:string;value:ReactNode}[]}){
 return <dl className={p.info}>{rows.map(r=><div key={r.label}><dt><span aria-hidden="true">{r.emoji}</span>{r.label}</dt><dd>{r.value}</dd></div>)}</dl>;
}
export function Chips({items,tone}:{items:{emoji:string;label:string}[];tone?:'blue'|'green'}){
 return <ul className={p.chipList} data-tone={tone}>{items.map(i=><li key={i.label}><span aria-hidden="true">{i.emoji}</span>{i.label}</li>)}</ul>;
}

/* ---------- Reviews: summary + small tabs ---------- */
export type Review={name:string;rating:number;text:string};
export type ReviewRole='students'|'parents'|'teachers'|'centers';
const roleLabel:Record<ReviewRole,string>={students:'الطلاب',parents:'أولياء الأمور',teachers:'المدرسين',centers:'السناتر'};
const avg=(l:readonly Review[])=>l.length?l.reduce((s,r)=>s+r.rating,0)/l.length:0;
const PAGE=10;
const roleOf={student:'students',parent:'parents',teacher:'teachers'} as const;
export function Reviews({byRole,total,count,target}:{byRole:Partial<Record<ReviewRole,readonly Review[]>>;total:number;count?:number;target:string}){
 const mine=useMyReviews(target);
 const user=useDemoUser();
 const merged:Partial<Record<ReviewRole,readonly Review[]>>={...byRole};
 for(const m of mine)merged[m.role]=[{name:m.name,rating:m.rating,text:m.text},...(merged[m.role]??[])];
 const roles=(Object.keys(roleLabel) as ReviewRole[]).filter(r=>(merged[r]?.length??0)>0);
 const [tab,setTab]=useState<ReviewRole|'all'>('all');
 const [page,setPage]=useState(0);
 const [stars,setStars]=useState(0);
 const [text,setText]=useState('');
 const [thanks,setThanks]=useState(false);
 const list=(tab==='all'?roles:[tab]).flatMap(r=>(merged[r]??[]).map(x=>({...x,role:r})));
 const pages=Math.max(1,Math.ceil(list.length/PAGE)),cur=Math.min(page,pages-1);
 const shown=list.slice(cur*PAGE,cur*PAGE+PAGE);
 const all=Object.values(merged).flat() as Review[];
 const shownTotal=mine.length?avg(all):total,shownCount=(count??all.length-mine.length)+mine.length;
 const submit=()=>{if(!user){location.assign(loginUrl(`${location.pathname}#rev-title`));return;}if(!stars||text.trim().length<2)return;
  addMyReview({target,name:user.name,role:roleOf[user.role],rating:stars,text:text.trim(),at:new Date().toISOString()});setStars(0);setText('');setThanks(true);setTab('all');setPage(0);};
 return <div className={p.reviews}>
  <div className={p.rSummary}><b><bdi>{shownTotal.toFixed(1)}</bdi></b><span><span className={p.rStars} aria-hidden="true">{'★★★★★'.slice(0,Math.round(shownTotal))}<i>{'★★★★★'.slice(Math.round(shownTotal))}</i></span><small>{shownCount} تقييم</small></span></div>
  <form className={p.rForm} onSubmit={e=>{e.preventDefault();submit();}} aria-label="أضف تقييمك">
   <b>✍️ أضف تقييمك</b>
   <div className={p.pick} role="radiogroup" aria-label="عدد النجوم">{[1,2,3,4,5].map(n=><button key={n} type="button" role="radio" aria-checked={stars===n} aria-label={`${n} نجوم`} data-on={n<=stars} onClick={()=>{setStars(n);setThanks(false);}}>★</button>)}</div>
   <textarea value={text} onChange={e=>{setText(e.target.value);setThanks(false);}} rows={3} maxLength={400} placeholder="اكتب رأيك" aria-label="تعليقك"/>
   <div className={p.rFoot}><button type="submit" className={p.rSend} disabled={!!user&&(!stars||text.trim().length<2)}>{user?'انشر تقييمي':'سجّل دخولك عشان تقيّم'}</button>{thanks&&<span className={p.rThanks}>🎉 شكرًا، تقييمك اتضاف</span>}</div>
  </form>
  <div className={p.subTabs} role="tablist" aria-label="الآراء حسب الفئة">
   <button type="button" role="tab" aria-selected={tab==='all'} onClick={()=>{setTab('all');setPage(0);}}>الكل</button>
   {roles.map(r=><button key={r} type="button" role="tab" aria-selected={tab===r} onClick={()=>{setTab(r);setPage(0);}}>{roleLabel[r]} <small>★ <bdi>{avg(merged[r]!).toFixed(1)}</bdi></small></button>)}
  </div>
  <ul className={p.rList}>{shown.map((x,i)=><li key={`${cur}-${i}`}><div className={p.rHead}><span className={p.qAvatar} aria-hidden="true">{x.name.trim().charAt(0)}</span><span><b>{x.name}</b><small>{roleLabel[x.role]}</small></span><em>★ <bdi>{x.rating.toFixed(1)}</bdi></em></div><p>{x.text}</p></li>)}</ul>
  {pages>1&&<nav className={p.pager} aria-label="صفحات التقييمات">{Array.from({length:pages},(_,n)=><button key={n} type="button" aria-current={n===cur?'page':undefined} onClick={()=>setPage(n)}>{n+1}</button>)}</nav>}
 </div>;
}

// Google Maps embed (no API key needed) + directions link.
export function MapEmbed({query,label}:{query:string;label:string}){
 return <div className={p.map}>
  <iframe title={label} src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
  <a href={`https://www.google.com/maps?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className={p.mapGo}>🧭 الاتجاهات</a>
 </div>;
}

/* ---------- Small section tabs fixed at the bottom of the page; highlights the section in view ---------- */
export type TabItem={id:string;label:string;emoji:string;onClick?:()=>void};
export function SectionTabs({items,mobileOnly=false}:{items:TabItem[];mobileOnly?:boolean}){
 const [active,setActive]=useState(items[0]?.id);
 useEffect(()=>{const els=items.map(i=>document.getElementById(i.id)).filter((e):e is HTMLElement=>!!e);if(!els.length)return;
  const io=new IntersectionObserver(es=>{const vis=es.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(vis[0])setActive(vis[0].target.id);},{rootMargin:'-30% 0px -55% 0px'});
  els.forEach(e=>io.observe(e));return()=>io.disconnect();},[items.map(i=>i.id).join()]); // eslint-disable-line react-hooks/exhaustive-deps
 return <nav className={p.tabs} data-mobile={mobileOnly} aria-label="أقسام الصفحة">{items.map(i=><a key={i.id} href={`#${i.id}`} aria-current={active===i.id?'true':undefined}
  onClick={e=>{if(i.onClick){e.preventDefault();i.onClick();return;}e.preventDefault();document.getElementById(i.id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});setActive(i.id);}}>
  <span aria-hidden="true">{i.emoji}</span>{i.label}</a>)}</nav>;
}
