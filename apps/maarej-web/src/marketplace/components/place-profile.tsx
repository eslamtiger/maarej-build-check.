import Link from 'next/link';
import {Star,MapPin,UsersRound,LayoutGrid,Navigation,Banknote} from 'lucide-react';
import type {CenterDTO,SpaceDTO,CenterReviewRole} from '../types/place';
import {featureLabel,directionsHref} from '../adapters/places';
import {emojiFor} from '../adapters/emoji';
import {marketplaceTeachers} from '../adapters/teachers';
import {PublicMarketplaceShell} from './public-shell';
import {PlaceCover} from './place-card';
import {TeacherPortrait} from './teacher-card';
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

export function CenterProfile({center:c}:{center:CenterDTO}){
 const teachers=c.featuredTeachers.map(id=>marketplaceTeachers.find(t=>t.legacyId===id)).filter(t=>t!==undefined);
 const reviewRoles=(Object.keys(roleLabels) as CenterReviewRole[]).filter(r=>(c.reviewsByRole[r]?.length??0)>0);
 return <PublicMarketplaceShell active="centers"><div className={styles.profile}>
  <BackToSearch base="/centers" label="السناتر"/>
  <ProfileHead kind="center" id={c.id} name={c.name} area={c.area} type={c.type} rating={c.rating} reviews={c.reviews} address={c.address}/>
  <Facts items={[{icon:LayoutGrid,label:'القاعات',value:String(c.rooms.length)},{icon:UsersRound,label:'أكبر قاعة',value:`${c.maxSeats} طالب`},{icon:Banknote,label:'سعر الساعة (ج.م)',value:`${c.price.min} – ${c.price.max}`}]}/>
  {c.branches.length>0&&<p className={styles.muted}>فروع أخرى: {c.branches.join('، ')}</p>}

  <section className={styles.section} aria-labelledby="rooms-title"><h2 id="rooms-title">القاعات</h2>
   <ul className={styles.rooms}>{c.rooms.map(r=><li key={r.name}>
    <div className={styles.roomHead}><h3>{r.name}</h3><p className={styles.price}><bdi dir="ltr">{r.price}</bdi> <span>ج.م / ساعة</span></p></div>
    <p className={styles.muted}><UsersRound size={14} aria-hidden="true"/> حتى {r.seats} طالب</p>
    <ul className={styles.features}>{r.features.map(f=><li key={f}>{featureLabel(f)}</li>)}</ul>
   </li>)}</ul>
  </section>

  <section className={styles.section} aria-labelledby="feat-title"><h2 id="feat-title">تجهيزات السنتر</h2><ul className={styles.checkList}>{c.features.map(f=><li key={f}><span aria-hidden="true">{emojiFor(featureLabel(f))}</span>{featureLabel(f)}</li>)}</ul></section>

  {teachers.length>0&&<section className={styles.section} aria-labelledby="tch-title"><h2 id="tch-title">مدرسون بيدرّسوا هنا</h2>
   <ul className={styles.teacherList}>{teachers.map(t=><li key={t.id}><Link href={`/teachers/${t.id}`}><TeacherPortrait teacher={t} className={styles.teacherThumb}/><span><strong>{t.name}</strong><small>{t.subjects.slice(0,2).join('، ')}</small></span></Link></li>)}</ul>
  </section>}

  {reviewRoles.length>0&&<section className={styles.section} aria-labelledby="rev-title"><h2 id="rev-title">آراء المستخدمين</h2>
   <div className={styles.reviews}>{reviewRoles.map(role=>c.reviewsByRole[role]!.map((r,i)=><figure key={`${role}-${i}`}><blockquote>{r.text}</blockquote><figcaption><span>{roleLabels[role]}</span><span className={styles.rating}><Star size={13} aria-hidden="true"/><bdi>{r.rating.toFixed(1)}</bdi></span></figcaption></figure>))}</div>
  </section>}

  <Location lat={c.lat} lng={c.lng} address={c.address}/>
 </div>
 <div className={styles.stickyBar}><p className={styles.price}><small>القاعة من</small><bdi dir="ltr">{c.price.min}</bdi> <span>ج.م / ساعة</span></p><span className={styles.soonTag}>الحجز بيتفعّل قريب</span></div>
 </PublicMarketplaceShell>;
}

export function SpaceProfile({space:s}:{space:SpaceDTO}){
 return <PublicMarketplaceShell active="spaces"><div className={styles.profile}>
  <BackToSearch base="/spaces" label="مساحات المذاكرة"/>
  <ProfileHead kind="space" id={s.id} name={s.name} area={s.area} type={s.type} rating={s.rating} reviews={s.reviews} address={`${s.area}، ${s.governorate}`}/>
  <Facts items={[{icon:UsersRound,label:'السعة',value:s.capacity===1?'فرد واحد':`حتى ${s.capacity} أفراد`},{icon:LayoutGrid,label:'الوحدات المتاحة',value:String(s.units)},{icon:Banknote,label:'نطاق السعر (ج.م)',value:`${s.price.min} – ${s.price.max}`}]}/>
  {s.zones.length>0&&<section className={styles.section} aria-labelledby="zones-title"><h2 id="zones-title">الأماكن</h2><ul className={styles.checkList}>{s.zones.map(z=><li key={z}><span aria-hidden="true">{emojiFor(z)}</span>{z}</li>)}</ul></section>}
  <section className={styles.section} aria-labelledby="feat-title"><h2 id="feat-title">التجهيزات</h2><ul className={styles.checkList}>{s.features.map(f=><li key={f}><span aria-hidden="true">{emojiFor(featureLabel(f))}</span>{featureLabel(f)}</li>)}</ul></section>
  <Location lat={s.lat} lng={s.lng} address={`${s.area}، ${s.governorate}`}/>
 </div>
 <div className={styles.stickyBar}><p className={styles.price}><small>نطاق السعر</small><bdi dir="rtl">{s.price.min} – {s.price.max}</bdi> <span>ج.م</span></p><span className={styles.soonTag}>الحجز بيتفعّل قريب</span></div>
 </PublicMarketplaceShell>;
}
