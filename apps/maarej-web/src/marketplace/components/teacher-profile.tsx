import Link from 'next/link';
import {Star,MapPin,BadgeCheck,GraduationCap,BookOpen,Info,Building2,Clock3} from 'lucide-react';
import profiles from '../data/teacher-profiles.json';
import type {TeacherSearchDTO} from '../types/teacher';
import {marketplaceCenters} from '../adapters/places';
import {PublicMarketplaceShell} from './public-shell';
import {TeacherPortrait} from './teacher-card';
import {BackToSearch} from './back-to-search';
import styles from './places.module.css';

type Profile={bio:string;experience:string;lessons:number;verified:boolean;mode:string;lessonPrices:{label:string;price:number}[]};
const profileFor=(legacyId:string)=>(profiles as Record<string,Profile>)[legacyId];

// Full public profile built from the V6 teacher record (bio, experience, lesson prices).
export function PublicTeacherProfile({teacher:t}:{teacher:TeacherSearchDTO}){
 const p=profileFor(t.legacyId);
 const centers=marketplaceCenters.filter(c=>c.featuredTeachers.includes(t.legacyId));
 return <PublicMarketplaceShell active="teachers"><div className={styles.profile}>
  <BackToSearch base="/teachers" label="العودة للمدرسين"/>
  <header className={styles.teacherHead}>
   <TeacherPortrait teacher={t} className={styles.teacherPhoto}/>
   <div className={styles.profileTitle}>
    <p className={styles.cardType}>{t.subjects.join('، ')}</p>
    <h1>{t.name}{p?.verified&&<BadgeCheck size={22} className={styles.verified} aria-label="ملف موثّق"/>}</h1>
    <p className={styles.profileMeta}>{t.rating!==undefined&&<span className={styles.rating}><Star size={15} aria-hidden="true"/><strong><bdi>{t.rating.toFixed(1)}</bdi></strong>{t.reviewCount!==undefined&&<span>{t.reviewCount} تقييم</span>}</span>}{t.areas.length>0&&<span><MapPin size={15} aria-hidden="true"/>{t.areas.join('، ')}</span>}</p>
   </div>
  </header>

  <dl className={styles.facts}>
   {p&&<div><dt><Clock3 size={16} aria-hidden="true"/>الخبرة</dt><dd>{p.experience}</dd></div>}
   {p&&<div><dt><BookOpen size={16} aria-hidden="true"/>حصص على معارج</dt><dd>{p.lessons}</dd></div>}
   <div><dt><GraduationCap size={16} aria-hidden="true"/>المراحل</dt><dd>{t.stages.join('، ')||'—'}</dd></div>
  </dl>

  {p&&<section className={styles.section} aria-labelledby="bio-title"><h2 id="bio-title">نبذة</h2><p className={styles.lead}>{p.bio}</p><p className={styles.muted}>طريقة التدريس: {p.mode} · الأنظمة: {t.systems.join('، ')}</p></section>}

  {p&&p.lessonPrices.length>0&&<section className={styles.section} aria-labelledby="price-title"><h2 id="price-title">أسعار الحصص</h2>
   <ul className={styles.rooms}>{p.lessonPrices.map(x=><li key={x.label}><div className={styles.roomHead}><h3>{x.label}</h3><p className={styles.price}><bdi dir="ltr">{x.price}</bdi> <span>ج.م / حصة</span></p></div></li>)}</ul>
  </section>}

  {centers.length>0&&<section className={styles.section} aria-labelledby="ctr-title"><h2 id="ctr-title">بيدرّس في</h2>
   <ul className={styles.teacherList}>{centers.map(c=><li key={c.id}><Link href={`/centers/${c.id}`}><span className={styles.centerDot}><Building2 size={18} aria-hidden="true"/></span><span><strong>{c.name}</strong><small>{c.area}</small></span></Link></li>)}</ul>
  </section>}

  <p className={styles.notice}><Info size={16} aria-hidden="true"/>بيانات مدرس توضيحية. الحجز والتواصل المباشر هيتفعّلوا في المرحلة الجاية.</p>
 </div>
 {t.price&&<div className={styles.stickyBar}><p className={styles.price}><small>الحصة من</small><bdi dir="ltr">{t.price.min}</bdi> <span>ج.م</span></p><span className={styles.soonTag}>الحجز بيتفعّل قريب</span></div>}
 </PublicMarketplaceShell>;
}
