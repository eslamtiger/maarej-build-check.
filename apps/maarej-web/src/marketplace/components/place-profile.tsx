import type {ReactNode} from 'react';
import type {CenterDTO,SpaceDTO} from '../types/place';
import {featureLabel,placePhotos} from '../adapters/places';
import {emojiFor} from '../adapters/emoji';
import {PublicMarketplaceShell} from './public-shell';
import {CenterSchedule,CenterTeachers} from './schedule';
import {Gallery} from './gallery';
import {Section,ContactBar,InfoList,Chips,Reviews,MapEmbed,SectionTabs} from './profile-kit';
import {demoBranches,managerNote,demoContact,demoPlaceReviews} from '../adapters/profile-demo';
import {sessionsForCenter,hourLabel,OPEN,CLOSE} from '../adapters/schedule';
import k from './profile-kit.module.css';
import styles from './places.module.css';

const mapsLink=(lat:number,lng:number)=>`https://www.google.com/maps?q=${lat},${lng}`;
const Dir=({lat,lng}:{lat:number;lng:number})=><a className={k.dirLink} href={mapsLink(lat,lng)} target="_blank" rel="noopener noreferrer">افتح في الخرائط</a>;

// Same top as the teacher page (Google Business order): photos on top with the round logo on their edge; beside the logo the name,
// kind, a rating tile and the amber "big number" tile → contact icons → the manager's word → key info as rows → equipment chips.
function PlaceHero({id,logo,name,kind,rating,reviews,big,bigLabel,photos,contact,children}:{id:string;logo:string;name:string;kind:string;rating:number;reviews:number;big:number;bigLabel:string;photos:string[];contact:ReturnType<typeof demoContact>;children?:ReactNode}){
 return <header className={k.tHero} id={id}>
  <div className={`${k.cover} ${k.pCover}`}><Gallery photos={photos} size="hero"/></div>
  <div className={k.tTop}>
   <span className={`${k.tAvatar} ${k.tLogo}`} aria-hidden="true">{logo}</span>
   <div className={k.tSide}>
    <h1><bdi>{name}</bdi></h1>
    <p className={k.pKind}>{kind}</p>
    <div className={k.tTiles}>
     <div className={k.tRate}><b><span className={k.tStar} aria-hidden="true">★</span><bdi>{rating.toFixed(1)}</bdi></b><small>{reviews} تقييم</small></div>
     <div className={k.tYears}><b><bdi>{big}</bdi></b><small>{bigLabel}</small></div>
    </div>
   </div>
  </div>
  <ContactBar info={contact}/>
  {children}
 </header>;
}

