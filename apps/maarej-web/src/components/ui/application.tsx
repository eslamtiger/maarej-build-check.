"use client";

import type { ReactNode, SelectHTMLAttributes } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Card as ShadcnCard } from "./card";
import { Button as ShadcnButton } from "./button";
import { Badge as ShadcnBadge, type BadgeTone } from "./badge";
import { Avatar as AvatarRoot, AvatarFallback } from "./avatar";
import { Skeleton as ShadcnSkeleton } from "./skeleton";

export { ShadcnCard as Card, ShadcnButton as Button, ShadcnBadge as Badge, ShadcnSkeleton as Skeleton };
export type { BadgeTone };

export function Avatar({children,className=""}:{children:ReactNode;className?:string}){
  return <AvatarRoot className={className}><AvatarFallback>{children}</AvatarFallback></AvatarRoot>;
}
export function Separator(){return <div className="v102-separator" role="separator"/>}
export function ScrollArea({children,className=""}:{children:ReactNode;className?:string}){return <div className={`v102-scroll-area ${className}`}>{children}</div>}
export function Select({className="",children,...props}:SelectHTMLAttributes<HTMLSelectElement>){return <select className={`v102-select ${className}`} {...props}>{children}</select>}
export function Accordion({title,children}:{title:string;children:ReactNode}){return <details className="v102-accordion"><summary>{title}</summary><div>{children}</div></details>}
export function Tooltip({label,children}:{label:string;children:ReactNode}){return <span className="v102-tooltip" data-tooltip={label}>{children}</span>}
export function Popover({open,children}:{open:boolean;children:ReactNode}){return open?<div className="v102-popover">{children}</div>:null}
export function Dropdown({label,children}:{label:ReactNode;children:ReactNode}){return <details className="v102-dropdown"><summary>{label}</summary><div>{children}</div></details>}
export function Dialog({open,title,children}:{open:boolean;title:string;children:ReactNode}){return open?<div className="v102-dialog-backdrop" role="presentation"><section className="v102-dialog" role="dialog" aria-modal="true" aria-label={title}>{children}</section></div>:null}

export function Calendar({days,selected,onSelect}:{days:Array<{iso:string;label:string;day:number}>;selected:string;onSelect:(iso:string)=>void}){
  const reduce=useReducedMotion();
  return <div className="v102-week" aria-label="التقويم">{days.map(d=><button data-testid={`schedule-day-${d.iso}`} type="button" className={selected===d.iso?"is-active":""} onClick={()=>onSelect(d.iso)} key={d.iso}>{selected===d.iso&&<motion.span layoutId="schedule-selected-day" className="v102-week__active" transition={reduce?{duration:0}:{duration:.22,ease:[.2,.8,.2,1]}}/>}<span className="v102-week__label">{d.label}</span><b>{d.day}</b></button>)}</div>;
}
