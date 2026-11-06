import {SaveButton} from './save-button';
import {BadgeCheck} from 'lucide-react';
import profiles from '../data/teacher-profiles.json';
import type {TeacherSearchDTO} from '../types/teacher';
import {PublicMarketplaceShell} from './public-shell';
import {TeacherPortrait} from './teacher-card';
import {TeacherSchedule} from './schedule';
import {Scribble,Group} from './fun';
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
   <SaveButton kind="teacher" id={t.id}/>
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
   {p&&<blockquote className={k.tMsg}><em className={k.spark} aria-hidden="true">😊</em>{p.bio}</blockquote>}
   <div className={k.tId}>
    <Group emoji="📚" title="المواد"><ul className={k.chips}>{t.subjects.map(x=><li key={x}>{subjectEmoji(x)} {x}</li>)}</ul></Group>
    {t.systems.length>0&&<Group emoji="🏫" title="النظام التعليمي"><ul className={k.chips}>{t.systems.map(x=><li key={x} data-tone="system">🏫 {x}</li>)}</ul></Group>}
    {t.stages.length>0&&<Group emoji="🎓" title="المراحل"><ul className={k.chips}>{t.stages.map(x=><li key={x} data-tone="stage">🎓 {x}</li>)}</ul></Group>}
    <Scribble items={[...t.areas.map(a=>({emoji:'📍',text:a})),...(prices.length>0?[{emoji:'💰',text:`الحصة ${lo===hi?lo:`${lo} – ${hi}`} ج.م`,hl:'amber' as const}]:[])]}/>
   </div>
  </header>
  <TeacherSchedule teacherId={t.id} between={
   <Section id="tips" emoji="💡" title="نصايح للطلاب">
    <ol className={`${k.thinks} ${k.handFont}`}>{tips.map((x,i)=><li key={x.title} data-c={i%4}><span className={k.tEmo} aria-hidden="true">{x.mark}</span><i className={k.dots} aria-hidden="true"/><div className={k.cloud}><em className={k.spark} aria-hidden="true">{x.spark}</em><b>{x.title}</b><p>{x.text}</p></div></li>)}</ol>
    <p className={k.sign}><span>مع تمنياتي بالتوفيق ✍️</span><em>{t.name}</em></p>
   </Section>}/>
  <Section id="rev-title" emoji="⭐" title="التقييمات"><Reviews byRole={demoTeacherReviews(t)} total={t.rating??4.5} count={t.reviewCount} target={`teacher:${t.id}`}/></Section>
  <Section id="loc-title" emoji="📍" title="الموقع"><p className={k.addr}>{t.areas.join('، ')}</p><MapEmbed query={`${area}، ${gov||'مصر'}`} label={`خريطة ${area}`}/></Section>
 </div>
 <SectionTabs items={[{id:'sec-about',label:'التعريف',emoji:'💬'},{id:'sec-t-sch',label:'المواعيد',emoji:'📅'},{id:'sec-t-ctr',label:'السناتر',emoji:'🤝'},{id:'sec-rev-title',label:'التقييمات',emoji:'⭐'}]}/>
 </PublicMarketplaceShell>;
}
