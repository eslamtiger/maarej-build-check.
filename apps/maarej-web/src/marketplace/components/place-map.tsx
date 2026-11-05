'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {Plus,Minus,LocateFixed,Star,X,ArrowLeft} from 'lucide-react';
import styles from './discover.module.css';

export type MapItem={id:string;name:string;area:string;lat:number;lng:number;rating:number;reviews:number;priceLabel:string;priceNote:string;priceUnit?:string;href:string;photo?:string;fallback?:{text:string;bg:string}};

// Schematic map of Greater Cairo. No tile server is used (no third-party requests, works offline),
// so the shapes are approximate and only meant to show where places sit relative to each other.
const W=640,H=440,LAT=[29.8,30.17] as const,LNG=[30.9,31.53] as const;
const project=(lat:number,lng:number)=>({x:28+((lng-LNG[0])/(LNG[1]-LNG[0]))*(W-56),y:24+((LAT[1]-lat)/(LAT[1]-LAT[0]))*(H-48)});
const nile:[number,number][]=[[29.55,31.28],[29.68,31.3],[29.8,31.31],[29.85,31.325],[29.92,31.29],[29.96,31.262],[30.0,31.232],[30.04,31.226],[30.08,31.222],[30.12,31.24],[30.17,31.265],[30.3,31.29],[30.45,31.3]];
const areaLabels:[string,number,number][]=[['حلوان',29.85,31.37],['المعادي',29.94,31.31],['الجيزة',30.0,31.14],['الهرم',29.99,31.07],['6 أكتوبر',29.95,30.96],['الشيخ زايد',30.05,30.99],['مدينة نصر',30.045,31.385],['مصر الجديدة',30.115,31.36],['شبرا',30.14,31.2],['التجمع الخامس',30.0,31.47],['الرحاب',30.07,31.49]];
const path=(pts:[number,number][])=>pts.map(([la,ln],i)=>{const p=project(la,ln);return `${i?'L':'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;}).join(' ');
const zoomSteps=[1,1.7,2.6] as const;
type P={id:string;x:number;y:number};
function spread<T extends P>(pts:T[],s:number):T[]{
 // Pins are ~46x30px; treat each as an ellipse and push overlapping pairs apart along the line between them.
 const out=pts.map(p=>({...p,px:p.x*s,py:p.y*s}));const bw=48,bh=48;
 for(let it=0;it<60;it++){let moved=false;
  for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){const a=out[i],b=out[j];let dx=(b.px-a.px)/bw,dy=(b.py-a.py)/bh;let d=Math.hypot(dx,dy);
   if(d<1){moved=true;if(d<.001){dx=((i+j)%2?1:-1)*.01;dy=.01;d=Math.hypot(dx,dy);}const push=(1-d)/2+.01,ux=dx/d,uy=dy/d;a.px-=ux*push*bw;a.py-=uy*push*bh;b.px+=ux*push*bw;b.py+=uy*push*bh;}}
  if(!moved)break;}
 return out.map(({px,py,...p})=>({...(p as unknown as T),x:px/s,y:py/s}));
}

// Pins are photos (teacher faces are round, places are rounded squares). Tapping a pin hands the id to the page, which jumps to that card.
export function PlaceMap({items,activeId,selectedId,onHover,onSelect,label,shape='square',preview=false}:{items:readonly MapItem[];activeId:string|null;selectedId:string|null;onHover:(id:string|null)=>void;onSelect:(id:string|null)=>void;label:string;shape?:'round'|'square';preview?:boolean}){
 const [zi,setZi]=useState(0);
 const [size,setSize]=useState({w:W,h:H});
 const box=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=box.current;if(!el)return;const read=()=>setSize({w:el.clientWidth||W,h:el.clientHeight||H});read();const ro=new ResizeObserver(read);ro.observe(el);return()=>ro.disconnect();},[]);
 const base=useMemo(()=>items.map(i=>({...i,...project(i.lat,i.lng)})),[items]);
 const s0=Math.min(size.w/W,size.h/H);
 // Start framed on the results (e.g. one governorate), not on all of Greater Cairo.
 const fit=useMemo(()=>{if(!base.length)return {z:1,cx:W/2,cy:H/2};
  const xs=base.map(p=>p.x),ys=base.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const sx=(size.w-180)/Math.max(x1-x0,1),sy=(size.h-170)/Math.max(y1-y0,1);
  return {z:Math.max(1,Math.min(2.6,Math.min(sx,sy)/s0)),cx:(x0+x1)/2,cy:(y0+y1)/2};},[base,size.w,size.h,s0]);
 const z=fit.z*zoomSteps[zi];
 const sBase=s0*z;
 // Pins that would sit on top of each other are nudged apart (screen-space) so each stays tappable.
 const pins=useMemo(()=>spread(base,sBase),[base,sBase]);
 const focus=pins.find(p=>p.id===(selectedId??activeId));
 const s=s0*z;
 const cx=focus&&zi>0?focus.x:fit.cx,cy=focus&&zi>0?focus.y:fit.cy;
 const tx=W*s<=size.w?(size.w-W*s)/2:Math.min(0,Math.max(size.w-W*s,size.w/2-cx*s)),ty=H*s<=size.h?(size.h-H*s)/2:Math.min(0,Math.max(size.h-H*s,size.h/2-cy*s));
 const at=(x:number,y:number)=>({left:x*s+tx,top:y*s+ty});
 const selected=pins.find(p=>p.id===selectedId);
 // Keep DOM order stable (reordering on hover breaks taps); the active pin is lifted with z-index instead.
 return <div className={styles.mapBox} ref={box} role="group" aria-label={label}>
  <svg className={styles.mapSvg} width={size.w} height={size.h} aria-hidden="true" onClick={()=>onSelect(null)}>
   <defs><pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" className={styles.mapGridLine}/></pattern></defs>
   <g transform={`translate(${tx} ${ty}) scale(${s})`}>
    <rect x="-3000" y="-3000" width="7000" height="7000" className={styles.mapLand}/>
    <rect x="-3000" y="-3000" width="7000" height="7000" fill="url(#mapgrid)"/>
    <path d={path(nile)} className={styles.mapNileBank}/><path d={path(nile)} className={styles.mapNile}/>
   </g>
  </svg>
  <span className={styles.mapNileLabel} style={at(project(30.03,31.226).x-26,project(30.03,31.226).y)}>النيل</span>
  {areaLabels.map(([n,la,ln])=>{const p=project(la,ln);return <span key={n} className={styles.mapArea} style={at(p.x,p.y)}>{n}</span>;})}
  {pins.map(p=>{const on=p.id===activeId||p.id===selectedId;
   return <button type="button" key={p.id} className={styles.photoPin} data-shape={shape} data-on={on} style={at(p.x,p.y)} aria-pressed={p.id===selectedId} aria-label={`${p.name}، ${p.area}`}
    onMouseEnter={()=>onHover(p.id)} onMouseLeave={()=>onHover(null)} onFocus={()=>onHover(p.id)} onBlur={()=>onHover(null)} onClick={()=>onSelect(p.id)}>
    {p.photo?<img src={p.photo} alt="" loading="lazy" draggable={false}/>:<span style={{background:p.fallback?.bg}}>{p.fallback?.text}</span>}
    {on&&<b><Star size={11} aria-hidden="true"/><bdi>{p.rating.toFixed(1)}</bdi></b>}
   </button>;})}
  <div className={styles.mapControls}>
   <button type="button" onClick={()=>setZi(i=>Math.min(i+1,zoomSteps.length-1))} aria-label="تكبير الخريطة" disabled={zi===zoomSteps.length-1}><Plus size={18}/></button>
   <button type="button" onClick={()=>setZi(i=>Math.max(i-1,0))} aria-label="تصغير الخريطة" disabled={zi===0}><Minus size={18}/></button>
   <button type="button" onClick={()=>{setZi(0);onSelect(null);}} aria-label="إعادة ضبط الخريطة"><LocateFixed size={17}/></button>
  </div>
  {pins.length===0&&<p className={styles.mapEmpty}>مفيش نتايج</p>}
  {preview&&selected&&<div className={styles.mapPreview}>
   {selected.photo?<img src={selected.photo} alt="" loading="lazy"/>:<span className={styles.mapFallback} style={{background:selected.fallback?.bg}} aria-hidden="true">{selected.fallback?.text}</span>}
   <div><strong><bdi>{selected.name}</bdi></strong><span>{selected.area}</span><span className={styles.mapRate}><Star size={13} aria-hidden="true"/><bdi>{selected.rating.toFixed(1)}</bdi> · {selected.reviews} تقييم</span><b>{selected.priceNote} <bdi dir="ltr">{selected.priceLabel}</bdi> {selected.priceUnit??'ج.م'}</b></div>
   <Link href={selected.href} className={styles.mapGo} aria-label={`عرض ${selected.name}`}><ArrowLeft size={18} aria-hidden="true"/></Link>
   <button type="button" className={styles.mapClose} onClick={()=>onSelect(null)} aria-label="إغلاق"><X size={16}/></button>
  </div>}
 </div>;
}
