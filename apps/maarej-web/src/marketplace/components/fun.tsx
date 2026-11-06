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
