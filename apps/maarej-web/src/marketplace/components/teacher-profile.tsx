import {BadgeCheck} from 'lucide-react';
import profiles from '../data/teacher-profiles.json';
import type {TeacherSearchDTO} from '../types/teacher';
import {PublicMarketplaceShell} from './public-shell';
import {TeacherPortrait} from './teacher-card';
import {BackToSearch} from './back-to-search';
import {TeacherSchedule} from './schedule';
import {Section,QuickActions,Stars,Quote,Contact,Reviews,MapEmbed,Stat,Stats} from './profile-kit';
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
  <BackToSearch base="/teachers" label="المدرسين"/>
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
  <QuickActions items={[{emoji:'📅',label:'المواعيد',href:'#t-sch',primary:true},{emoji:'🎬',label:'الفيديو',href:'#video'},{emoji:'🏫',label:'السناتر',href:'#t-ctr'},{emoji:'☎️',label:'التواصل',href:'#contact'}]}/>
  <Stats>
   {p&&<Stat emoji="⏳" label="خبرة" value={p.experience}/>}
   {p&&<Stat emoji="📚" label="حصة على معارج" value={p.lessons}/>}
   <Stat emoji="🗓️" label="مجموعة في الأسبوع" value={groups.length}/>
   <Stat emoji="🏫" label="سنتر" value={centersN}/>
   {t.price&&<Stat emoji="💰" label="ج.م / حصة" value={<bdi>{t.price.min} – {t.price.max}</bdi>}/>}
  </Stats>
  <Section id="video" emoji="🎬" title="فيديو تعريفي">
   <div className={k.video}>{t.image&&<img src={t.image} alt=""/>}<span className={k.play} aria-hidden="true">▶</span><span className={k.soon}>قريبًا</span></div>
  </Section>
  {p&&<Section id="bio-title" emoji="💬" title="كلمة تعريفية"><Quote who={t.name} role={`${p.mode} · ${t.systems.join('، ')}`} text={p.bio} initials={t.name.replace(/^أ\.\s*/,'').charAt(0)}/></Section>}
  {p&&p.lessonPrices.length>0&&<Section id="price-title" emoji="💰" title="أسعار الحصص"><ul className={k.prices}>{p.lessonPrices.map(x=><li key={x.label}><span>{x.label}</span><span><b><bdi>{x.price}</bdi></b> <small>ج.م / حصة</small></span></li>)}</ul></Section>}
  <TeacherSchedule teacherId={t.id}/>
  <Section id="contact" emoji="☎️" title="التواصل"><Contact info={demoContact(t.id)}/></Section>
  <Section id="rev-title" emoji="⭐" title="آراء الناس" aside={t.rating!==undefined?<Stars value={t.rating} count={t.reviewCount}/>:undefined}><Reviews byRole={demoTeacherReviews(t)}/></Section>
  <Section id="loc-title" emoji="📍" title="بيدرّس في المنطقة"><p className={k.addr}>{t.areas.join('، ')}</p><MapEmbed query={`${area}، ${gov||'مصر'}`} label={`خريطة ${area}`}/></Section>
 </div>
 {t.price&&<div className={styles.stickyBar}><p className={styles.price}><small>الحصة</small><bdi>{t.price.min} – {t.price.max}</bdi> <span>ج.م</span></p><a href="#t-sch" className={styles.bookCta}>المواعيد</a></div>}
 </PublicMarketplaceShell>;
}
