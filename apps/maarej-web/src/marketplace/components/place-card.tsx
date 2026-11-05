'use client';
import Link from 'next/link';
import {useState} from 'react';
import type {CSSProperties} from 'react';
import {Building2,DoorOpen,Star,MapPin} from 'lucide-react';
import {emojiFor} from '../adapters/emoji';
import type {CenterDTO,SpaceDTO} from '../types/place';
import {featureLabel,placePhoto} from '../adapters/places';
import c from './cards.module.css';
import styles from './places.module.css';

// Five tones from the Maarej palette, assigned by id so a place keeps its colour everywhere.
const tones=['blue','violet','mint','amber','rose'] as const;
export const toneOf=(id:string)=>tones[[...id].reduce((s,ch)=>s+ch.charCodeAt(0),0)%tones.length];

// Photo cover used on the profile page. If the photo fails, a soft gradient with the place icon stays.
export function PlaceCover({kind,id,area,size='card'}:{kind:'center'|'space';id:string;name?:string;area:string;size?:'card'|'hero'}){
 const Icon=kind==='center'?Building2:DoorOpen;
 const [failed,setFailed]=useState(false);
 return <div className={`${styles.cover} ${size==='hero'?styles.coverHero:''}`} data-tone={toneOf(id)} aria-hidden="true">
  {failed?<span className={styles.coverIconBig}><Icon size={size==='hero'?54:36} strokeWidth={1.5}/></span>
   :<img className={styles.coverPhoto} src={placePhoto(kind,id,size==='hero'?1400:800)} alt="" loading={size==='hero'?'eager':'lazy'} onError={()=>setFailed(true)}/>}
  <span className={styles.coverArea}><MapPin size={13}/>{area}</span>
 </div>;
}

function Photo({src}:{src:string}){
 const [failed,setFailed]=useState(false);
 return failed?null:<img className={c.photo} src={src} alt="" loading="lazy" onError={()=>setFailed(true)}/>;
}

export type Fact={emoji:string;label:string;value:string};
type Sync={active?:boolean;picked?:boolean;onHover?:(id:string|null)=>void;index?:number};
type Props={kind:'center'|'space';id:string;href:string;name:string;area:string;rating:number;reviews:number;price:number;unit:string;facts:Fact[];tags:{emoji:string;label:string}[];tagKind:'features'|'zones'|'subjects'}&Sync;

// One line of facts: small thin label, bold value.
export function Facts({facts}:{facts:Fact[]}){
 return <ul className={c.facts}>{facts.map(({emoji,label,value})=><li key={label}><i aria-hidden="true">{emoji}</i><small>{label}</small><b>{value}</b></li>)}</ul>;
}
// One line of tags: three, then +N.
export function Tags({tags,kind,label}:{tags:{emoji:string;label:string}[];kind:'features'|'zones'|'subjects';label:string}){
 if(!tags.length)return null;
 // The "+N" sits outside the clipped row so it always shows.
 return <div className={c.tagRow}><ul className={c.tags} data-kind={kind} aria-label={label}>{tags.slice(0,3).map(t=><li key={t.label}><span aria-hidden="true">{t.emoji}</span>{t.label}</li>)}</ul>{tags.length>3&&<span className={c.more} aria-label={`و${tags.length-3} كمان`}><bdi dir="ltr">+{tags.length-3}</bdi></span>}</div>;
}
export function CardHead({name,area}:{name:string;area:string}){
 return <div className={c.head}><h3><bdi>{name}</bdi></h3><span className={c.area}><MapPin size={14} aria-hidden="true"/>{area}</span></div>;
}

function PlaceCard({kind,id,href,name,area,rating,reviews,price,unit,facts,tags,tagKind,active,picked,onHover,index=0}:Props){
 const Kind=kind==='center'?Building2:DoorOpen;
 return <Link href={href} id={`card-${id}`} className={c.card} data-active={active} data-picked={picked} style={{'--i':index} as CSSProperties}
  onMouseEnter={()=>onHover?.(id)} onMouseLeave={()=>onHover?.(null)} onFocus={()=>onHover?.(id)} onBlur={()=>onHover?.(null)}>
  <div className={c.media}>
   <Photo src={placePhoto(kind,id)}/>
   <span className={c.rate}><Star aria-hidden="true"/><bdi>{rating.toFixed(1)}</bdi><small>({reviews})</small></span>
   <span className={c.kind} aria-hidden="true"><Kind size={18}/></span>
   <span className={c.price}><small>من</small><b><bdi dir="ltr">{price}</bdi></b><small>{unit}</small></span>
  </div>
  <div className={c.body}>
   <CardHead name={name} area={area}/>
   <Facts facts={facts}/>
   <Tags tags={tags} kind={tagKind} label={tagKind==='zones'?'الأماكن':'التجهيزات'}/>
  </div>
 </Link>;
}

export function CenterCard({center:x,returnTo,...sync}:{center:CenterDTO;returnTo:string}&Sync){
 return <PlaceCard kind="center" id={x.id} href={`/centers/${x.id}?returnTo=${encodeURIComponent(returnTo)}`} name={x.name} area={x.area} rating={x.rating} reviews={x.reviews} price={x.price.min} unit="ج.م / ساعة"
  facts={[{emoji:'🚪',label:'القاعات',value:String(x.rooms.length)},{emoji:'👥',label:'أكبر قاعة',value:`${x.maxSeats} طالب`}]}
  tags={x.features.map(f=>{const l=featureLabel(f);return {emoji:emojiFor(l),label:l};})} tagKind="features" {...sync}/>;
}

export function SpaceCard({space:x,returnTo,...sync}:{space:SpaceDTO;returnTo:string}&Sync){
 return <PlaceCard kind="space" id={x.id} href={`/spaces/${x.id}?returnTo=${encodeURIComponent(returnTo)}`} name={x.name} area={x.area} rating={x.rating} reviews={x.reviews} price={x.price.min} unit="ج.م"
  facts={[{emoji:'👥',label:'السعة',value:x.capacity===1?'فرد واحد':`${x.capacity} أفراد`},{emoji:'🪑',label:'الوحدات',value:String(x.units)}]}
  tags={x.zones.map(z=>({emoji:emojiFor(z),label:z}))} tagKind="zones" {...sync}/>;
}
