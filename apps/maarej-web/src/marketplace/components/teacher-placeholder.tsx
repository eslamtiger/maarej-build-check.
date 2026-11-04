'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {BookOpen} from 'lucide-react';
import type {TeacherSearchDTO} from '../types/teacher';
import {PublicMarketplaceShell} from './public-shell';
import {TeacherPortrait} from './teacher-card';
import styles from './marketplace.module.css';
export function PublicTeacherPlaceholder({teacher:t}:{teacher:Pick<TeacherSearchDTO,'id'|'name'> & Partial<Pick<TeacherSearchDTO,'subjects'|'image'>>}){
 const [back,setBack]=useState('/teachers');
 useEffect(()=>{const candidate=new URLSearchParams(location.search).get('returnTo');if(candidate==='/teachers'||candidate?.startsWith('/teachers?'))setBack(candidate);},[]);
 return <PublicMarketplaceShell active="teachers"><div className={styles.profilePlaceholder}><Link href={back} className={styles.backLink}>العودة للبحث</Link><div className={styles.placeholderIdentity}><TeacherPortrait teacher={t} className={styles.portrait}/><div><h1>{t.name}</h1><p>{t.subjects?.join(' · ')}</p></div></div><BookOpen size={30} aria-hidden="true"/><h2>ملف المدرس في المرحلة القادمة</h2><p>تم تجهيز مسار الملف. تفاصيل المدرس والانضمام ستُدمج في المرحلة التالية.</p><small>بيانات مدرس تجريبية · لا يوجد حجز أو دفع في هذه المرحلة.</small></div></PublicMarketplaceShell>;
}
