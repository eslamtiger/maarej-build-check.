'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import type {CSSProperties,PointerEvent as ReactPointerEvent,MouseEvent as ReactMouseEvent} from 'react';
import {Building2,DoorOpen,Star,MapPin,UsersRound,LayoutGrid} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {emojiFor} from '../adapters/emoji';
import type {CenterDTO,SpaceDTO} from '../types/place';
import {featureLabel,placePhotos} from '../adapters/places';
import {Gallery} from './gallery';
import c from './cards.module.css';
import styles from './places.module.css';

// Five tones from the Maarej palette, assigned by id so a place keeps its colour everywhere.
const tones=['blue','violet','mint','amber','rose'] as const;
export const toneOf=(id:string)=>tones[[...id].reduce((s,ch)=>s+ch.charCodeAt(0),0)%tones.length];

// Profile cover: a full-width gallery of the place's photos. If photos fail, the soft tone + area label stay.
export function PlaceCover({kind,id,area,size='card'}:{kind:'center'|'space';id:string;name?:string;area:string;size?:'card'|'hero'}){
 return <div className={`${styles.cover} ${size==='hero'?styles.coverHero:''}`} data-tone={toneOf(id)}>
  <Gallery photos={placePhotos(kind,id,size==='hero'?1400:800,5)} size={size}/>
  <span className={styles.coverArea}><MapPin size={13}/>{area}</span>
 </div>;
}


export type Fact={icon:LucideIcon;label?:string;value:string};
export type Tag={emoji:string;label:string;tone?:'system'};
type Sync={active?:boolean;picked?:boolean;onHover?:(id:string|null)=>void;index?:number};
type Props={kind:'center'|'space';id:string;href:string;name:string;area:string;rating:number;reviews:number;price:{min:number;max:number};unit:string;facts:Fact[];tags:Tag[];tagKind:'features'|'zones'|'subjects'}&Sync;

// One line of facts: purple icon, optional small label, value.
export function Facts({facts}:{facts:Fact[]}){
 return <ul className={c.facts}>{facts.map(({icon:Icon,label,value})=><li key={value}><i aria-hidden="true"><Icon size={18}/></i>{label&&<small>{label}</small>}<b>{value}</b></li>)}</ul>;
}
// Price range on the photo: lowest – highest.
export function PriceTag({price,unit}:{price:{min:number;max:number};unit:string}){
 return <span className={c.price}><b><bdi dir="rtl">{price.min===price.max?price.min:`${price.min} – ${price.max}`}</bdi></b><small>{unit}</small></span>;
}
// Shared card frame: the title link covers the whole card; gallery buttons sit above it.
// Hover or a long press makes the card "hot": the border lights up and the gallery flips.
export function useCardMotion(){
 const [hot,setHot]=useState(false);
 const [nudge,setNudge]=useState<{n:number;dir:1|-1}>({n:0,dir:1});
 const sx=useRef<{x:number;t:ReturnType<typeof setTimeout>}|null>(null);
 const swiped=useRef(false);
 // On touch screens there is no hover: the card that settles in the middle of the screen while scrolling gets the lit frame.
 const ref=useRef<HTMLElement>(null);
 const [centered,setCentered]=useState(false);
 useEffect(()=>{const el=ref.current;if(!el||matchMedia('(hover:hover)').matches)return;
  const io=new IntersectionObserver(([e])=>setCentered(e.isIntersecting),{rootMargin:'-42% 0px -42% 0px'});io.observe(el);return()=>io.disconnect();},[]);
 const handlers={
  onPointerDown:(e:ReactPointerEvent)=>{if(e.pointerType==='mouse')return;const t=setTimeout(()=>setHot(true),350);sx.current={x:e.clientX,t};},
  onPointerUp:(e:ReactPointerEvent)=>{const d=sx.current;if(!d)return;clearTimeout(d.t);sx.current=null;setHot(false);const dx=e.clientX-d.x;if(Math.abs(dx)>40){swiped.current=true;setNudge(v=>({n:v.n+1,dir:dx<0?1:-1}));}},
  onPointerCancel:()=>{if(sx.current)clearTimeout(sx.current.t);sx.current=null;setHot(false);},
  onClickCapture:(e:ReactMouseEvent)=>{if(swiped.current){e.preventDefault();e.stopPropagation();swiped.current=false;}},
 };
 return {hot,setHot,nudge,handlers,ref,centered};
}
// One line of tags: three, then +N.
export function Tags({tags,kind,label}:{tags:Tag[];kind:'features'|'zones'|'subjects';label:string}){
 if(!tags.length)return null;
 // The "+N" sits outside the clipped row so it always shows.
 return <div className={c.tagRow}><ul className={c.tags} data-kind={kind} aria-label={label}>{tags.slice(0,3).map(t=><li key={t.label} data-tone={t.tone}><span aria-hidden="true">{t.emoji}</span>{t.label}</li>)}</ul>{tags.length>3&&<span className={c.more} aria-label={`و${tags.length-3} كمان`}><bdi dir="ltr">+{tags.length-3}</bdi></span>}</div>;
}
export function CardHead({name,area,href,onFocus,onBlur}:{name:string;area:string;href:string;onFocus?:()=>void;onBlur?:()=>void}){
 return <div className={c.head}><h3><Link href={href} className={c.cover} onFocus={onFocus} onBlur={onBlur}><bdi>{name}</bdi></Link></h3><span className={c.area}><MapPin size={14} aria-hidden="true"/>{area}</span></div>;
}

