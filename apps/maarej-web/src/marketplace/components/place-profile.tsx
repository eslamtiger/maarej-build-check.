import type {ReactNode} from 'react';
import type {CenterDTO,SpaceDTO} from '../types/place';
import {featureLabel,placePhotos} from '../adapters/places';
import {emojiFor} from '../adapters/emoji';
import {PublicMarketplaceShell} from './public-shell';
import {CenterSchedule,CenterTeachers,SpaceSchedule} from './schedule';
import {Gallery} from './gallery';
import {Section,ContactBar,Chips,Reviews,MapEmbed,SectionTabs} from './profile-kit';
import {Scribble} from './fun';
import {SaveButton} from './save-button';
import {OpenNow} from './live';
import {managerNote,demoContact,demoPlaceReviews} from '../adapters/profile-demo';
import {hourLabel,OPEN,CLOSE} from '../adapters/schedule';
import {marketplaceCenters,placePhoto} from '../adapters/places';
import Link from 'next/link';
import k from './profile-kit.module.css';
import styles from './places.module.css';

const mapsLink=(lat:number,lng:number)=>`https://www.google.com/maps?q=${lat},${lng}`;

// Same top as the teacher page (Google Business order): photos on top with the round logo on their edge; beside the logo the name,
// kind, a rating tile and the amber "big number" tile → contact icons → the manager's word → key info as rows → equipment chips.
function PlaceHero({id,savedKind,placeId,logo,avatar,name,kind,rating,reviews,big,bigLabel,photos,contact,children}:{id:string;savedKind:'center'|'space';placeId:string;logo:string;avatar:string;name:string;kind:string;rating:number;reviews:number;big:number;bigLabel:string;photos:string[];contact:ReturnType<typeof demoContact>;children?:ReactNode}){
 return <header className={k.tHero} id={id}>
  <SaveButton kind={savedKind} id={placeId}/>
  <div className={`${k.cover} ${k.pCover}`}><Gallery photos={photos} size="hero"/></div>
  <div className={k.tTop}>
   <span className={`${k.tAvatar} ${k.tPlace}`} aria-hidden="true"><img src={avatar} alt=""/><i>{logo}</i></span>
   <div className={k.tSide}>
    <div className={k.nameRow}><h1><bdi>{name}</bdi></h1><OpenNow className={k.openSm}/></div>
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

// Other branches: two other centers shown as cards (demo: the same brand is imagined in other areas).
function Branches({center:c}:{center:CenterDTO}){
 const n=marketplaceCenters.length,i=marketplaceCenters.findIndex(x=>x.id===c.id);
 const others=[5,11,17].map(d=>marketplaceCenters[(i+d)%n]).filter((x,k,a)=>x.id!==c.id&&x.area!==c.area&&a.findIndex(y=>y.area===x.area)===k).slice(0,2);
 if(!others.length)return null;
 return <Section id="branches" emoji="🏢" title="الفروع الأخرى"><ul className={k.branches}>{others.map(b=><li key={b.id}><Link href={`/centers/${b.id}`}><img src={placePhoto('center',b.id,400)} alt="" loading="lazy"/><span><b>{b.name}</b><small>📍 {b.area}</small></span></Link></li>)}</ul></Section>;
}

// Center profile: hero → manager word → key info → equipment → rooms (photos, timetable, booking) → teachers → reviews → map.
export function CenterProfile({center:c}:{center:CenterDTO}){
 const note=managerNote(c),photos=placePhotos('center',c.id,1000,15);
 return <PublicMarketplaceShell active="centers"><div className={styles.profile}>
  <PlaceHero id="sec-about" savedKind="center" placeId={c.id} logo="🏫" avatar={photos[7]??photos[0]} name={c.name} kind={`${c.type} · ${c.area}`} rating={c.rating} reviews={c.reviews} big={c.rooms.length} bigLabel="قاعات" photos={photos.slice(0,6)} contact={demoContact(c.id)}>
   <blockquote className={k.tMsg}><em className={k.spark} aria-hidden="true">😊</em>{note.text}</blockquote>
   <Scribble items={[{emoji:'📍',text:c.address},{emoji:'🕙',text:`${hourLabel(OPEN)} – ${hourLabel(CLOSE)}`,hl:'green'},{emoji:'💰',text:`الساعة ${c.price.min} – ${c.price.max} ج.م`,hl:'amber'},{emoji:'🧭',text:'الاتجاهات',href:mapsLink(c.lat,c.lng),hl:'indigo'}]}/>
  </PlaceHero>
  <CenterSchedule center={c}/>
  <CenterTeachers center={c}/>
  <Branches center={c}/>
  <Section id="rev-title" emoji="⭐" title="التقييمات"><Reviews byRole={c.reviewsByRole} total={c.rating} count={c.reviews} target={`center:${c.id}`}/></Section>
  <Section id="loc-title" emoji="📍" title="الموقع"><p className={k.addr}>{c.address}</p><MapEmbed query={`${c.lat},${c.lng}`} label={`خريطة ${c.name}`}/></Section>
 </div>
 <SectionTabs items={[{id:'sec-about',label:'التعريف',emoji:'💬'},{id:'rooms',label:'المواعيد',emoji:'📅'},{id:'sec-our-t',label:'المدرسين',emoji:'🧑‍🏫'},{id:'sec-branches',label:'الفروع',emoji:'🏢'},{id:'sec-rev-title',label:'التقييمات',emoji:'⭐'}]}/>
 </PublicMarketplaceShell>;
}

// Study space profile: same top and method as the center (units as the big number), then the places inside, reviews and map.
export function SpaceProfile({space:s}:{space:SpaceDTO}){
 const photos=placePhotos('space',s.id,1000,15),address=`${s.area}، ${s.governorate}`;
 return <PublicMarketplaceShell active="spaces"><div className={styles.profile}>
  <PlaceHero id="sec-about" savedKind="space" placeId={s.id} logo="📚" avatar={photos[7]??photos[0]} name={s.name} kind={`${s.type} · ${s.area}`} rating={s.rating} reviews={s.reviews} big={s.units} bigLabel="وحدات" photos={photos.slice(0,6)} contact={demoContact(s.id)}>
   <Scribble items={[{emoji:'📍',text:address},{emoji:'👥',text:s.capacity===1?'فرد واحد':`حتى ${s.capacity} أفراد`,hl:'green'},{emoji:'💰',text:`${s.price.min} – ${s.price.max} ج.م`,hl:'amber'},{emoji:'🧭',text:'الاتجاهات',href:mapsLink(s.lat,s.lng),hl:'indigo'}]}/>
  </PlaceHero>
  <SpaceSchedule space={s}/>
  <Section id="rev-title" emoji="⭐" title="التقييمات"><Reviews byRole={demoPlaceReviews(s.id,s.rating)} total={s.rating} count={s.reviews} target={`space:${s.id}`}/></Section>
  <Section id="loc-title" emoji="📍" title="الموقع"><p className={k.addr}>{address}</p><MapEmbed query={`${s.lat},${s.lng}`} label={`خريطة ${s.name}`}/></Section>
 </div>
 <SectionTabs items={[{id:'sec-about',label:'التعريف',emoji:'💬'},{id:'rooms',label:'القاعات',emoji:'📅'},{id:'sec-rev-title',label:'التقييمات',emoji:'⭐'},{id:'sec-loc-title',label:'الموقع',emoji:'📍'}]}/>
 </PublicMarketplaceShell>;
}
