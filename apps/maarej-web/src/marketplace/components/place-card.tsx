'use client';
import Link from 'next/link';
import {useState} from 'react';
import type {CSSProperties} from 'react';
import type {LucideIcon} from 'lucide-react';
import {Building2,DoorOpen,Star,MapPin,UsersRound,LayoutGrid,ArrowLeft,Check,Trees} from 'lucide-react';
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

export type Fact={icon:LucideIcon;label:string;value:string};
type Sync={active?:boolean;picked?:boolean;onHover?:(id:string|null)=>void;index?:number};
type Props={kind:'center'|'space';id:string;href:string;name:string;sub:string;rating:number;reviews:number;price:number;unit:string;facts:Fact[];tags:string[];tagKind:'features'|'zones'}&Sync;

export function Facts({facts}:{facts:Fact[]}){
 return <dl className={c.facts}>{facts.map(({icon:Icon,label,value})=><div key={label}><dt><Icon size={14} aria-hidden="true"/>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

function PlaceCard({kind,id,href,name,sub,rating,reviews,price,unit,facts,tags,tagKind,active,picked,onHover,index=0}:Props){
 const Kind=kind==='center'?Building2:DoorOpen,TagIcon=tagKind==='zones'?Trees:Check;
 return <Link href={href} id={`card-${id}`} className={c.card} data-active={active} data-picked={picked} style={{'--i':index} as CSSProperties}
  onMouseEnter={()=>onHover?.(id)} onMouseLeave={()=>onHover?.(null)} onFocus={()=>onHover?.(id)} onBlur={()=>onHover?.(null)}>
  <div className={c.media}>
   <Photo src={placePhoto(kind,id)}/>
   <span className={c.rate}><Star size={20} aria-hidden="true"/><bdi>{rating.toFixed(1)}</bdi><small>({reviews})</small></span>
   <span className={c.kind} aria-hidden="true"><Kind size={18}/></span>
   <span className={c.price}><small>من</small><b><bdi dir="ltr">{price}</bdi></b><small>{unit}</small></span>
  </div>
  <div className={c.body}>
   <div className={c.head}><div><h3><bdi>{name}</bdi></h3><p>{sub}</p></div><span className={c.go} aria-hidden="true"><ArrowLeft size={20}/></span></div>
   <Facts facts={facts}/>
   {tags.length>0&&<ul className={c.tags} data-kind={tagKind} aria-label={tagKind==='zones'?'الأماكن':'التجهيزات'}>{tags.slice(0,4).map(t=><li key={t}><TagIcon size={13} aria-hidden="true"/>{t}</li>)}{tags.length>4&&<li><bdi dir="ltr">+{tags.length-4}</bdi></li>}</ul>}
  </div>
 </Link>;
}

export function CenterCard({center:x,returnTo,...sync}:{center:CenterDTO;returnTo:string}&Sync){
 return <PlaceCard kind="center" id={x.id} href={`/centers/${x.id}?returnTo=${encodeURIComponent(returnTo)}`} name={x.name} sub={x.type} rating={x.rating} reviews={x.reviews} price={x.price.min} unit="ج.م / ساعة"
  facts={[{icon:MapPin,label:'المنطقة',value:x.area},{icon:LayoutGrid,label:'القاعات',value:String(x.rooms.length)},{icon:UsersRound,label:'أكبر قاعة',value:`${x.maxSeats} طالب`}]}
  tags={x.features.map(featureLabel)} tagKind="features" {...sync}/>;
}

export function SpaceCard({space:x,returnTo,...sync}:{space:SpaceDTO;returnTo:string}&Sync){
 return <PlaceCard kind="space" id={x.id} href={`/spaces/${x.id}?returnTo=${encodeURIComponent(returnTo)}`} name={x.name} sub={x.type} rating={x.rating} reviews={x.reviews} price={x.price.min} unit="ج.م"
  facts={[{icon:MapPin,label:'المنطقة',value:x.area},{icon:UsersRound,label:'السعة',value:x.capacity===1?'فرد واحد':`${x.capacity} أفراد`},{icon:LayoutGrid,label:'الوحدات',value:String(x.units)}]}
  tags={x.zones} tagKind="zones" {...sync}/>;
}
