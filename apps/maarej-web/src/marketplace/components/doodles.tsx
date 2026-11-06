// Pencil-style doodles for the site wallpaper and hand-drawn arrows. Decorative only (aria-hidden), no images.
import type {CSSProperties} from 'react';
import d from './doodles.module.css';

export type DoodleName='star'|'rocket'|'planet'|'plane'|'bulb'|'book'|'pencil'|'cap'|'squiggle'|'plus'|'spiral'|'sparkle'|'ladder'|'magnifier'|'atom'|'ruler'|'clock'|'flask'|'globe'|'trophy';
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
 ladder:['M30 8 L26 92','M70 8 L74 92','M28 28 H72','M27 48 H73','M26 68 H74'],
 magnifier:['M42 42 m-26 0 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0','M62 62 L90 90','M30 32 Q36 24 46 24'],
 atom:['M50 50 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0','M50 50 m-42 0 a42 16 0 1 0 84 0 a42 16 0 1 0 -84 0','M29 14 C70 30 70 70 29 86','M71 14 C30 30 30 70 71 86'],
 ruler:['M8 38 L62 8 L92 62 L38 92 Z','M22 36 L28 46','M34 29 L40 39','M46 22 L52 32','M58 62 L52 52'],
 clock:['M50 50 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0','M50 22 V50 L68 62','M50 12 V16','M88 50 H84'],
 flask:['M38 10 H62','M42 10 V40 L16 86 C14 92 18 92 22 92 H78 C82 92 86 92 84 86 L58 40 V10','M28 66 Q50 54 72 66'],
 globe:['M50 50 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0','M10 50 H90','M50 10 C30 30 30 70 50 90','M50 10 C70 30 70 70 50 90'],
 trophy:['M28 12 H72 V40 C72 58 60 66 50 66 C40 66 28 58 28 40 Z','M28 20 H12 C12 36 20 44 30 46','M72 20 H88 C88 36 80 44 70 46','M50 66 V80','M34 90 H66 L62 80 H38 Z'],
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
 {n:'star',x:6,y:9,s:58,r:-12},{n:'rocket',x:90,y:14,s:80,r:28},{n:'ladder',x:94,y:44,s:84,r:8},{n:'book',x:7,y:36,s:70,r:-8},
 {n:'pencil',x:6,y:62,s:70,r:14},{n:'atom',x:91,y:72,s:68,r:0},{n:'bulb',x:12,y:88,s:62,r:-6},{n:'magnifier',x:86,y:92,s:62,r:-12},
 {n:'planet',x:44,y:5,s:60,r:-10,wide:true},{n:'cap',x:70,y:26,s:56,r:8,wide:true},{n:'clock',x:26,y:20,s:48,r:0,wide:true},{n:'ruler',x:30,y:60,s:56,r:-14,wide:true},
 {n:'flask',x:62,y:52,s:52,r:6,wide:true},{n:'globe',x:48,y:80,s:54,r:0,wide:true},{n:'trophy',x:76,y:82,s:50,r:6,wide:true},{n:'squiggle',x:20,y:46,s:60,r:-6,wide:true},
 {n:'sparkle',x:18,y:12,s:26,r:0},{n:'plus',x:80,y:52,s:26,r:12,wide:true},{n:'spiral',x:56,y:34,s:40,r:0,wide:true},{n:'plane',x:36,y:92,s:50,r:-20,wide:true},
];
// Fixed full-screen wallpaper behind the whole site; sits under content and never takes clicks.
export function Wallpaper(){
 return <div className={d.wall} aria-hidden="true">
  <svg width="0" height="0" className={d.defs}><filter id="pencil"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter></svg>
  {spots.map((s,i)=><Doodle key={i} n={s.n} size={s.s} className={`${d.spot} ${s.wide?d.wide:''}`} style={{left:`${s.x}%`,top:`${s.y}%`,rotate:`${s.r}deg`,animationDelay:`${(i*0.9)%6}s`}}/>)}
 </div>;
}
