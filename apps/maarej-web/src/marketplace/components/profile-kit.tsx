'use client';
// Shared building blocks for center and teacher profiles, following common profile patterns
// (Google Business Profile / Airbnb listing / tutor marketplaces): photos first, identity + rating,
// quick actions, intro, photos, offer (rooms / timetable), people, contact, reviews by audience, map.
import {useState} from 'react';
import type {ReactNode} from 'react';
import {Star,Images,X} from 'lucide-react';
import {Gallery} from './gallery';
import p from './profile-kit.module.css';

export function Section({id,emoji,title,children,aside}:{id:string;emoji:string;title:string;children:ReactNode;aside?:ReactNode}){
 return <section className={p.section} aria-labelledby={id}><div className={p.sHead}><h2 id={id}><span aria-hidden="true">{emoji}</span>{title}</h2>{aside}</div>{children}</section>;
}

export function QuickActions({items}:{items:{emoji:string;label:string;href:string;external?:boolean;primary?:boolean}[]}){
 return <nav className={p.actions} aria-label="اختصارات">{items.map(i=><a key={i.label} href={i.href} data-primary={i.primary} {...(i.external?{target:'_blank',rel:'noopener noreferrer'}:{})}><span aria-hidden="true">{i.emoji}</span>{i.label}</a>)}</nav>;
}

export function Stars({value,count,size='md'}:{value:number;count?:number;size?:'md'|'lg'}){
 return <span className={p.stars} data-size={size}><Star aria-hidden="true"/><b><bdi>{value.toFixed(1)}</bdi></b>{count!==undefined&&<small>({count} تقييم)</small>}</span>;
}

export function Quote({who,role,text,initials}:{who:string;role:string;text:string;initials:string}){
 return <figure className={p.quote}><blockquote>{text}</blockquote><figcaption><span className={p.qAvatar} aria-hidden="true">{initials}</span><span><b>{who}</b><small>{role}</small></span></figcaption></figure>;
}

// Photo grid → tap opens a full-screen gallery at that photo.
export function PhotoGrid({photos,label}:{photos:readonly string[];label:string}){
 const [open,setOpen]=useState<number|null>(null);
 const order=open===null?photos:[...photos.slice(open),...photos.slice(0,open)];
 return <>
  <div className={p.photos}>{photos.slice(0,6).map((src,i)=><button key={src} type="button" onClick={()=>setOpen(i)} aria-label={`${label}: صورة ${i+1}`}><img src={src.replace(/w=\d+/,'w=500')} alt="" loading="lazy"/>{i===5&&photos.length>6&&<span className={`${p.more} ${p.moreM}`}><Images size={18} aria-hidden="true"/>+{photos.length-6}</span>}{i===4&&photos.length>5&&<span className={`${p.more} ${p.moreD}`}><Images size={18} aria-hidden="true"/>+{photos.length-5}</span>}</button>)}</div>
  {open!==null&&<div className={p.lightbox} role="dialog" aria-modal="true" aria-label={label}>
   <button type="button" className={p.lbClose} onClick={()=>setOpen(null)} aria-label="إغلاق"><X size={22}/></button>
   <div className={p.lbStage}><Gallery photos={order.map(s=>s.replace(/w=\d+/,'w=1400'))} size="hero"/></div>
  </div>}
 </>;
}

export type ContactInfo={phone:string;whatsapp:string;email:string;website:string;social:{emoji:string;label:string;href:string}[]};
// Contact block. Demo values use reserved example domains and a placeholder number, so nothing reaches a real person.
export function Contact({info}:{info:ContactInfo}){
 return <div className={p.contact}>
  <ul className={p.cRows}>
   <li><span aria-hidden="true">📞</span><small>التليفون</small><b dir="ltr">{info.phone}</b></li>
   <li><span aria-hidden="true">💬</span><small>واتساب</small><b dir="ltr">{info.whatsapp}</b></li>
   <li><span aria-hidden="true">✉️</span><small>الإيميل</small><a href={`mailto:${info.email}`} dir="ltr">{info.email}</a></li>
   <li><span aria-hidden="true">🌐</span><small>الموقع</small><a href={info.website} target="_blank" rel="noopener noreferrer" dir="ltr">{info.website.replace(/^https?:\/\//,'')}</a></li>
  </ul>
  <div className={p.social}>{info.social.map(s=><a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">{s.emoji}</span>{s.label}</a>)}</div>
  <small className={p.demo}>بيانات تواصل تجريبية</small>
 </div>;
}

export type Review={name:string;rating:number;text:string};
export type ReviewRole='students'|'parents'|'teachers'|'centers';
const roleLabel:Record<ReviewRole,{label:string;emoji:string}>={students:{label:'الطلاب',emoji:'🎒'},parents:{label:'أولياء الأمور',emoji:'👨‍👩‍👦'},teachers:{label:'المدرسين',emoji:'🧑‍🏫'},centers:{label:'السناتر',emoji:'🏫'}};
const avg=(l:readonly Review[])=>l.length?l.reduce((s,r)=>s+r.rating,0)/l.length:0;
// Reviews grouped by who wrote them (students are the main rating).
export function Reviews({byRole}:{byRole:Partial<Record<ReviewRole,readonly Review[]>>}){
 const roles=(Object.keys(roleLabel) as ReviewRole[]).filter(r=>(byRole[r]?.length??0)>0);
 const [tab,setTab]=useState<ReviewRole|'all'>('all');
 if(!roles.length)return null;
 const list=(tab==='all'?roles:[tab]).flatMap(r=>(byRole[r]??[]).map(x=>({...x,role:r})));
 const [all,setAll]=useState(false);
 const shown=all?list:list.slice(0,3);
 return <div className={p.reviews}>
  <div className={p.rTiles}>{roles.map(r=><button key={r} type="button" aria-pressed={tab===r} onClick={()=>setTab(tab===r?'all':r)}><span aria-hidden="true">{roleLabel[r].emoji}</span><small>{roleLabel[r].label}</small><b>⭐ <bdi>{avg(byRole[r]!).toFixed(1)}</bdi></b></button>)}</div>
  <ul className={p.rList}>{shown.map((x,i)=><li key={i}><div className={p.rHead}><span className={p.qAvatar} aria-hidden="true">{x.name.trim().charAt(0)}</span><span><b>{x.name}</b><small>{roleLabel[x.role].emoji} {roleLabel[x.role].label}</small></span><em>⭐ <bdi>{x.rating.toFixed(1)}</bdi></em></div><p>{x.text}</p></li>)}</ul>
  {list.length>3&&<button type="button" className={p.moreBtn} onClick={()=>setAll(v=>!v)}>{all?'أقل':`كل الآراء (${list.length})`}</button>}
 </div>;
}

// Google Maps embed (no API key needed) + directions link.
export function MapEmbed({query,label}:{query:string;label:string}){
 return <div className={p.map}>
  <iframe title={label} src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
  <a href={`https://www.google.com/maps?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className={p.mapGo}>🧭 افتح الاتجاهات</a>
 </div>;
}

export function Stat({emoji,label,value}:{emoji:string;label:string;value:ReactNode}){
 return <div className={p.stat}><span aria-hidden="true">{emoji}</span><b>{value}</b><small>{label}</small></div>;
}
export function Stats({children}:{children:ReactNode}){return <div className={p.stats}>{children}</div>;}
