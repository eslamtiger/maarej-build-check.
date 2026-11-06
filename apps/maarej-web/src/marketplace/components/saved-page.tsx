'use client';
// "المحفوظات": the teachers, centers and study spaces the visitor saved, so there is no need to search for them again.
import Link from 'next/link';
import {Bookmark} from 'lucide-react';
import {PublicMarketplaceShell} from './public-shell';
import {TeacherCard} from './teacher-card';
import {CenterCard,SpaceCard} from './place-card';
import {Mark,Marks} from './fun';
import {useSaved} from '../adapters/saved';
import {marketplaceTeachers} from '../adapters/teachers';
import {marketplaceCenters,marketplaceSpaces} from '../adapters/places';
import k from './profile-kit.module.css';

export function SavedPage(){
 const saved=useSaved();
 const teachers=saved.filter(x=>x.kind==='teacher').map(x=>marketplaceTeachers.find(t=>t.id===x.id)).filter(Boolean);
 const centers=saved.filter(x=>x.kind==='center').map(x=>marketplaceCenters.find(c=>c.id===x.id)).filter(Boolean);
 const spaces=saved.filter(x=>x.kind==='space').map(x=>marketplaceSpaces.find(c=>c.id===x.id)).filter(Boolean);
 const empty=!teachers.length&&!centers.length&&!spaces.length;
 return <PublicMarketplaceShell><div className={k.savedWrap}>
  <h1 className={k.savedTitle}><Bookmark size={26} aria-hidden="true"/>المحفوظات</h1>
  {empty?<div className={k.savedEmpty}><Marks items={[{e:'✨',x:20,y:10,s:'md',a:'pulse'},{e:'📌',x:78,y:8,s:'md',a:'bob'}]}/><Mark e="🔖" a="none" s="xl"/><p>مفيش حاجة محفوظة لسه.</p><div><Link href="/teachers">المدرسين</Link><Link href="/centers">السناتر</Link><Link href="/spaces">المساحات</Link></div></div>:<>
   {teachers.length>0&&<section><h2>🧑‍🏫 المدرسين</h2><div className={k.savedGrid}>{teachers.map(t=><TeacherCard key={t!.id} teacher={t!} returnTo="/saved"/>)}</div></section>}
   {centers.length>0&&<section><h2>🏫 السناتر</h2><div className={k.savedGrid}>{centers.map(c=><CenterCard key={c!.id} center={c!} returnTo="/saved"/>)}</div></section>}
   {spaces.length>0&&<section><h2>📚 المساحات</h2><div className={k.savedGrid}>{spaces.map(c=><SpaceCard key={c!.id} space={c!} returnTo="/saved"/>)}</div></section>}
  </>}
 </div></PublicMarketplaceShell>;
}
