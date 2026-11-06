import type {CSSProperties} from 'react';
import f from './fun.module.css';

export type Motion='float'|'bob'|'wiggle'|'pulse'|'spin';
// One emoji sticker. Pass x/y (percent) to place it inside a positioned parent.
export function Mark({e,a='float',s='md',x,y,r,delay=0,className}:{e:string;a?:Motion;s?:'sm'|'md'|'lg'|'xl';x?:number;y?:number;r?:number;delay?:number;className?:string}){
 const placed=x!==undefined&&y!==undefined;
 const style:CSSProperties={animationDelay:`${delay}s`,...(placed?{left:`${x}%`,top:`${y}%`}:{}),...(r?{rotate:`${r}deg`}:{})};
 return <span aria-hidden="true" className={`${f.mark} ${placed?f.abs:''} ${className??''}`} data-a={a} data-s={s} style={style}>{e}</span>;
}
// Scatter of stickers around a section.
export function Marks({items}:{items:readonly {e:string;a?:Motion;s?:'sm'|'md'|'lg'|'xl';x:number;y:number;r?:number}[]}){
 return <>{items.map((m,i)=><Mark key={i} {...m} delay={(i*0.7)%3}/>)}</>;
}

// Loose "sketch" facts: short words scattered like hand-drawn stickers instead of one full-width row each.
export type Scrap={emoji:string;text:string;href?:string;hl?:'indigo'|'amber'|'green'|'pink'};
const tilt=[-2.2,1.6,-1,2.4,-1.8,1.1,-2.6,1.9];
export function Scribble({items,label}:{items:readonly Scrap[];label?:string}){
 return <ul className={f.scribble} aria-label={label}>{items.map((x,i)=>{
  const style={'--r':`${tilt[i%tilt.length]}deg`,'--y':`${(i%3)*3-3}px`} as CSSProperties;
  const body=<><span aria-hidden="true" className={f.sEmo}>{x.emoji}</span><b className={f.sTxt} data-hl={x.hl??['indigo','amber','green','pink'][i%4]}>{x.text}</b></>;
  return <li key={x.text+i} style={style} className={f.scrap}>{x.href?<a href={x.href} target="_blank" rel="noopener noreferrer">{body}</a>:body}</li>;})}</ul>;
}
// A small labelled group (subjects / systems / stages) so each kind reads as its own thing.
export function Group({emoji,title,children}:{emoji:string;title:string;children:React.ReactNode}){
 return <section className={f.group}><h3><span aria-hidden="true">{emoji}</span>{title}</h3>{children}</section>;
}
