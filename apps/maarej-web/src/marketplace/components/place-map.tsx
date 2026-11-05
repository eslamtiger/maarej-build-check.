'use client';
// A real street map (OpenStreetMap data, CARTO "Voyager" tiles) drawn with plain <img> tiles, so no map library is needed.
// Pins are Google-style drops with a photo inside. Drag to move, +/− to zoom, ⌖ to frame all results again.
// Tapping a pin hands the id to the page, which brings that card to the top of the list.
import {useEffect,useMemo,useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent} from 'react';
import {Plus,Minus,LocateFixed} from 'lucide-react';
import styles from './discover.module.css';

export type MapItem={id:string;name:string;area:string;lat:number;lng:number;rating:number;reviews:number;priceLabel:string;priceNote:string;priceUnit?:string;href:string;photo?:string;fallback?:{text:string;bg:string}};

const TILE=256,MINZ=9,MAXZ=17;
const world=(z:number)=>TILE*2**z;
const lon2x=(lng:number,z:number)=>(lng+180)/360*world(z);
const lat2y=(lat:number,z:number)=>{const r=lat*Math.PI/180;return (1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*world(z);};
const x2lon=(x:number,z:number)=>x/world(z)*360-180;
const y2lat=(y:number,z:number)=>{const n=Math.PI-2*Math.PI*y/world(z);return 180/Math.PI*Math.atan(.5*(Math.exp(n)-Math.exp(-n)));};
type View={lat:number;lng:number;z:number};

// Largest zoom where every result fits, leaving room for the pins (they stand ~56px above their point).
function fitView(items:readonly MapItem[],w:number,h:number):View{
 if(!items.length)return {lat:30.03,lng:31.22,z:11};
 for(let z=15;z>=MINZ;z--){
  const xs=items.map(i=>lon2x(i.lng,z)),ys=items.map(i=>lat2y(i.lat,z));
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  if((x1-x0<=w-110&&y1-y0<=h-130)||z===MINZ)return {lng:x2lon((x0+x1)/2,z),lat:y2lat((y0+y1)/2-24,z),z};
 }
 return {lat:30.03,lng:31.22,z:11};
}

type P={id:string;x:number;y:number};
// Pins that would sit on top of each other are nudged apart (screen space) so each stays tappable.
function spread<T extends P>(pts:T[]):T[]{
 const out=pts.map(p=>({...p}));const r=40;
 for(let it=0;it<50;it++){let moved=false;
  for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){const a=out[i],b=out[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
   if(d<r){moved=true;if(d<.01){dx=(i+j)%2?1:-1;dy=.5;d=Math.hypot(dx,dy);}const push=(r-d)/2+.5,ux=dx/d,uy=dy/d;a.x-=ux*push;a.y-=uy*push;b.x+=ux*push;b.y+=uy*push;}}
  if(!moved)break;}
 return out;
}

export function PlaceMap({items,activeId,selectedId,onHover,onSelect,label,shape='square'}:{items:readonly MapItem[];activeId:string|null;selectedId:string|null;onHover:(id:string|null)=>void;onSelect:(id:string|null)=>void;label:string;shape?:'round'|'square'}){
 const box=useRef<HTMLDivElement>(null);
 const [size,setSize]=useState({w:360,h:360});
 const [view,setView]=useState<View>({lat:30.03,lng:31.22,z:11});
 const [retina,setRetina]=useState(false);
 const drag=useRef<{x:number;y:number;cx:number;cy:number;moved:boolean}|null>(null);
 const suppress=useRef(false);
 useEffect(()=>{setRetina(devicePixelRatio>1);const el=box.current;if(!el)return;const read=()=>setSize({w:el.clientWidth||360,h:el.clientHeight||360});read();const ro=new ResizeObserver(read);ro.observe(el);return()=>ro.disconnect();},[]);
 // Re-frame whenever the results change (a new filter) or the box changes size.
 const key=items.map(i=>i.id).join(',');
 useEffect(()=>{setView(fitView(items,size.w,size.h));},[key,size.w,size.h]); // eslint-disable-line react-hooks/exhaustive-deps

 const {z}=view,cx=lon2x(view.lng,z),cy=lat2y(view.lat,z),ox=cx-size.w/2,oy=cy-size.h/2;
 const tiles=useMemo(()=>{const out:{k:string;x:number;y:number;src:string}[]=[];const n=2**z;
  for(let tx=Math.floor(ox/TILE);tx<=Math.floor((ox+size.w)/TILE);tx++)for(let ty=Math.floor(oy/TILE);ty<=Math.floor((oy+size.h)/TILE);ty++){
   if(ty<0||ty>=n)continue;const wx=((tx%n)+n)%n;
   out.push({k:`${z}/${tx}/${ty}`,x:tx*TILE-ox,y:ty*TILE-oy,src:`https://${'abcd'[(wx+ty)%4]}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${wx}/${ty}${retina?'@2x':''}.png`});}
  return out;},[z,ox,oy,size.w,size.h,retina]);
 const pins=spread(items.map(i=>({...i,x:lon2x(i.lng,z)-ox,y:lat2y(i.lat,z)-oy})));

 const zoom=(d:number)=>setView(v=>({...v,z:Math.max(MINZ,Math.min(MAXZ,v.z+d))}));
 const onDown=(e:ReactPointerEvent<HTMLDivElement>)=>{if((e.target as HTMLElement).closest('[data-controls]'))return;drag.current={x:e.clientX,y:e.clientY,cx,cy,moved:false};
  const move=(ev:PointerEvent)=>{const d=drag.current;if(!d)return;const dx=ev.clientX-d.x,dy=ev.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<5)return;d.moved=true;
   setView(v=>({...v,lng:x2lon(d.cx-dx,v.z),lat:y2lat(d.cy-dy,v.z)}));};
  const up=()=>{suppress.current=!!drag.current?.moved;drag.current=null;removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);};
  addEventListener('pointermove',move);addEventListener('pointerup',up);addEventListener('pointercancel',up);};

 return <div className={styles.realMap} ref={box} dir="ltr" role="group" aria-label={label} onPointerDown={onDown}
  onClickCapture={e=>{if(suppress.current){e.stopPropagation();e.preventDefault();suppress.current=false;}}}>
  <div className={styles.tiles} aria-hidden="true">{tiles.map(t=><img key={t.k} src={t.src} alt="" draggable={false} style={{left:t.x,top:t.y}}/>)}</div>
  {pins.map(p=>{const on=p.id===activeId||p.id===selectedId;
   return <button type="button" key={p.id} className={styles.dropPin} data-shape={shape} data-on={on} style={{left:p.x,top:p.y}} aria-pressed={p.id===selectedId} aria-label={`${p.name}، ${p.area}`}
    onMouseEnter={()=>onHover(p.id)} onMouseLeave={()=>onHover(null)} onFocus={()=>onHover(p.id)} onBlur={()=>onHover(null)} onClick={()=>onSelect(p.id)}>
    <span className={styles.drop}>{p.photo?<img src={p.photo} alt="" draggable={false}/>:<i style={{background:p.fallback?.bg}}>{p.fallback?.text}</i>}</span>
   </button>;})}
  <div className={styles.mapControls} data-controls>
   <button type="button" onClick={()=>zoom(1)} aria-label="تكبير الخريطة" disabled={z>=MAXZ}><Plus size={18}/></button>
   <button type="button" onClick={()=>zoom(-1)} aria-label="تصغير الخريطة" disabled={z<=MINZ}><Minus size={18}/></button>
   <button type="button" onClick={()=>{setView(fitView(items,size.w,size.h));onSelect(null);}} aria-label="اعرض كل النتايج"><LocateFixed size={17}/></button>
  </div>
  {items.length===0&&<p className={styles.mapEmpty}>مفيش نتايج</p>}
  <p className={styles.attr}><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a> · <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">© CARTO</a></p>
 </div>;
}
