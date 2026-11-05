import {Star,MapPin,UsersRound,LayoutGrid,Navigation,Banknote} from 'lucide-react';
import type {CenterDTO,SpaceDTO,CenterReviewRole} from '../types/place';
import {featureLabel,directionsHref,placePhotos} from '../adapters/places';
import {emojiFor} from '../adapters/emoji';
import {PublicMarketplaceShell} from './public-shell';
import {PlaceCover} from './place-card';
import {CenterSchedule,CenterTeachers} from './schedule';
import {Gallery} from './gallery';
import {Section,Stars,Quote,ContactBar,InfoList,Chips,Reviews,MapEmbed,SectionTabs} from './profile-kit';
import {demoBranches,managerNote,demoContact} from '../adapters/profile-demo';
import {sessionsForCenter} from '../adapters/schedule';
import k from './profile-kit.module.css';
import {BackToSearch} from './back-to-search';
import styles from './places.module.css';

const roleLabels:Record<CenterReviewRole,string>={parents:'أولياء الأمور',students:'الطلاب',teachers:'المدرسون',centers:'سناتر شريكة'};


function ProfileHead({kind,id,name,area,type,rating,reviews,address}:{kind:'center'|'space';id:string;name:string;area:string;type:string;rating:number;reviews:number;address:string}){
 return <header className={styles.profileHead}>
  <PlaceCover kind={kind} id={id} name={name} area={area} size="hero"/>
  <div className={styles.profileTitle}>
   <p className={styles.cardType}>{type}</p>
   <h1><bdi>{name}</bdi></h1>
   <p className={styles.profileMeta}><span className={styles.rating}><Star size={15} aria-hidden="true"/><strong><bdi>{rating.toFixed(1)}</bdi></strong><span>{reviews} تقييم</span></span><span><MapPin size={15} aria-hidden="true"/>{address}</span></p>
  </div>
 </header>;
}

function Facts({items}:{items:{icon:typeof UsersRound;label:string;value:string}[]}){
 return <dl className={styles.facts}>{items.map(({icon:Icon,label,value})=><div key={label}><dt><Icon size={16} aria-hidden="true"/>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

function Location({lat,lng,address}:{lat:number;lng:number;address:string}){
 return <section className={styles.section} aria-labelledby="loc-title"><h2 id="loc-title">الموقع</h2><p className={styles.muted}>{address}</p><a className={styles.secondaryCta} href={directionsHref(lat,lng)} target="_blank" rel="noopener noreferrer"><Navigation size={16} aria-hidden="true"/>افتح الاتجاهات في خرائط Google</a></section>;
}

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

export function SpaceProfile({space:s}:{space:SpaceDTO}){
 return <PublicMarketplaceShell active="spaces"><div className={styles.profile}>
  <BackToSearch base="/spaces" label="مساحات المذاكرة"/>
  <ProfileHead kind="space" id={s.id} name={s.name} area={s.area} type={s.type} rating={s.rating} reviews={s.reviews} address={`${s.area}، ${s.governorate}`}/>
  <Facts items={[{icon:LayoutGrid,label:'الوحدات المتاحة',value:String(s.units)},{icon:UsersRound,label:'السعة',value:s.capacity===1?'فرد واحد':`حتى ${s.capacity} أفراد`},{icon:Banknote,label:'نطاق السعر (ج.م)',value:`${s.price.min} – ${s.price.max}`}]}/>
  {s.zones.length>0&&<section className={styles.section} aria-labelledby="zones-title"><h2 id="zones-title">الأماكن</h2><ul className={styles.checkList}>{s.zones.map(z=><li key={z}><span aria-hidden="true">{emojiFor(z)}</span>{z}</li>)}</ul></section>}
  <section className={styles.section} aria-labelledby="feat-title"><h2 id="feat-title">التجهيزات</h2><ul className={styles.checkList}>{s.features.map(f=><li key={f}><span aria-hidden="true">{emojiFor(featureLabel(f))}</span>{featureLabel(f)}</li>)}</ul></section>
  <Location lat={s.lat} lng={s.lng} address={`${s.area}، ${s.governorate}`}/>
 </div>
 <div className={styles.stickyBar}><p className={styles.price}><small>نطاق السعر</small><bdi dir="rtl">{s.price.min} – {s.price.max}</bdi> <span>ج.م</span></p><span className={styles.soonTag}>الحجز بيتفعّل قريب</span></div>
 </PublicMarketplaceShell>;
}
