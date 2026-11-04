"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
export function StudentRouteRedirect({target}:{target:string}){const router=useRouter();useEffect(()=>{router.replace(target+location.search+location.hash);},[router,target]);return <Link href={target}>فتح الصفحة</Link>;}
