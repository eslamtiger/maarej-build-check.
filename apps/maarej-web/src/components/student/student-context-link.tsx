"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import type {ComponentProps} from "react";
import {studentDetailHref} from "@/lib/student-navigation";
export function StudentContextLink({href,onClick,...props}:Omit<ComponentProps<typeof Link>,"href">&{href:string}){
 const pathname=usePathname(),router=useRouter();
 return <Link {...props} href={studentDetailHref(href,pathname)} onClick={event=>{onClick?.(event);if(!event.defaultPrevented&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();router.push(studentDetailHref(href),{scroll:true});window.scrollTo({top:0,behavior:"instant"});}}}/>;
}