function PlaceCard({kind,id,href,name,area,rating,reviews,price,unit,facts,tags,tagKind,active,picked,onHover,index=0}:Props){
 const Kind=kind==='center'?Building2:DoorOpen;
 const {hot,setHot,nudge,handlers,ref,centered}=useCardMotion();
 return <article ref={ref} id={`card-${id}`} className={c.card} data-active={active} data-picked={picked} data-hot={hot} data-centered={centered} style={{'--i':index} as CSSProperties} {...handlers}
  onMouseEnter={()=>{setHot(true);onHover?.(id);}} onMouseLeave={()=>{setHot(false);onHover?.(null);}}>
  <div className={c.media}>
   <Gallery photos={placePhotos(kind,id)} hot={hot||centered} delay={(index%6)*450} nudge={nudge}/>
   <span className={c.rate}><Star aria-hidden="true"/><bdi>{rating.toFixed(1)}</bdi><small>({reviews})</small></span>
   <span className={c.kind} aria-hidden="true"><Kind size={18}/></span>
   <PriceTag price={price} unit={unit}/>
  </div>
  <div className={c.body}>
   <CardHead name={name} area={area} href={href} onFocus={()=>onHover?.(id)} onBlur={()=>onHover?.(null)}/>
   <Facts facts={facts}/>
   <Tags tags={tags} kind={tagKind} label={tagKind==='zones'?'الأماكن':'التجهيزات'}/>
  </div>
 </article>;
}

export function CenterCard({center:x,returnTo,...sync}:{center:CenterDTO;returnTo:string}&Sync){
 return <PlaceCard kind="center" id={x.id} href={`/centers/${x.id}?returnTo=${encodeURIComponent(returnTo)}`} name={x.name} area={x.area} rating={x.rating} reviews={x.reviews} price={x.price} unit="ج.م / ساعة"
  facts={[{icon:DoorOpen,label:'القاعات',value:String(x.rooms.length)},{icon:UsersRound,label:'أكبر قاعة',value:`${x.maxSeats} طالب`}]}
  tags={x.features.map(f=>{const l=featureLabel(f);return {emoji:emojiFor(l),label:l};})} tagKind="features" {...sync}/>;
}

export function SpaceCard({space:x,returnTo,...sync}:{space:SpaceDTO;returnTo:string}&Sync){
 return <PlaceCard kind="space" id={x.id} href={`/spaces/${x.id}?returnTo=${encodeURIComponent(returnTo)}`} name={x.name} area={x.area} rating={x.rating} reviews={x.reviews} price={x.price} unit="ج.م"
  facts={[{icon:LayoutGrid,label:'الوحدات',value:String(x.units)},{icon:UsersRound,label:'السعة',value:x.capacity===1?'فرد واحد':`${x.capacity} أفراد`}]}
  tags={x.zones.map(z=>({emoji:emojiFor(z),label:z}))} tagKind="zones" {...sync}/>;
}
