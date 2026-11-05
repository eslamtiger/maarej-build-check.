'use client';
// One search kit for teachers, centers and study spaces: search box, filter pills, choice sheet,
// list/map switch. Everything is icon + short label; no helper sentences.
import Link from 'next/link';
import {useEffect,useRef} from 'react';
import type {ReactNode} from 'react';
import type {LucideIcon} from 'lucide-react';
import {Search,X,ChevronDown,Check,List,Map as MapIcon,RotateCcw,Star} from 'lucide-react';
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
   <Icon size={16} aria-hidden="true"/><span>{value||label}</span>{!on&&<ChevronDown size={15} aria-hidden="true" className={k.chev}/>}
  </button>
  {on&&onClear&&<button type="button" className={k.pillClear} onClick={onClear} aria-label={`إزالة ${label}`}><X size={14}/></button>}
 </span>;
}

export function StarToggle({pressed,onToggle}:{pressed:boolean;onToggle:()=>void}){
 return <span className={k.pill} data-on={pressed}><button type="button" className={k.pillMain} aria-pressed={pressed} onClick={onToggle} aria-label="تقييم 4 فأكثر"><Star size={15} aria-hidden="true" className={k.star}/><span><bdi dir="ltr">4+</bdi></span></button></span>;
}

export function ResetPill({onReset}:{onReset:()=>void}){
 return <button type="button" className={k.reset} onClick={onReset}><RotateCcw size={15} aria-hidden="true"/>مسح</button>;
}

// Bottom sheet on phones, centred card on larger screens. Tapping a choice applies it and closes.
export function ChoiceSheet({open,icon:Icon,title,choices,value,onPick,onClose,allLabel='الكل'}:{open:boolean;icon:IconT;title:string;choices:readonly Choice[];value:string;onPick:(c:Choice|null)=>void;onClose:()=>void;allLabel?:string}){
 const box=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!open)return;
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',key);
  const prev=document.body.style.overflow;document.body.style.overflow='hidden';
  box.current?.querySelector<HTMLButtonElement>('[aria-pressed=true]')?.focus();
  return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=prev;};},[open,onClose]);
 if(!open)return null;
 const groups=[...new Set(choices.map(c=>c.group??''))];
 const chip=(c:Choice|null)=>{const v=c?.value??'',on=v===value;return <button type="button" key={v||'all'} className={k.choice} aria-pressed={on} onClick={()=>{onPick(c);onClose();}}>{on&&<Check size={16} aria-hidden="true"/>}<span>{c?.label??allLabel}</span></button>;};
 return <>
  <div className={k.backdrop} onClick={onClose}/>
  <div className={k.sheet} role="dialog" aria-modal="true" aria-label={title} ref={box}>
   <span className={k.grab} aria-hidden="true"/>
   <header><span className={k.sheetIcon}><Icon size={20} aria-hidden="true"/></span><h2>{title}</h2><button type="button" onClick={onClose} aria-label="إغلاق"><X size={20}/></button></header>
   <div className={k.sheetBody}>
    {allLabel&&<div className={k.choices}>{chip(null)}</div>}
    {groups.map(g=><section key={g||'_'} className={k.group}>{g&&<h3>{g}</h3>}<div className={k.choices}>{choices.filter(c=>(c.group??'')===g).map(chip)}</div></section>)}
   </div>
  </div>
 </>;
}

export function ViewSwitch({view,onView}:{view:'list'|'map';onView:(v:'list'|'map')=>void}){
 return <div className={k.view} role="group" aria-label="طريقة العرض">
  <button type="button" aria-pressed={view==='list'} onClick={()=>onView('list')} aria-label="قائمة"><List size={18} aria-hidden="true"/></button>
  <button type="button" aria-pressed={view==='map'} onClick={()=>onView('map')} aria-label="خريطة"><MapIcon size={18} aria-hidden="true"/></button>
 </div>;
}

// Segmented switch between the two kinds of educational places (centers | study spaces).
export function Segmented({items}:{items:readonly {href:string;label:string;count:number;icon:IconT;active:boolean}[]}){
 return <nav className={k.seg} aria-label="نوع المنشأة">{items.map(({href,label,count,icon:Icon,active})=>
  <Link key={href} href={href} aria-current={active?'page':undefined}><Icon size={18} aria-hidden="true"/>{label}<b><bdi dir="ltr">{count}</bdi></b></Link>)}</nav>;
}

export function SearchTop({children}:{children:ReactNode}){return <div className={k.top}>{children}</div>;}
export function Toolbar({children,view,onView}:{children:ReactNode;view:'list'|'map';onView:(v:'list'|'map')=>void}){
 return <div className={k.toolbar}><div className={k.pills}>{children}</div><ViewSwitch view={view} onView={onView}/></div>;
}
export function Count({n,unit}:{n:number;unit:string}){return <p className={k.count} aria-live="polite"><b key={n}>{n}</b> {unit}</p>;}
export function Empty({onReset}:{onReset:()=>void}){
 return <div className={k.empty}><span aria-hidden="true"><Search size={28}/></span><p>مفيش نتايج</p><button type="button" onClick={onReset}><RotateCcw size={15} aria-hidden="true"/>اعرض الكل</button></div>;
}
export function Split({view,list,map}:{view:'list'|'map';list:ReactNode;map:ReactNode}){
 return <div className={k.split} data-view={view}><section className={k.listCol} aria-label="النتايج">{list}</section><aside className={k.mapCol} aria-label="الخريطة">{map}</aside></div>;
}
