import Link from 'next/link';
import type {ReactNode} from 'react';
import {Bell} from 'lucide-react';
import styles from './header-primitives.module.css';
// Composition supplies layout classes; identity/icon semantics are shared across contexts.
export function MaarejLogo({href='/',className='',bilingual=false}:{href?:string;className?:string;bilingual?:boolean}){return <Link href={href} className={`${styles.focus} ${className}`} aria-label="معارج — الرئيسية العامة"><span aria-hidden="true">م</span><span>معارج{bilingual&&<small>Maarej</small>}</span></Link>;}
export function ProductHeaderLink({href,className='',children,ariaLabel}:{href:string;className?:string;children:ReactNode;ariaLabel?:string}){return <Link href={href} className={`${styles.focus} ${className}`} aria-label={ariaLabel}>{children}</Link>;}
export function ProductNotifications({unread=false}:{unread?:boolean}){return <ProductHeaderLink href="/student/notifications" className="v104-header-bell" ariaLabel="الإشعارات"><Bell size={20} aria-hidden="true"/>{unread&&<span className="v104-unread-dot"/>}</ProductHeaderLink>;}
