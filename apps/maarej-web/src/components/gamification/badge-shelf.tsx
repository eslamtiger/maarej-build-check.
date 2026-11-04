"use client";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { BadgeCard } from "./badge-card";
export function BadgeShelf({badges,onOpen}:{badges:readonly {name:string;meta:string;state:string;earnedDate:string|null}[];onOpen:(name:string)=>void}){
 return <section><div className="v104-section-head"><div><small>مقتنياتك</small><h2>شاراتك</h2></div><span>اسحب للمزيد</span></div><Carousel aria-label="شارات الطالب"><CarouselContent>{badges.map(b=><CarouselItem key={b.name}><BadgeCard badge={b} onClick={()=>onOpen(b.name)}/></CarouselItem>)}</CarouselContent></Carousel></section>
}
