'use client';
// One search kit for teachers, centers and study spaces: search box, filter pills, choice sheets
// (single, multi, price range), sort button, map-first layout. Icons + short labels; no helper sentences.
import Link from 'next/link';
import {useEffect,useRef} from 'react';
import type {ReactNode,CSSProperties} from 'react';
import type {LucideIcon} from 'lucide-react';
import {Search,X,ChevronDown,Check,RotateCcw,Star,ArrowUpDown} from 'lucide-react';
import k from './search-kit.module.css';

type IconT=LucideIcon;
export type Choice={value:string;label:string;group?:string};

export function SearchBox({id,value,onChange,placeholder}:{id:string;value:string;onChange:(v:string)=>void;placeholder:string}){
 return <div className={k.search} role="search">
  <Search size={20} aria-hidden="true"/>
  <label htmlFor={id} className={k.srOnly}>{placeholder}</label>
  <input id={id} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoComplete="off" enterKeyHint="search"/>
  {value&&<button type="button" onClick={()=>onChange('')} aria-label="مسح البحث"><X size={17}/></button>}
 </div>;
}

// A filter pill: shows its name until something is picked, then shows the pick, filled, with an × to clear.
export function FilterPill({icon:Icon,label,value,onOpen,onClear}:{icon:IconT;label:string;value?:string;onOpen:()=>void;onClear?:()=>void}){
 const on=!!value;
 return <span className={k.pill} data-on={on}>
  <button type="button" className={k.pillMain} onClick={onOpen} aria-haspopup="dialog" aria-label={on?`${label}: ${value}`:label}>
   <Icon size={16} aria-hidden="true"/><span>{value||label}</span>{!on&&<ChevronDown size={16} aria-hidden="true" className={k.chev}/>}
  </button>
  {on&&onClear&&<button type="button" className={k.pillClear} onClick={onClear} aria-label={`إزالة ${label}`}><X size={16}/></button>}
 </span>;
}

// Rating chips (3+ and 4+). Both can be on together.
export function StarToggle({level,pressed,onToggle}:{level:string;pressed:boolean;onToggle:()=>void}){
 return <span className={k.pill} data-on={pressed}><button type="button" className={k.pillMain} aria-pressed={pressed} onClick={onToggle} aria-label={`تقييم ${level} فأكثر`}><Star size={16} aria-hidden="true" className={k.star}/><span><bdi dir="ltr">{level}+</bdi></span></button></span>;
}

export function ResetPill({onReset}:{onReset:()=>void}){
 return <button type="button" className={k.reset} onClick={onReset}><RotateCcw size={16} aria-hidden="true"/>مسح</button>;
}

function useSheet(open:boolean,onClose:()=>void){
 const box=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!open)return;
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',key);
  const prev=document.body.style.overflow;document.body.style.overflow='hidden';
  (box.current?.querySelector<HTMLElement>('[aria-pressed=true],input,button'))?.focus();
  return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=prev;};},[open,onClose]);
 return box;
}

export function Sheet({open,icon:Icon,title,onClose,children,footer}:{open:boolean;icon:IconT;title:string;onClose:()=>void;children:ReactNode;footer?:ReactNode}){
 const box=useSheet(open,onClose);
 if(!open)return null;
 return <>
  <div className={k.backdrop} onClick={onClose}/>
  <div className={k.sheet} role="dialog" aria-modal="true" aria-label={title} ref={box}>
   <span className={k.grab} aria-hidden="true"/>
   <header><span className={k.sheetIcon}><Icon size={20} aria-hidden="true"/></span><h2>{title}</h2><button type="button" onClick={onClose} aria-label="إغلاق"><X size={20}/></button></header>
   <div className={k.sheetBody}>{children}</div>
   {footer&&<footer className={k.sheetFoot}>{footer}</footer>}
  </div>
 </>;
}

const groupsOf=(choices:readonly Choice[])=>[...new Set(choices.map(c=>c.group??''))];

// Single choice: tapping applies it and closes.
export function ChoiceSheet({open,icon,title,choices,value,onPick,onClose,allLabel='الكل'}:{open:boolean;icon:IconT;title:string;choices:readonly Choice[];value:string;onPick:(c:Choice|null)=>void;onClose:()=>void;allLabel?:string}){
 const chip=(c:Choice|null)=>{const v=c?.value??'',on=v===value;return <button type="button" key={v||'all'} className={k.choice} aria-pressed={on} onClick={()=>{onPick(c);onClose();}}>{on&&<Check size={16} aria-hidden="true"/>}<span>{c?.label??allLabel}</span></button>;};
 return <Sheet open={open} icon={icon} title={title} onClose={onClose}>
  {allLabel&&<div className={k.choices}>{chip(null)}</div>}
  {groupsOf(choices).map(g=><section key={g||'_'} className={k.group}>{g&&<h3>{g}</h3>}<div className={k.choices}>{choices.filter(c=>(c.group??'')===g).map(chip)}</div></section>)}
 </Sheet>;
}

