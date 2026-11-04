'use client';
import {useState} from 'react';
import type {Ref} from 'react';
import Link from 'next/link';
import {Star,MapPin,ArrowLeft,UserRound} from 'lucide-react';
import type {TeacherSearchDTO} from '../types/teacher';
import styles from './marketplace.module.css';
export function TeacherPortrait({teacher:t,className='',discovery=false}:{teacher:Pick<TeacherSearchDTO,'id'|'name'|'image'>;className?:string;discovery?:boolean}){const [failed,setFailed]=useState(false);return t.image&&!failed?<img className={className} src={t.image} alt="" loading="lazy" onError={()=>setFailed(true)}/>:discovery?<span className={`${styles.teacherAvatar} ${className}`} aria-hidden="true"><UserRound size={30} strokeWidth={1.35}/><small>{t.name.replace(/^أ\.\s*/, '').split(' ').slice(0,2).map(s=>s[0]).join('')}</small></span>:<span className={`${styles.initials} ${className}`} aria-hidden="true">{t.name.replace(/^أ\.\s*/, '').split(' ').slice(0,2).map(s=>s[0]).join('')}</span>;}
export function TeacherCard({teacher:t,returnTo='/teachers',idPrefix='result',selected=false,onSelect,cardRef}:{teacher:TeacherSearchDTO;returnTo?:string;idPrefix?:string;selected?:boolean;onSelect?:()=>void;cardRef?:Ref<HTMLElement>}){
 const tags=[...t.stages,...t.systems].slice(0,2);
 if(onSelect){const stages=t.stages.slice(0,2);return <article ref={cardRef} className={`${styles.teacherCard} ${selected?styles.selectedCard:''}`} aria-labelledby={`${idPrefix}-teacher-${t.id}`} tabIndex={0} data-selected={selected} onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onSelect();}}} onClick={onSelect} onFocus={onSelect}>
  <div className={styles.cardIdentity}><div className={styles.cardPhoto}><TeacherPortrait teacher={t} className={styles.portrait} discovery/></div><div className={styles.cardDetails}><h3 id={`${idPrefix}-teacher-${t.id}`}>{t.name}</h3>{t.subjects.length>0&&<p className={styles.subject}>{t.subjects.join(' • ')}</p>}{t.rating!==undefined&&<p className={styles.rating}><Star size={14} aria-hidden="true"/><strong><bdi>{t.rating.toFixed(1)}</bdi></strong>{t.reviewCount!==undefined&&<span>{t.reviewCount} تقييم</span>}</p>}{t.areas.length>0&&<p className={styles.cardMeta}><MapPin size={13} aria-hidden="true"/>{t.areas[0]}</p>}{stages.length>0&&<div className={styles.cardTags}>{stages.map(stage=><span key={stage}>{stage}</span>)}{t.stages.length>2&&<span aria-label={`و${t.stages.length-2} مراحل إضافية`}>+{t.stages.length-2}</span>}</div>}</div></div>
  <div className={styles.cardDecision}>{t.price&&<p className={styles.cardPrice}><bdi dir="ltr">{t.price.min===t.price.max?t.price.min:`${t.price.min} – ${t.price.max}`}</bdi> <span>ج.م <small>/ حصة</small></span></p>}<Link href={`/teachers/${t.id}?returnTo=${encodeURIComponent(returnTo)}`} className={styles.profileLink} aria-label={`عرض ملف ${t.name}`}>عرض الملف<ArrowLeft size={16} aria-hidden="true"/></Link></div>
 </article>;} 
 return <article ref={cardRef} className={`${styles.teacherCard} ${selected?styles.selectedCard:''}`} aria-labelledby={`${idPrefix}-teacher-${t.id}`} data-selected={selected}>
  <div className={styles.cardIdentity}>
   <div className={styles.cardPhoto}><TeacherPortrait teacher={t} className={styles.portrait}/></div>
   <div className={styles.cardDetails}><h3 id={`${idPrefix}-teacher-${t.id}`}>{t.name}</h3>
    {t.subjects.length>0&&<p className={styles.subject}>{t.subjects.join(' • ')}</p>}
    {t.rating!==undefined&&<p className={styles.rating}><Star size={15} aria-hidden="true"/><strong><bdi>{t.rating.toFixed(1)}</bdi></strong>{t.reviewCount!==undefined&&<span>{t.reviewCount} تقييم</span>}</p>}
    {t.areas.length>0&&<p className={styles.cardMeta}><MapPin size={13} aria-hidden="true"/>{t.areas[0]}</p>}
   </div>
  </div>
  {tags.length>0&&<div className={styles.cardTags}>{tags.map(tag=><span key={tag}>{tag}</span>)}</div>}
  <div className={styles.cardDecision}>{t.price&&<p className={styles.cardPrice}><bdi dir="ltr">{t.price.min===t.price.max?t.price.min:`${t.price.min} – ${t.price.max}`}</bdi> <span>ج.م <small>/ حصة</small></span></p>}<Link href={`/teachers/${t.id}?returnTo=${encodeURIComponent(returnTo)}`} className={styles.profileLink} aria-label={`عرض ملف ${t.name}`}>عرض الملف<ArrowLeft size={17} aria-hidden="true"/></Link></div>
 </article>;
}
