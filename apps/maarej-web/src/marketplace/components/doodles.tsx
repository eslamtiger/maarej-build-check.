// Pencil-style doodles for the site wallpaper and hand-drawn arrows. Decorative only (aria-hidden), no images.
import type {CSSProperties} from 'react';
import d from './doodles.module.css';

export type DoodleName='star'|'rocket'|'planet'|'plane'|'bulb'|'book'|'pencil'|'cap'|'squiggle'|'plus'|'spiral'|'sparkle';
// 100×100 drawings, one main pass plus a lighter offset pass so it looks sketched with a pencil.
const shapes:Record<DoodleName,string[]>={
 star:['M50 8 L60 38 L92 40 L66 59 L76 90 L50 72 L24 90 L34 59 L8 40 L40 38 Z','M51 11 L61 40 L89 42 L68 58 L77 86 L52 70'],
 rocket:['M50 8 C66 24 68 50 61 68 L39 68 C32 50 34 24 50 8 Z','M39 58 L24 76 L40 72','M61 58 L76 76 L60 72','M44 72 Q50 94 56 72','M50 32 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0'],
 planet:['M50 50 m-19 0 a19 19 0 1 0 38 0 a19 19 0 1 0 -38 0','M8 60 C30 80 80 60 92 38','M12 66 C34 84 82 64 90 44'],
 plane:['M8 50 L92 12 L68 88 L50 60 Z','M50 60 L92 12','M50 60 L48 80'],
 bulb:['M50 10 C74 10 82 36 67 52 C61 58 61 66 61 70 L39 70 C39 66 39 58 33 52 C18 36 26 10 50 10 Z','M41 79 H59','M44 88 H56','M50 28 L50 48'],
 book:['M10 24 C30 19 43 24 50 33 C57 24 70 19 90 24 V77 C70 72 57 77 50 86 C43 77 30 72 10 77 Z','M50 33 V86','M20 40 C28 38 36 40 42 44','M58 44 C64 40 72 38 80 40'],
 pencil:['M18 82 L25 62 L72 15 L85 28 L38 75 Z','M64 23 L77 36','M18 82 L31 77'],
 cap:['M50 20 L94 42 L50 64 L6 42 Z','M26 53 V72 C40 83 60 83 74 72 V53','M94 42 V66'],
 squiggle:['M4 52 Q16 28 28 52 T52 52 T76 52 T98 52','M6 58 Q18 34 30 58 T54 58 T78 58'],
 plus:['M50 28 V72','M28 50 H72'],
 spiral:['M50 50 m0 0 a5 5 0 1 1 10 0 a11 11 0 1 1 -22 0 a17 17 0 1 1 34 0 a23 23 0 1 1 -46 0'],
 sparkle:['M50 12 Q55 45 88 50 Q55 55 50 88 Q45 55 12 50 Q45 45 50 12 Z'],
};
export function Doodle({n,size=48,className,style}:{n:DoodleName;size?:number;className?:string;style?:CSSProperties}){
 return <svg viewBox="0 0 100 100" width={size} height={size} className={`${d.doodle} ${className??''}`} style={style} aria-hidden="true" focusable="false">
  {shapes[n].map((p,i)=><path key={i} d={p} className={i===0?d.main:d.alt}/>)}
 </svg>;
}

// A hand-drawn curved arrow (dashed, drawn in slowly). dir: which way it points; flip it with `mirror`.
export function Arrow({className,mirror=false,w=90}:{className?:string;mirror?:boolean;w?:number}){
 return <svg viewBox="0 0 120 70" width={w} className={`${d.arrow} ${className??''}`} style={mirror?{transform:'scaleX(-1)'}:undefined} aria-hidden="true" focusable="false">
  <path className={d.line} d="M6 10 C 40 2, 78 14, 100 52"/>
  <path className={d.head} d="M84 50 L102 56 L104 36"/>
 </svg>;
}

type Spot={n:DoodleName;x:number;y:number;s:number;r:number;wide?:boolean};
const spots:readonly Spot[]=[
 {n:'star',x:6,y:9,s:60,r:-12},{n:'rocket',x:88,y:16,s:84,r:28},{n:'sparkle',x:20,y:26,s:30,r:0},{n:'planet',x:92,y:46,s:72,r:-10},
 {n:'plane',x:7,y:54,s:68,r:-8},{n:'bulb',x:88,y:74,s:66,r:10},{n:'book',x:14,y:84,s:72,r:-6},{n:'pencil',x:62,y:92,s:64,r:14},
 {n:'cap',x:42,y:6,s:52,r:-8,wide:true},{n:'squiggle',x:72,y:30,s:70,r:-6,wide:true},{n:'plus',x:34,y:44,s:30,r:12,wide:true},{n:'spiral',x:52,y:64,s:44,r:0,wide:true},
 {n:'star',x:78,y:86,s:34,r:16,wide:true},{n:'sparkle',x:64,y:12,s:26,r:0,wide:true},{n:'plane',x:30,y:70,s:44,r:-20,wide:true},
];
// Fixed full-screen wallpaper behind the whole site; sits under content and never takes clicks.
export function Wallpaper(){
 return <div className={d.wall} aria-hidden="true">
  <svg width="0" height="0" className={d.defs}><filter id="pencil"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter></svg>
  {spots.map((s,i)=><Doodle key={i} n={s.n} size={s.s} className={`${d.spot} ${s.wide?d.wide:''}`} style={{left:`${s.x}%`,top:`${s.y}%`,rotate:`${s.r}deg`,animationDelay:`${(i*0.9)%6}s`}}/>)}
 </div>;
}
