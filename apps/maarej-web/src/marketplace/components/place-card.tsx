'use client';
import Link from 'next/link';
import {useState} from 'react';
import type {CSSProperties} from 'react';
import {Building2,DoorOpen,Star,MapPin,UsersRound,LayoutGrid,ArrowLeft} from 'lucide-react';
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

type Sync={active?:boolean;onHover?:(id:string|null)=>void;index?:number};
type Props={kind:'center'|'space';id:string;href:string;name:string;area:string;rating:number;reviews:number;price:number;unit:string;facts:{icon:typeof UsersRound;text:string}[];features:string[]}&Sync;

function PlaceCard({kind,id,href,name,area,rating,reviews,price,unit,facts,features,active,onHover,index=0}:Props){
 const Kind=kind==='center'?Building2:DoorOpen;
 return <article id={`card-${id}`} className={c.card} data-active={active} style={{'--i':index} as CSSProperties} onMouseEnter={()=>onHover?.(id)} onMouseLeave={()=>onHover?.(null)}>
  <div className={c.media} aria-hidden="true">
   <Photo src={placePhoto(kind,id)}/>
   <span className={c.rate}><Star size={13}/><bdi>{rating.toFixed(1)}</bdi><small>({reviews})</small></span>
   <span className={c.kind}><Kind size={18}/></span>
   <span className={c.price}><small>من</small><bdi dir="ltr">{price}</bdi><small>{unit}</small></span>
  </div>
  <div className={c.body}>
   <div className={c.head}><h3><Link href={href} onFocus={()=>onHover?.(id)} onBlur={()=>onHover?.(null)}><bdi>{name}</bdi></Link></h3><span className={c.go} aria-hidden="true"><ArrowLeft size={20}/></span></div>
   <ul className={c.meta}><li><MapPin size={15} aria-hidden="true"/>{area}</li>{facts.map(({icon:Icon,text})=><li key={text}><Icon size={15} aria-hidden="true"/>{text}</li>)}</ul>
   <ul className={c.tags} aria-label="تجهيزات">{features.slice(0,3).map(f=><li key={f}>{featureLabel(f)}</li>)}{features.length>3&&<li><bdi dir="ltr">+{features.length-3}</bdi></li>}</ul>
  </div>
 </article>;
}

export function CenterCard({center:x,returnTo,...sync}:{center:CenterDTO;returnTo:string}&Sync){
 return <PlaceCard kind="center" id={x.id} href={`/centers/${x.id}?returnTo=${encodeURIComponent(returnTo)}`} name={x.name} area={x.area} rating={x.rating} reviews={x.reviews} price={x.price.min} unit="ج.م / ساعة"
  facts={[{icon:LayoutGrid,text:`${x.rooms.length} قاعات`},{icon:UsersRound,text:`حتى ${x.maxSeats} طالب`}]} features={x.features} {...sync}/>;
}

export function SpaceCard({space:x,returnTo,...sync}:{space:SpaceDTO;returnTo:string}&Sync){
 return <PlaceCard kind="space" id={x.id} href={`/spaces/${x.id}?returnTo=${encodeURIComponent(returnTo)}`} name={x.name} area={x.area} rating={x.rating} reviews={x.reviews} price={x.price.min} unit="ج.م"
  facts={[{icon:UsersRound,text:x.capacity===1?'فرد واحد':`حتى ${x.capacity} أفراد`},{icon:LayoutGrid,text:x.type}]} features={x.features} {...sync}/>;
}
