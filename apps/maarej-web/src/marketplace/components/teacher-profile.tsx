import {BadgeCheck} from 'lucide-react';
import profiles from '../data/teacher-profiles.json';
import type {TeacherSearchDTO} from '../types/teacher';
import {PublicMarketplaceShell} from './public-shell';
import {TeacherPortrait} from './teacher-card';
import {BackToSearch} from './back-to-search';
import {TeacherSchedule} from './schedule';
import {Section,Stars,Quote,ContactBar,InfoList,Reviews,MapEmbed,SectionTabs} from './profile-kit';
import {demoContact,demoTeacherReviews} from '../adapters/profile-demo';
import {sessionsForTeacher} from '../adapters/schedule';
import {subjectEmoji} from '../adapters/emoji';
import styles from './places.module.css';
import k from './profile-kit.module.css';

type Profile={bio:string;experience:string;lessons:number;verified:boolean;mode:string;lessonPrices:{label:string;price:number}[]};
const profileFor=(legacyId:string)=>(profiles as Record<string,Profile>)[legacyId];

// Teacher profile, top to bottom (tutor-marketplace pattern): photo + name + rating + what/where he teaches →
// quick actions → numbers → intro video → intro word → prices → timetable + centers → contact → reviews by audience → map.
export function PublicTeacherProfile({teacher:t}:{teacher:TeacherSearchDTO}){
 const p=profileFor(t.legacyId);
 const groups=sessionsForTeacher(t.id),centersN=new Set(groups.map(x=>x.centerId)).size;
 const area=t.areas[0]??'القاهرة',gov=t.governorates[0]??'';
 return <PublicMarketplaceShell active="teachers"><div className={styles.profile}>
  <ContactBar info={demoContact(t.id)}/>
  <header className={k.hero}>
   <div className={k.band} aria-hidden="true"/>
   <div className={k.idCard}>
    <TeacherPortrait teacher={t} className={k.avatar}/>
    <div className={k.idText}>
     <h1>{t.name}{p?.verified&&<BadgeCheck size={24} aria-label="ملف موثّق"/>}</h1>
     <p className={k.meta}>{t.rating!==undefined&&<Stars value={t.rating} count={t.reviewCount}/>}<span>📍 {t.areas.join('، ')}</span></p>
     <ul className={k.chips}>{t.subjects.map(s=><li key={s}>{subjectEmoji(s)} {s}</li>)}{t.systems.map(s=><li key={s} data-tone="system">🏫 {s}</li>)}{t.stages.map(s=><li key={s} data-tone="stage">🎓 {s}</li>)}</ul>
    </div>
   </div>
  </header>
  <Section id="about" emoji="💬" title="التعريف">
   <div className={k.video}>{t.image&&<img src={t.image} alt=""/>}<span className={k.play} aria-hidden="true">▶</span><span className={k.soon}>فيديو تعريفي · قريبًا</span></div>
   {p&&<Quote who={t.name} role={p.mode} text={p.bio} initials={t.name.replace(/^أ\.\s*/,'').charAt(0)}/>}
   <InfoList rows={[
    ...(p?[{emoji:'⏳',label:'الخبرة',value:p.experience},{emoji:'📚',label:'حصص على معارج',value:p.lessons}]:[]),
    {emoji:'🗓️',label:'المجموعات في الأسبوع',value:groups.length},
    {emoji:'🏫',label:'السناتر',value:centersN},
    ...(p?p.lessonPrices.map(x=>({emoji:'💰',label:x.label,value:<><bdi>{x.price}</bdi> ج.م</>})):[]),
   ]}/>
  </Section>
  <TeacherSchedule teacherId={t.id}/>
  <Section id="rev-title" emoji="⭐" title="التقييمات"><Reviews byRole={demoTeacherReviews(t)} total={t.rating??4.5} count={t.reviewCount}/></Section>
  <Section id="loc-title" emoji="📍" title="المنطقة"><p className={k.addr}>{t.areas.join('، ')}</p><MapEmbed query={`${area}، ${gov||'مصر'}`} label={`خريطة ${area}`}/></Section>
 </div>
 <SectionTabs items={[{id:'sec-about',label:'التعريف',emoji:'💬'},{id:'sec-t-sch',label:'المواعيد',emoji:'📅'},{id:'sec-t-ctr',label:'الأماكن',emoji:'🏫'},{id:'sec-rev-title',label:'التقييمات',emoji:'⭐'}]}/>
 </PublicMarketplaceShell>;
}
