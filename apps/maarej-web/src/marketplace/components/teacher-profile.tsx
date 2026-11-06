import {BadgeCheck} from 'lucide-react';
import profiles from '../data/teacher-profiles.json';
import type {TeacherSearchDTO} from '../types/teacher';
import {PublicMarketplaceShell} from './public-shell';
import {TeacherPortrait} from './teacher-card';
import {TeacherSchedule} from './schedule';
import {Section,Stars,ContactBar,Reviews,MapEmbed,SectionTabs} from './profile-kit';
import {demoContact,demoTeacherReviews,demoTeacherTips} from '../adapters/profile-demo';
import {subjectEmoji} from '../adapters/emoji';
import styles from './places.module.css';
import k from './profile-kit.module.css';

type Profile={bio:string;experience:string;lessons:number;verified:boolean;mode:string;lessonPrices:{label:string;price:number}[]};
const profileFor=(legacyId:string)=>(profiles as Record<string,Profile>)[legacyId];

// Teacher profile, ordered like a Facebook / Instagram profile:
// cover + round photo; beside it the name, rating and the teacher's own message → contact icons → subjects, stages, area, price →
// intro video → timetable → tips for students → partner centers → reviews → location.
export function PublicTeacherProfile({teacher:t}:{teacher:TeacherSearchDTO}){
 const p=profileFor(t.legacyId);
 const area=t.areas[0]??'القاهرة',gov=t.governorates[0]??'';
 const prices=p?.lessonPrices.map(x=>x.price)??(t.price?[t.price.min,t.price.max]:[]);
 const lo=prices.length?Math.min(...prices):0,hi=prices.length?Math.max(...prices):0;
 const tips=demoTeacherTips(t);
 return <PublicMarketplaceShell active="teachers"><div className={styles.profile}>
  <header className={k.tHero} id="sec-about">
   <div className={k.tCover} aria-hidden="true"/>
   <div className={k.tTop}>
    <TeacherPortrait teacher={t} className={k.tAvatar}/>
    <div className={k.tSide}>
     <h1>{t.name}{p?.verified&&<BadgeCheck size={22} aria-label="ملف موثّق"/>}</h1>
     {t.rating!==undefined&&<Stars value={t.rating} count={t.reviewCount}/>}
     {p&&<p className={k.tMsg}>{p.bio}</p>}
    </div>
   </div>
   <ContactBar info={demoContact(t.id)}/>
   <div className={k.tId}>
    <p className={k.tLine}>{t.subjects.map(s=>`${subjectEmoji(s)} ${s}`).join(' · ')}{p&&<> · ⏳ {p.experience}</>}</p>
    <ul className={k.chips}>{t.systems.map(s=><li key={s} data-tone="system">🏫 {s}</li>)}{t.stages.map(s=><li key={s} data-tone="stage">🎓 {s}</li>)}</ul>
    <p className={k.tLine}>📍 {t.areas.join('، ')}{prices.length>0&&<> · 💰 الحصة <bdi dir="rtl">{lo===hi?`${lo}`:`${lo} – ${hi}`}</bdi> ج.م</>}</p>
   </div>
  </header>
  <Section id="video" emoji="🎬" title="فيديو تعريفي">
   <div className={k.video}>{t.image&&<img src={t.image} alt=""/>}<span className={k.play} aria-hidden="true">▶</span><span className={k.soon}>قريبًا</span></div>
  </Section>
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