// Center profile: hero → manager word → key info → equipment → rooms (photos, timetable, booking) → teachers → reviews → map.
export function CenterProfile({center:c}:{center:CenterDTO}){
 const branches=demoBranches(c),note=managerNote(c),photos=placePhotos('center',c.id,1000,15);
 const groups=sessionsForCenter(c.id).filter(x=>x.status==='booked'),teachersN=new Set(groups.map(x=>x.teacherId)).size;
 return <PublicMarketplaceShell active="centers"><div className={styles.profile}>
  <PlaceHero id="sec-about" logo="🏫" name={c.name} kind={`${c.type} · ${c.area}`} rating={c.rating} reviews={c.reviews} big={c.rooms.length} bigLabel="قاعات" photos={photos.slice(0,6)} contact={demoContact(c.id)}>
   <blockquote className={k.tMsg}>{note.text}</blockquote>
   <InfoList rows={[
    {emoji:'📍',label:'العنوان',value:c.address},
    {emoji:'🧭',label:'الاتجاهات',value:<Dir lat={c.lat} lng={c.lng}/>},
    {emoji:'🕙',label:'مواعيد العمل',value:<bdi dir="rtl">{hourLabel(OPEN)} – {hourLabel(CLOSE)}</bdi>},
    {emoji:'👥',label:'أكبر قاعة',value:`${c.maxSeats} طالب`},
    {emoji:'💰',label:'سعر الساعة',value:<><bdi dir="rtl">{c.price.min} – {c.price.max}</bdi> ج.م</>},
    {emoji:'🧑‍🏫',label:'المدرسين',value:teachersN},
    {emoji:'📚',label:'المجموعات في الأسبوع',value:groups.length},
    ...(branches.length?[{emoji:'🏢',label:'فروع تانية',value:branches.join('، ')}]:[]),
   ]}/>
   <Chips items={c.features.map(f=>{const l=featureLabel(f);return {emoji:emojiFor(l),label:l};})}/>
  </PlaceHero>
  <CenterSchedule center={c}/>
  <CenterTeachers center={c}/>
  <Section id="rev-title" emoji="⭐" title="التقييمات"><Reviews byRole={c.reviewsByRole} total={c.rating} count={c.reviews}/></Section>
  <Section id="loc-title" emoji="📍" title="الموقع"><p className={k.addr}>{c.address}</p><MapEmbed query={`${c.lat},${c.lng}`} label={`خريطة ${c.name}`}/></Section>
 </div>
 <SectionTabs items={[{id:'sec-about',label:'التعريف',emoji:'💬'},{id:'rooms',label:'المواعيد',emoji:'📅'},{id:'sec-our-t',label:'المدرسين',emoji:'🧑‍🏫'},{id:'sec-rev-title',label:'التقييمات',emoji:'⭐'}]}/>
 </PublicMarketplaceShell>;
}

// Study space profile: same top and method as the center (units as the big number), then the places inside, reviews and map.
export function SpaceProfile({space:s}:{space:SpaceDTO}){
 const photos=placePhotos('space',s.id,1000,15),address=`${s.area}، ${s.governorate}`;
 return <PublicMarketplaceShell active="spaces"><div className={styles.profile}>
  <PlaceHero id="sec-about" logo="📚" name={s.name} kind={`${s.type} · ${s.area}`} rating={s.rating} reviews={s.reviews} big={s.units} bigLabel="وحدات" photos={photos.slice(0,6)} contact={demoContact(s.id)}>
   <InfoList rows={[
    {emoji:'📍',label:'العنوان',value:address},
    {emoji:'🧭',label:'الاتجاهات',value:<Dir lat={s.lat} lng={s.lng}/>},
    {emoji:'👥',label:'السعة',value:s.capacity===1?'فرد واحد':`حتى ${s.capacity} أفراد`},
    {emoji:'💰',label:'السعر',value:<><bdi dir="rtl">{s.price.min} – {s.price.max}</bdi> ج.م</>},
   ]}/>
   <Chips items={s.features.map(f=>{const l=featureLabel(f);return {emoji:emojiFor(l),label:l};})}/>
  </PlaceHero>
  {s.zones.length>0&&<Section id="zones" emoji="🌿" title="الأماكن جوه المساحة"><Chips tone="green" items={s.zones.map(z=>({emoji:emojiFor(z),label:z}))}/></Section>}
  <Section id="rev-title" emoji="⭐" title="التقييمات"><Reviews byRole={demoPlaceReviews(s.id,s.rating)} total={s.rating} count={s.reviews}/></Section>
  <Section id="loc-title" emoji="📍" title="الموقع"><p className={k.addr}>{address}</p><MapEmbed query={`${s.lat},${s.lng}`} label={`خريطة ${s.name}`}/></Section>
 </div>
 <SectionTabs items={[{id:'sec-about',label:'التعريف',emoji:'💬'},{id:'sec-zones',label:'الأماكن',emoji:'🌿'},{id:'sec-rev-title',label:'التقييمات',emoji:'⭐'},{id:'sec-loc-title',label:'الموقع',emoji:'📍'}]}/>
 </PublicMarketplaceShell>;
}
