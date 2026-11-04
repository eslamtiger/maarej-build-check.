'use client';
import Link from 'next/link';
import {useState} from 'react';
import {Building2,DoorOpen,Star,MapPin,UsersRound,LayoutGrid,ArrowLeft} from 'lucide-react';
import type {CenterDTO,SpaceDTO} from '../types/place';
import {featureLabel,placePhoto} from '../adapters/places';
import styles from './places.module.css';

// Five tones from the Maarej token palette, assigned by id so a place keeps its colour everywhere.
const tones=['blue','violet','mint','amber','rose'] as const;
export const toneOf=(id:string)=>tones[[...id].reduce((s,ch)=>s+ch.charCodeAt(0),0)%tones.length];
const initial=(name:string)=>name.replace(/^(سنتر|مركز)\s+/,'').trim().charAt(0);

// Illustrated cover: replaces the V6 stock photos, whose licence for commercial use is unconfirmed.
export function PlaceCover({kind,id,name,area,size='card'}:{kind:'center'|'space';id:string;name:string;area:string;size?:'card'|'hero'}){
 const Icon=kind==='center'?Building2:DoorOpen;
 const [failed,setFailed]=useState(false);
 return <div className={`${styles.cover} ${size==='hero'?styles.coverHero:''}`} data-tone={toneOf(id)} aria-hidden="true">
  <span className={styles.coverLetter}>{initial(name)}</span>
  {!failed&&<img className={styles.coverPhoto} src={placePhoto(kind,id)} alt="" loading="lazy" onError={()=>setFailed(true)}/>}
  <span className={styles.coverIcon}><Icon size={size==='hero'?26:20} strokeWidth={1.6}/></span>
  <span className={styles.coverArea}><MapPin size={13}/>{area}</span>
 </div>;
}

function Rating({value,count}:{value:number;count:number}){return <p className={styles.rating}><Star size={14} aria-hidden="true"/><strong><bdi>{value.toFixed(1)}</bdi></strong><span>{count} تقييم</span></p>;}

type Sync={active?:boolean;onHover?:(id:string|null)=>void};
export function CenterCard({center:c,returnTo,active,onHover}:{center:CenterDTO;returnTo:string}&Sync){
 const href=`/centers/${c.id}?returnTo=${encodeURIComponent(returnTo)}`;
 return <article id={`card-${c.id}`} className={styles.card} data-active={active} aria-labelledby={`center-${c.id}`} onMouseEnter={()=>onHover?.(c.id)} onMouseLeave={()=>onHover?.(null)}>
  <Link href={href} tabIndex={-1} aria-hidden="true" className={styles.coverLink}><PlaceCover kind="center" id={c.id} name={c.name} area={c.area}/></Link>
  <div className={styles.cardBody}>
   <div className={styles.cardHead}><h3 id={`center-${c.id}`}><Link href={href}>{c.name}</Link></h3><Rating value={c.rating} count={c.reviews}/></div>
   <p className={styles.cardType}>{c.type} في {c.area}</p>
   <dl className={styles.metrics}>
    <div><dt><LayoutGrid size={14} aria-hidden="true"/>القاعات</dt><dd>{c.rooms.length}</dd></div>
    <div><dt><UsersRound size={14} aria-hidden="true"/>أكبر سعة</dt><dd>{c.maxSeats} طالب</dd></div>
   </dl>
   <ul className={styles.features} aria-label="تجهيزات">{c.features.slice(0,3).map(f=><li key={f}>{featureLabel(f)}</li>)}{c.features.length>3&&<li><bdi dir="ltr">+{c.features.length-3}</bdi></li>}</ul>
   <div className={styles.cardFoot}><p className={styles.price}><small>القاعة من</small><bdi dir="ltr">{c.price.min}</bdi> <span>ج.م / ساعة</span></p><Link href={href} className={styles.cta} aria-label={`عرض ${c.name}`}>عرض السنتر<ArrowLeft size={16} aria-hidden="true"/></Link></div>
  </div>
 </article>;
}

export function SpaceCard({space:s,returnTo,active,onHover}:{space:SpaceDTO;returnTo:string}&Sync){
 const href=`/spaces/${s.id}?returnTo=${encodeURIComponent(returnTo)}`;
 return <article id={`card-${s.id}`} className={styles.card} data-active={active} aria-labelledby={`space-${s.id}`} onMouseEnter={()=>onHover?.(s.id)} onMouseLeave={()=>onHover?.(null)}>
  <Link href={href} tabIndex={-1} aria-hidden="true" className={styles.coverLink}><PlaceCover kind="space" id={s.id} name={s.name} area={s.area}/></Link>
  <div className={styles.cardBody}>
   <div className={styles.cardHead}><h3 id={`space-${s.id}`}><Link href={href}><bdi>{s.name}</bdi></Link></h3><Rating value={s.rating} count={s.reviews}/></div>
   <p className={styles.cardType}>{s.type} في {s.area}</p>
   <dl className={styles.metrics}>
    <div><dt><UsersRound size={14} aria-hidden="true"/>السعة</dt><dd>{s.capacity===1?'فرد واحد':`حتى ${s.capacity} أفراد`}</dd></div>
    <div><dt><LayoutGrid size={14} aria-hidden="true"/>الوحدات</dt><dd>{s.units}</dd></div>
   </dl>
   <ul className={styles.features} aria-label="تجهيزات">{s.features.slice(0,3).map(f=><li key={f}>{featureLabel(f)}</li>)}{s.features.length>3&&<li><bdi dir="ltr">+{s.features.length-3}</bdi></li>}</ul>
   <div className={styles.cardFoot}><p className={styles.price}><small>نطاق السعر</small><bdi dir="ltr">{s.price.min===s.price.max?s.price.min:`${s.price.min} – ${s.price.max}`}</bdi> <span>ج.م</span></p><Link href={href} className={styles.cta} aria-label={`عرض ${s.name}`}>عرض المساحة<ArrowLeft size={16} aria-hidden="true"/></Link></div>
  </div>
 </article>;
}
