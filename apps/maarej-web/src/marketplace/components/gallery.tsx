'use client';
// Photo gallery for centers and study spaces: slides change by themselves every few seconds (faster while the card is
// hovered or pressed), and can be flipped with the arrows, the dots or a swipe. Reduced motion → no auto-play.
import {useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import g from './gallery.module.css';

export function Gallery({photos,hot=false,delay=0,controls=true,size='card',nudge}:{photos:readonly string[];hot?:boolean;delay?:number;controls?:boolean;size?:'card'|'hero';nudge?:{n:number;dir:1|-1}}){
 const [i,setI]=useState(0);
 const [seen,setSeen]=useState(false);
 const [calm,setCalm]=useState(false);
 const box=useRef<HTMLDivElement>(null);
 const n=photos.length,go=(d:number)=>setI(v=>(v+d+n)%n);
 useEffect(()=>{setCalm(matchMedia('(prefers-reduced-motion: reduce)').matches);const el=box.current;if(!el)return;
  const io=new IntersectionObserver(([e])=>setSeen(e.isIntersecting),{threshold:.3});io.observe(el);return()=>io.disconnect();},[]);
 // Hovering/pressing the card flips to the next photo right away, then keeps going faster.
 useEffect(()=>{if(hot&&n>1)go(1);},[hot]); // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(calm||!seen||n<2)return;let t:ReturnType<typeof setInterval>|undefined;
  const start=setTimeout(()=>{t=setInterval(()=>go(1),hot?1300:2600);},hot?1300:delay);
  return()=>{clearTimeout(start);if(t)clearInterval(t);};},[calm,seen,hot,n,delay]); // eslint-disable-line react-hooks/exhaustive-deps
 // Swipes are caught by the card (its link covers the photo) and passed in as a nudge.
 useEffect(()=>{if(nudge&&nudge.n>0)go(nudge.dir);},[nudge?.n]); // eslint-disable-line react-hooks/exhaustive-deps
 const sx=useRef<number|null>(null);
 return <div className={g.gallery} data-size={size} ref={box}
  onPointerDown={e=>{sx.current=e.clientX;}} onPointerUp={e=>{if(sx.current===null)return;const dx=e.clientX-sx.current;sx.current=null;if(Math.abs(dx)>40){go(dx<0?1:-1);box.current?.setAttribute('data-swiped','1');}}}>
  <div className={g.strip} dir="ltr" style={{transform:`translateX(${-i*100}%)`}}>
   {photos.map((src,k)=><img key={src} src={src} alt="" draggable={false} loading={k===0&&size==='hero'?'eager':'lazy'}/>)}
  </div>
  {controls&&n>1&&<>
   <button type="button" className={g.prev} onClick={e=>{e.preventDefault();e.stopPropagation();go(-1);}} aria-label="الصورة اللي قبل"><ChevronRight size={18}/></button>
   <button type="button" className={g.next} onClick={e=>{e.preventDefault();e.stopPropagation();go(1);}} aria-label="الصورة اللي بعد"><ChevronLeft size={18}/></button>
   <div className={g.dots} dir="ltr">{photos.map((src,k)=><button type="button" key={src} aria-label={`صورة ${k+1}`} aria-current={k===i} onClick={e=>{e.preventDefault();e.stopPropagation();setI(k);}}/>)}</div>
  </>}
 </div>;
}
