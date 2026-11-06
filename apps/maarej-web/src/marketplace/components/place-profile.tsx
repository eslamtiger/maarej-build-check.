import type {CenterDTO,SpaceDTO} from '../types/place';
import {featureLabel,placePhotos} from '../adapters/places';
import {emojiFor} from '../adapters/emoji';
import {PublicMarketplaceShell} from './public-shell';
import {CenterSchedule,CenterTeachers} from './schedule';
import {Gallery} from './gallery';
import {Section,Stars,Quote,ContactBar,InfoList,Chips,Reviews,MapEmbed,SectionTabs} from './profile-kit';
import {demoBranches,managerNote,demoContact,demoPlaceReviews} from '../adapters/profile-demo';
import {sessionsForCenter} from '../adapters/schedule';
import k from './profile-kit.module.css';
import styles from './places.module.css';

// Center profile: contact icons → photos + identity → about (manager word, key info, equipment) →
// rooms (photos, details, timetable, booking) → teachers → reviews → map. Small section tabs at the bottom.
export function CenterProfile({center:c}:{center:CenterDTO}){
 const branches=demoBranches(c),note=managerNote(c),photos=placePhotos('center',c.id,1000,15);
 const groups=sessionsForCenter(c.id).filter(x=>x.status==='booked'),teachersN=new Set(groups.map(x=>x.teacherId)).size;
 return <PublicMarketplaceShell active="centers"><div className={styles.profile}>
  <ContactBar info={demoContact(c.id)}/>
  <header className={k.hero} id="top">
   <div className={k.cover}><Gallery photos={photos.slice(0,6)} size="hero"/></div>
   <div className={k.idCard}>
    <span className={k.logo} aria-hidden="true">🏫</span>
    <div className={k.idText}>
     <p className={k.kicker}>{c.type}</p>
     <h1><bdi>{c.name}</bdi></h1>
     <p className={k.meta}><Stars value={c.rating} count={c.reviews}/><span>📍 {c.address}</span></p>
    </div>
   </div>
  </header>
  <Section id="about" emoji="💬" title="التعريف">
   <Quote who={note.who} role={note.role} text={note.text} initials="م"/>
   <InfoList rows={[
    {emoji:'🚪',label:'القاعات',value:c.rooms.length},
    {emoji:'👥',label:'أكبر قاعة',value:`${c.maxSeats} طالب`},
    {emoji:'💰',label:'سعر الساعة',value:<><bdi>{c.price.min} – {c.price.max}</bdi> ج.م</>},
    {emoji:'🧑‍🏫',label:'المدرسين',value:teachersN},
    {emoji:'📚',label:'المجموعات في الأسبوع',value:groups.length},
    ...(branches.length?[{emoji:'🏢',label:'فروع تانية',value:branches.join('، ')}]:[]),
   ]}/>
   <Chips items={c.features.map(f=>{const l=featureLabel(f);return {emoji:emojiFor(l),label:l};})}/>
  </Section>
  <CenterSchedule center={c}/>
  <CenterTeachers center={c}/>
  <Section id="rev-title" emoji="⭐" title="التقييمات"><Reviews byRole={c.reviewsByRole} total={c.rating} count={c.reviews}/></Section>
  <Section id="loc-title" emoji="📍" title="الموقع"><p className={k.addr}>{c.address}</p><MapEmbed query={`${c.lat},${c.lng}`} label={`خريطة ${c.name}`}/></Section>
 </div>
 <SectionTabs items={[{id:'sec-about',label:'التعريف',emoji:'💬'},{id:'rooms',label:'المواعيد',emoji:'📅'},{id:'sec-our-t',label:'المدرسين',emoji:'🧑‍🏫'},{id:'sec-rev-title',label:'التقييمات',emoji:'⭐'}]}/>
 </PublicMarketplaceShell>;
}

// Study space profile: same layout as a center (contact icons, photos + identity, about, places inside, reviews, map).
export function SpaceProfile({space:s}:{space:SpaceDTO}){
 const photos=placePhotos('space',s.id,1000,15),address=`${s.area}، ${s.governorate}`;
 return <PublicMarketplaceShell active="spaces"><div className={styles.profile}>
  <ContactBar info={demoContact(s.id)}/>
  <header className={k.hero}>
   <div className={k.cover}><Gallery photos={photos.slice(0,6)} size="hero"/></div>
   <div className={k.idCard}>
    <span className={k.logo} aria-hidden="true">📚</span>
    <div className={k.idText}>
     <p className={k.kicker}>{s.type}</p>
     <h1><bdi>{s.name}</bdi></h1>
     <p className={k.meta}><Stars value={s.rating} count={s.reviews}/><span>📍 {address}</span></p>
    </div>
   </div>
  </header>
  <Section id="about" emoji="💬" title="التعريف">
   <InfoList rows={[
    {emoji:'🪑',label:'الوحدات',value:s.units},
    {emoji:'👥',label:'السعة',value:s.capacity===1?'فرد واحد':`حتى ${s.capacity} أفراد`},
    {emoji:'💰',label:'السعر',value:<><bdi>{s.price.min} – {s.price.max}</bdi> ج.م</>},
    {emoji:'🏷️',label:'النوع',value:s.type},
   ]}/>
   <Chips items={s.features.map(f=>{const l=featureLabel(f);return {emoji:emojiFor(l),label:l};})}/>
  </Section>
  {s.zones.length>0&&<Section id="zones" emoji="🌿" title="الأماكن جوه المساحة"><Chips tone="green" items={s.zones.map(z=>({emoji:emojiFor(z),label:z}))}/></Section>}
  <Section id="rev-title" emoji="⭐" title="التقييمات"><Reviews byRole={demoPlaceReviews(s.id,s.rating)} total={s.rating} count={s.reviews}/></Section>
  <Section id="loc-title" emoji="📍" title="الموقع"><p className={k.addr}>{address}</p><MapEmbed query={`${s.lat},${s.lng}`} label={`خريطة ${s.name}`}/></Section>
 </div>
 <SectionTabs items={[{id:'sec-about',label:'التعريف',emoji:'💬'},{id:'sec-zones',label:'الأماكن',emoji:'🌿'},{id:'sec-rev-title',label:'التقييمات',emoji:'⭐'},{id:'sec-loc-title',label:'الموقع',emoji:'📍'}]}/>
 </PublicMarketplaceShell>;
}
