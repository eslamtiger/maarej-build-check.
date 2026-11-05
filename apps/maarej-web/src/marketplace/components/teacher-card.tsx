'use client';
import {useState} from 'react';
import type {CSSProperties} from 'react';
import Link from 'next/link';
import {Star,MapPin,ArrowLeft,GraduationCap,School} from 'lucide-react';
import {Facts} from './place-card';
import type {Fact} from './place-card';
import type {TeacherSearchDTO} from '../types/teacher';
import c from './cards.module.css';
import styles from './marketplace.module.css';

const initialsOf=(name:string)=>name.replace(/^أ\.\s*/,'').split(' ').slice(0,2).map(s=>s[0]).join(' ');
// Soft gradient per teacher (by id) for teachers without a photo.
const grads=['linear-gradient(150deg,#4B3FD6,#7C72F0)','linear-gradient(150deg,#12865F,#3FBF8E)','linear-gradient(150deg,#1F7FCC,#56B3F0)','linear-gradient(150deg,#D93D63,#F2799A)','linear-gradient(150deg,#D68A16,#FFB53D)'] as const;
export const teacherGradient=(id:string)=>grads[[...id].reduce((s,ch)=>s+ch.charCodeAt(0),0)%grads.length];

export function TeacherPortrait({teacher:t,className=''}:{teacher:Pick<TeacherSearchDTO,'id'|'name'|'image'>;className?:string;discovery?:boolean}){
 const [failed,setFailed]=useState(false);
 return t.image&&!failed?<img className={className} src={t.image} alt="" loading="lazy" onError={()=>setFailed(true)}/>
  :<span className={`${styles.initials} ${className}`} style={{background:teacherGradient(t.id),color:'#fff',display:'grid',placeItems:'center',fontWeight:800}} aria-hidden="true">{initialsOf(t.name)}</span>;
}

export function TeacherCard({teacher:t,returnTo='/teachers',active=false,picked=false,onHover,index=0}:{teacher:TeacherSearchDTO;returnTo?:string;active?:boolean;picked?:boolean;onHover?:(id:string|null)=>void;index?:number}){
 const [failed,setFailed]=useState(false);
 const href=`/teachers/${t.id}?returnTo=${encodeURIComponent(returnTo)}`;
 const facts:Fact[]=[{icon:MapPin,label:'المنطقة',value:t.areas[0]??'—'},{icon:GraduationCap,label:'المرحلة',value:t.stages.join(' · ')||'—'},{icon:School,label:'النظام',value:t.systems.join(' · ')||'—'}];
 return <Link href={href} id={`card-${t.id}`} className={c.card} data-active={active} data-picked={picked} style={{'--i':index} as CSSProperties}
  onMouseEnter={()=>onHover?.(t.id)} onMouseLeave={()=>onHover?.(null)} onFocus={()=>onHover?.(t.id)} onBlur={()=>onHover?.(null)}>
  <div className={c.media} style={!t.image||failed?{background:teacherGradient(t.id)}:undefined}>
   {t.image&&!failed?<img className={c.photo} src={t.image} alt="" loading="lazy" style={{objectPosition:'center 25%'}} onError={()=>setFailed(true)}/>:<span className={c.fallback} aria-hidden="true">{initialsOf(t.name)}</span>}
   {t.rating!==undefined&&<span className={c.rate}><Star size={20} aria-hidden="true"/><bdi>{t.rating.toFixed(1)}</bdi>{t.reviewCount!==undefined&&<small>({t.reviewCount})</small>}</span>}
   {t.price&&<span className={c.price}><small>من</small><b><bdi dir="ltr">{t.price.min}</bdi></b><small>ج.م / حصة</small></span>}
  </div>
  <div className={c.body}>
   <div className={c.head}><div><h3>{t.name}</h3>{t.subjects.length>0&&<p>{t.subjects.join(' · ')}</p>}</div><span className={c.go} aria-hidden="true"><ArrowLeft size={20}/></span></div>
   <Facts facts={facts}/>
  </div>
 </Link>;
}
