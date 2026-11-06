import {BadgeCheck} from 'lucide-react';
import profiles from '../data/teacher-profiles.json';
import type {TeacherSearchDTO} from '../types/teacher';
import {PublicMarketplaceShell} from './public-shell';
import {TeacherPortrait} from './teacher-card';
import {TeacherSchedule} from './schedule';
import {Section,ContactBar,Reviews,MapEmbed,SectionTabs} from './profile-kit';
import {demoContact,demoTeacherReviews,demoTeacherTips} from '../adapters/profile-demo';
import {subjectEmoji} from '../adapters/emoji';
import styles from './places.module.css';
import k from './profile-kit.module.css';

type Profile={bio:string;experience:string;lessons:number;verified:boolean;mode:string;lessonPrices:{label:string;price:number}[]};
const profileFor=(legacyId:string)=>(profiles as Record<string,Profile>)[legacyId];

// Teacher profile, top to bottom (Facebook / Instagram order, with the intro video as the cover):
// intro video with the round photo on its edge; beside the photo the name, rating and years of experience (the eye-catching tile) →
// contact icons → the teacher's own message → subjects, stages, area, price → timetable → tips for students → partner centers → reviews → location.
export function PublicTeacherProfile({teacher:t}:{teacher:TeacherSearchDTO}){
 const p=profileFor(t.legacyId);
 const area=t.areas[0]??'القاهرة',gov=t.governorates[0]??'';
 const prices=p?.lessonPrices.map(x=>x.price)??(t.price?[t.price.min,t.price.max]:[]);
 const lo=prices.length?Math.min(...prices):0,hi=prices.length?Math.max(...prices):0;
 const years=p?Number(p.experience.match(/\d+/)?.[0]):NaN;
 const tips=demoTeacherTips(t);
 return <PublicMarketplaceShell active="teachers"><div className={styles.profile}>
  <header className={k.tHero} id="sec-about">
   <div className={`${k.video} ${k.tVideo}`}>{t.image&&<img src={t.image} alt=""/>}<span className={k.play} aria-hidden="true">▶</span><span className={k.soon}>فيديو تعريفي · قريبًا</span></div>
   <div className={k.tTop}>
    <TeacherPortrait teacher={t} className={k.tAvatar}/>
    <div className={k.tSide}>
     <h1>{t.name}{p?.verified&&<BadgeCheck size={22} aria-label="ملف موثّق"/>}</h1>
     <div className={k.tTiles}>
      {t.rating!==undefined&&<div className={k.tRate}><b><span className={k.tStar} aria-hidden="true">★</span><bdi>{t.rating.toFixed(1)}</bdi></b><small>{t.reviewCount??0} تقييم</small></div>}
      {Number.isFinite(years)&&<div className={k.tYears}><b><bdi>{years}</bdi></b><small>سنوات خبرة</small></div>}
     </div>
    </div>
   </div>
   <ContactBar info={demoContact(t.id)}/>
   {p&&<blockquote className={k.tMsg}>{p.bio}</blockquote>}
   <div className={k.tId}>
    <p className={k.tLine}>{t.subjects.map(s=>`${subjectEmoji(s)} ${s}`).join(' · ')}</p>
    <ul className={k.chips}>{t.systems.map(s=><li key={s} data-tone="system">🏫 {s}</li>)}{t.stages.map(s=><li key={s} data-tone="stage">🎓 {s}</li>)}</ul>
    <p className={k.tLine}>📍 {t.areas.join('، ')}{prices.length>0&&<> · 💰 الحصة <bdi dir="rtl">{lo===hi?`${lo}`:`${lo} – ${hi}`}</bdi> ج.م</>}</p>
   </div>
  </header>
  <TeacherSchedule teacherId={t.id} between={
   <Section id="tips" emoji="💡" title="نصايح للطلاب">
    <ol className={k.tips}>{tips.map(x=><li key={x.title}><span aria-hidden="true">{x.emoji}</span><b>{x.title}</b><p>{x.text}</p></li>)}</ol>
   </Section>}/>
  <Section id="rev-title" emoji="⭐" title="التقييمات"><Reviews byRole={demoTeacherReviews(t)} total={t.rating??4.5} count={t.reviewCount}/></Section>
  <Section id="loc-title" emoji="📍" title="الموقع"><p className={k.addr}>{t.areas.join('، ')}</p><MapEmbed query={`${area}، ${gov||'مصر'}`} label={`خريطة ${area}`}/></Section>
 </div>
 <SectionTabs items={[{id:'sec-about',label:'التعريف',emoji:'💬'},{id:'sec-t-sch',label:'المواعيد',emoji:'📅'},{id:'sec-t-ctr',label:'السناتر',emoji:'🤝'},{id:'sec-rev-title',label:'التقييمات',emoji:'⭐'}]}/>
 </PublicMarketplaceShell>;
}
