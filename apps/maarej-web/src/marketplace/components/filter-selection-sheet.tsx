'use client';
import {useState} from 'react';
import type {ReactNode} from 'react';
import {Drawer as DrawerPrimitive} from 'vaul';
import {DrawerPortal,DrawerOverlay} from '@/components/ui/drawer';
import {Search,Check} from 'lucide-react';
import {normalizeArabic} from '../adapters/search';
import styles from './marketplace.module.css';
export function SelectionList({values,value,label,onSelect}:{values:readonly (readonly [string,string])[];value:string;label:string;onSelect:(value:string)=>void}){
 const [query,setQuery]=useState('');
 const rows=values.filter(([,name])=>normalizeArabic(name).includes(normalizeArabic(query)));
 return <div className={styles.selectionList}>{values.length>6&&<label className={styles.selectionSearch}><Search size={18}/><input aria-label={`بحث في ${label}`} placeholder={label==='المنطقة'?'ابحث عن منطقة':label==='المادة'?'ابحث في المواد':`ابحث في ${label}`} value={query} onChange={e=>setQuery(e.target.value)}/></label>}<div role="radiogroup" aria-label={label}>{rows.map(([id,name])=><label key={id} data-selected={value===id} className={styles.selectionRow}><input type="radio" name={`teacher-selection-${label}`} className={styles.srOnly} checked={value===id} onChange={()=>onSelect(id)}/><span>{name}</span><span className={styles.selectionCheck} aria-hidden="true">{value===id&&<Check size={18}/>}</span></label>)}</div>{!rows.length&&<p className={styles.selectionEmpty}>مفيش اختيار بالاسم ده، جرّب كلمة تانية.</p>}</div>;
}

export function TeacherSelectionDrawer({children}:{children:ReactNode}){return <DrawerPortal><DrawerOverlay className={styles.drawerOverlay}/><DrawerPrimitive.Content dir="rtl" className={`v102-drawer-content ${styles.drawer}`}><div className="v102-drawer-handle"/>{children}</DrawerPrimitive.Content></DrawerPortal>;}
