'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {Search,Building2,DoorOpen,GraduationCap,MapPin,Star,ArrowLeft,ListChecks,Scale,CalendarClock,ShieldCheck} from 'lucide-react';
import {PublicMarketplaceShell} from './public-shell';
import {marketplaceTeachers} from '../adapters/teachers';
import {marketplaceCenters,marketplaceSpaces,placePhoto} from '../adapters/places';
import {CenterCard,SpaceCard} from './place-card';
import {TeacherCard,TeacherPortrait} from './teacher-card';
import d from './discover.module.css';

const tabs=[
 {key:'teachers',label:'مدرس',Icon:GraduationCap,action:'/teachers',placeholder:'مادة، اسم مدرس أو منطقة'},
 {key:'centers',label:'سنتر',Icon:Building2,action:'/centers',placeholder:'اسم السنتر أو المنطقة'},
 {key:'spaces',label:'مساحة مذاكرة',Icon:DoorOpen,action:'/spaces',placeholder:'اسم المساحة أو المنطقة'},
] as const;

const top=<T extends {rating?:number}>(rows:readonly T[],n:number)=>[...rows].sort((a,b)=>(b.rating??0)-(a.rating??0)).slice(0,n);

export function MarketplaceHome(){
 const [tab,setTab]=useState<(typeof tabs)[number]['key']>('teachers');
 const current=tabs.find(x=>x.key===tab)!;
 const bestCenters=useMemo(()=>top(marketplaceCenters,4),[]);
 const bestSpaces=useMemo(()=>top(marketplaceSpaces,4),[]);
 const bestTeachers=useMemo(()=>top(marketplaceTeachers,4),[]);
 const subjects=useMemo(()=>{const n=new Map<string,number>();for(const t of marketplaceTeachers)for(const s of t.subjects)n.set(s,(n.get(s)??0)+1);return [...n.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([s])=>s);},[]);
 const subjectsAll=useMemo(()=>{const n=new Map<string,number>();for(const t of marketplaceTeachers)for(const x of t.subjects)n.set(x,(n.get(x)??0)+1);return [...n.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([x])=>x);},[]);
 const heroTeacher=marketplaceTeachers.find(t=>t.image)??marketplaceTeachers[0];
 return <PublicMarketplaceShell>
  <section className={d.hero}>
   <div className={d.heroText}>
        <h1>ابحث. قارن. اختار.<br/><em>كل تعليمك في مكان واحد.</em></h1>
    <p>مدرّس مناسب، سنتر قريب، أو مساحة هادية تذاكر فيها. شوف الأسعار والتقييمات والموقع قبل ما تقرر.</p>
    <div className={d.heroSearch}>
     <div className={d.tabs} role="tablist" aria-label="نوع البحث">{tabs.map(({key,label,Icon})=><button key={key} type="button" role="tab" aria-selected={tab===key} onClick={()=>setTab(key)}><Icon size={16} aria-hidden="true"/>{label}</button>)}</div>
     <form action={current.action} className={d.heroForm}>
      <label className={d.srOnly} htmlFor="home-search">{current.placeholder}</label>
      <Search size={20} aria-hidden="true"/><input id="home-search" name="q" placeholder={current.placeholder} autoComplete="off"/><button type="submit">ابحث</button>
     </form>
    </div>
    <div className={d.popular}><span>الأكتر بحثًا:</span>{subjects.slice(0,2).map(s=><Link key={s} href={`/teachers?q=${encodeURIComponent(s)}`}>{s}</Link>)}<Link href="/centers?area=%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D8%AF%D9%8A">سناتر المعادي</Link><Link href="/spaces?governorate=%D8%A7%D9%84%D8%AC%D9%8A%D8%B2%D8%A9">مساحات الجيزة</Link></div>
   </div>
   <div className={d.collage} aria-hidden="true">
    <figure className={d.cPhotoA}><img src={placePhoto('center',bestCenters[0].id)} alt="" loading="eager"/><figcaption><Building2 size={14}/>{bestCenters[0].name}<span><Star size={12}/><bdi>{bestCenters[0].rating.toFixed(1)}</bdi></span></figcaption></figure>
    <figure className={d.cPhotoB}><img src={placePhoto('space',bestSpaces[0].id)} alt="" loading="eager"/><figcaption><DoorOpen size={14}/>{bestSpaces[0].name}</figcaption></figure>
    <div className={d.cTeacher}><TeacherPortrait teacher={heroTeacher} className={d.cTeacherImg}/><div><strong>{heroTeacher.name}</strong><small>{heroTeacher.subjects[0]}</small></div></div>
    <span className={d.cChip}><MapPin size={14}/>على الخريطة</span>
   </div>
  </section>

  <section className={d.paths} aria-label="مسارات الاستكشاف">
   <Link href="/teachers" className={d.path}><span className={d.pathIcon}><GraduationCap size={22} aria-hidden="true"/></span><h2>مدرسين</h2><p>{marketplaceTeachers.length} مدرس بالمواد والمراحل والمناطق وأسعار الحصص.</p><span className={d.pathGo}>استكشف<ArrowLeft size={16} aria-hidden="true"/></span></Link>
   <Link href="/centers" className={d.path}><span className={d.pathIcon}><Building2 size={22} aria-hidden="true"/></span><h2>سناتر</h2><p>{marketplaceCenters.length} سنتر بقاعاتها وسعتها وتجهيزاتها وسعر الساعة.</p><span className={d.pathGo}>استكشف<ArrowLeft size={16} aria-hidden="true"/></span></Link>
   <Link href="/spaces" className={d.path}><span className={d.pathIcon}><DoorOpen size={22} aria-hidden="true"/></span><h2>مساحات مذاكرة</h2><p>{marketplaceSpaces.length} مساحة: مكتبات، غرف دراسة وقاعات فرق.</p><span className={d.pathGo}>استكشف<ArrowLeft size={16} aria-hidden="true"/></span></Link>
  </section>

  <section className={d.subjects} aria-labelledby="subjects-title"><h2 id="subjects-title">ابدأ من المادة</h2><div>{subjectsAll.map(x=><Link key={x} href={`/teachers?q=${encodeURIComponent(x)}`}>{x}</Link>)}</div></section>

  <section className={d.band} aria-labelledby="best-centers"><header><h2 id="best-centers">سناتر بتقييم عالي</h2><Link href="/centers?sort=rating">كل السناتر<ArrowLeft size={15} aria-hidden="true"/></Link></header><div className={d.cards}>{bestCenters.map(c=><CenterCard key={c.id} center={c} returnTo="/centers"/>)}</div></section>

  <section className={d.band} aria-labelledby="best-teachers"><header><h2 id="best-teachers">مدرسين مميزين</h2><Link href="/teachers">كل المدرسين<ArrowLeft size={15} aria-hidden="true"/></Link></header><div className={d.cards}>{bestTeachers.map(t=><TeacherCard key={t.id} teacher={t} returnTo="/" idPrefix="home"/>)}</div></section>

  <section className={d.band} aria-labelledby="best-spaces"><header><h2 id="best-spaces">مساحات مذاكرة</h2><Link href="/spaces?sort=rating">كل المساحات<ArrowLeft size={15} aria-hidden="true"/></Link></header><div className={d.cards}>{bestSpaces.map(s=><SpaceCard key={s.id} space={s} returnTo="/spaces"/>)}</div></section>

  <section className={d.how} aria-labelledby="how-title"><h2 id="how-title">3 خطوات بدل عشر مكالمات</h2>
   <ol>
    <li><ListChecks size={22} aria-hidden="true"/><h3>حدّد اللي محتاجه</h3><p>اختار المادة أو المنطقة أو السعة اللي تناسبك.</p></li>
    <li><Scale size={22} aria-hidden="true"/><h3>قارن بوضوح</h3><p>الأسعار والتجهيزات والتقييمات والموقع في مكان واحد.</p></li>
    <li><CalendarClock size={22} aria-hidden="true"/><h3>احجز لما يتفعّل</h3><p>الحجز المباشر هيتفعّل في المرحلة الجاية. دلوقتي تقدر تقارن وتحفظ اختياراتك.</p></li>
   </ol>
  </section>

  <section className={d.providers}><div><ShieldCheck size={26} aria-hidden="true"/><h2>عندك سنتر أو مساحة أو بتدرّس؟</h2><p>إضافة الأنشطة على معارج هتتفتح قريبًا.</p></div><span className={d.soon}>قريبًا</span></section>
  <p className={d.demoNote}>كل الأسماء والأسعار والتقييمات في المعاينة دي بيانات توضيحية.</p>
 </PublicMarketplaceShell>;
}