function ShowButton({count,unit,onClose,onClear,canClear}:{count:number;unit:string;onClose:()=>void;onClear:()=>void;canClear:boolean}){
 return <><button type="button" className={k.footClear} onClick={onClear} disabled={!canClear}><RotateCcw size={16} aria-hidden="true"/>مسح</button>
  <button type="button" className={k.footShow} onClick={onClose}>اعرض <b key={count}>{count}</b> {unit}</button></>;
}

// Several choices: each tap toggles; results update behind the sheet.
export function MultiSheet({open,icon,title,choices,values,onChange,onClose,count,unit}:{open:boolean;icon:IconT;title:string;choices:readonly Choice[];values:readonly string[];onChange:(v:string[])=>void;onClose:()=>void;count:number;unit:string}){
 const toggle=(v:string)=>onChange(values.includes(v)?values.filter(x=>x!==v):[...values,v]);
 return <Sheet open={open} icon={icon} title={title} onClose={onClose} footer={<ShowButton count={count} unit={unit} onClose={onClose} onClear={()=>onChange([])} canClear={values.length>0}/>}>
  {groupsOf(choices).map(g=><section key={g||'_'} className={k.group}>{g&&<h3>{g}</h3>}<div className={k.choices}>{choices.filter(c=>(c.group??'')===g).map(c=>{const on=values.includes(c.value);return <button type="button" key={c.value} className={k.choice} data-multi aria-pressed={on} onClick={()=>toggle(c.value)}><span className={k.tick} aria-hidden="true">{on&&<Check size={16}/>}</span><span>{c.label}</span></button>;})}</div></section>)}
 </Sheet>;
}

// Price range: a bar with two handles. Handles at the ends mean "no limit" on that side.
export function RangeSheet({open,icon,title,bounds,step,value,onChange,onClose,count,unit,money}:{open:boolean;icon:IconT;title:string;bounds:[number,number];step:number;value:[number,number];onChange:(v:[number,number])=>void;onClose:()=>void;count:number;unit:string;money:string}){
 const [lo,hi]=value,[min,max]=bounds,pct=(v:number)=>((v-min)/(max-min))*100;
 return <Sheet open={open} icon={icon} title={title} onClose={onClose} footer={<ShowButton count={count} unit={unit} onClose={onClose} onClear={()=>onChange([min,max])} canClear={lo>min||hi<max}/>}>
  <div className={k.rangeVals}><span><small>من</small><b><bdi>{lo}</bdi></b></span><i aria-hidden="true"/><span><small>إلى</small><b><bdi>{hi>=max?'+':''}{hi}</bdi></b></span><em>{money}</em></div>
  <div className={k.range} dir="rtl" style={{'--a':`${pct(lo)}%`,'--b':`${pct(hi)}%`} as CSSProperties}>
   <span className={k.track} aria-hidden="true"/>
   <input type="range" min={min} max={max} step={step} value={lo} aria-label="أقل سعر" onChange={e=>onChange([Math.min(Number(e.target.value),hi-step),hi])}/>
   <input type="range" min={min} max={max} step={step} value={hi} aria-label="أعلى سعر" onChange={e=>onChange([lo,Math.max(Number(e.target.value),lo+step)])}/>
  </div>
  <div className={k.rangeEnds} aria-hidden="true"><span>{min}</span><span>+{max}</span></div>
 </Sheet>;
}

// Centers | study spaces
export function Segmented({items}:{items:readonly {href:string;label:string;count:number;icon:IconT;active:boolean}[]}){
 return <nav className={k.seg} aria-label="نوع المنشأة">{items.map(({href,label,count,icon:Icon,active})=>
  <Link key={href} href={href} aria-current={active?'page':undefined}><Icon size={18} aria-hidden="true"/>{label}<b><bdi dir="ltr">{count}</bdi></b></Link>)}</nav>;
}

export function SearchTop({children}:{children:ReactNode}){return <div className={k.top}>{children}</div>;}
export function Toolbar({children}:{children:ReactNode}){return <div className={k.toolbar}><div className={k.pills}>{children}</div></div>;}

// Results head: count on one side, sort as its own button on the other.
export function ResultsHead({n,unit,sortLabel,onSort}:{n:number;unit:string;sortLabel?:string;onSort:()=>void}){
 return <div className={k.resultsHead}>
  <p className={k.count} aria-live="polite"><b key={n}>{n}</b> {unit}</p>
  <button type="button" className={k.sortBtn} data-on={!!sortLabel} onClick={onSort} aria-haspopup="dialog"><ArrowUpDown size={16} aria-hidden="true"/>{sortLabel||'الترتيب'}</button>
 </div>;
}
export function Empty({onReset}:{onReset:()=>void}){
 return <div className={k.empty}><span aria-hidden="true"><Search size={28}/></span><p>مفيش نتايج</p><button type="button" onClick={onReset}><RotateCcw size={16} aria-hidden="true"/>اعرض الكل</button></div>;
}

// Map first: on phones the map sits on top and the results follow; on desktops they sit side by side.
export function MapFirst({map,list}:{map:ReactNode;list:ReactNode}){
 return <div className={k.split}><aside className={k.mapCol} id="sec-map" aria-label="الخريطة">{map}</aside><section className={k.listCol} id="sec-results" aria-label="النتايج">{list}</section></div>;
}
