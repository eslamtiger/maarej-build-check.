"use client";
import { AnimatedList } from "@/components/magicui/animated-list";
import { Award, UserRound } from "lucide-react";
export function RecognitionList({items,onAll}:{items:readonly {title:string;meta:string}[];onAll:()=>void}){
 return <section><div className="v104-section-head"><div><small>تقدير حقيقي</small><h2>آخر التقدير</h2></div><button type="button" onClick={onAll} className="v104-text-action">عرض الكل</button></div><div className="v104-recognition"><AnimatedList>{items.slice(0,3).map((r,i)=><div className="v104-recognition-row" key={r.title}><span>{i===0?<Award size={18}/>:<UserRound size={18}/>}</span><div><b>{r.title}</b><small>{r.meta}</small></div></div>)}</AnimatedList></div></section>
}
