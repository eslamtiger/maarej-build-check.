'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import styles from './places.module.css';
// Returns to the exact filtered search the visitor came from; only same-section URLs are accepted.
export function BackToSearch({base,label}:{base:string;label:string}){
 const [href,setHref]=useState(base);
 useEffect(()=>{const c=new URLSearchParams(location.search).get('returnTo');if(c===base||c?.startsWith(`${base}?`))setHref(c);},[base]);
 return <Link href={href} className={styles.back}><ArrowRight size={16} aria-hidden="true"/>{label}</Link>;
}
