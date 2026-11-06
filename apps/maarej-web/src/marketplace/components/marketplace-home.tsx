import Link from 'next/link';
import {ArrowLeft,Star} from 'lucide-react';
import {Mark,Marks} from './fun';
import {PublicMarketplaceShell} from './public-shell';
import {marketplaceTeachers} from '../adapters/teachers';
import {marketplaceCenters,placePhoto} from '../adapters/places';
import h from './home.module.css';

// Home speaks to two people: the student and the parent.
// The hero is two map "doors" (teachers / centers) that lead straight to search. No listings here.
const teacherPins=[{x:22,y:30},{x:62,y:22},{x:40,y:62},{x:78,y:58}] as const;
const centerPins=[{x:28,y:26},{x:70,y:30},{x:46,y:64},{x:82,y:66}] as const;

const studentFeatures=[
 {e:'📅',title:'نسّق مواعيدك',text:'حصصك في السنتر والأونلاين في جدول واحد، من غير ورق ولا رسايل كتير.'},
 {e:'🔔',title:'متنساش حصة ولا واجب',text:'بتعرف حصتك الجاية وأقرب تسليم من أول ما تفتح مساحتك.'},
 {e:'⏱️',title:'تابع وقتك وتقدّمك',text:'حلقات بسيطة للحضور والواجبات والمهام، ودرجاتك في كل مادة.'},
 {e:'🚀',title:'رحلة بتكبر معاك',text:'هويتك بتكبر بمجهودك خطوة بخطوة، ومش بتنزل بسبب أسبوع ضعيف.'},
] as const;
const parentFeatures=[
 {e:'🛡️',title:'اطمّن على ابنك',text:'الحضور والواجبات والدرجات أول بأول، من غير ما تسأل كل يوم.'},
 {e:'🤝',title:'ثقة أكبر بينك وبين ابنك',text:'الاتنين شايفين نفس الصورة، فالكلام بقى عن المجهود مش عن الشك.'},
 {e:'🎁',title:'كافئه على المجهود',text:'مكافأة إنت بتحددها وبتمولها، ومرتبطة بالتزام واضح.'},
 {e:'⚖️',title:'اختار له صح',text:'قارن المدرسين والسناتر بالأسعار والتقييمات والمكان قبل ما تدفع.'},
] as const;

export function MarketplaceHome(){
 const teachers=marketplaceTeachers.filter(t=>t.image).slice(0,4);
 const centers=[...marketplaceCenters].sort((a,b)=>b.rating-a.rating).slice(0,4);
 return <PublicMarketplaceShell>
  <section className={h.hero} aria-labelledby="home-title">
   <div className={h.copy}>
    <Marks items={[{e:'🎓',x:3,y:4,s:'lg',a:'float'},{e:'⭐',x:90,y:3,s:'lg',a:'spin'},{e:'📚',x:4,y:93,s:'lg',a:'bob'},{e:'🚀',x:89,y:92,s:'lg',a:'float'}]}/>
    <h1 id="home-title">المدرس الصح، والسنتر الأقرب،<br/><em>ورحلة تعليم واضحة لكل طالب.</em></h1>
   </div>
   <div className={h.doors}>
    <Link href="/teachers" className={h.door} data-tone="teacher" aria-label="المدرسين">
     <span className={h.map} aria-hidden="true">
      <svg viewBox="0 0 100 60" preserveAspectRatio="none"><rect x="6" y="6" width="22" height="14" rx="3" fill="#D6EFDC"/><rect x="72" y="40" width="22" height="14" rx="3" fill="#D6EFDC"/><rect x="34" y="40" width="14" height="12" rx="3" fill="#FCE9C4"/><rect x="60" y="6" width="14" height="12" rx="3" fill="#E4E0FF"/><path d="M-2 44 C 20 38, 30 52, 52 46 S 86 36, 102 42" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round"/><path d="M-2 20 L 102 24" fill="none" stroke="#fff" strokeWidth="2.6"/><path d="M58 -2 C 52 14, 60 24, 52 34 S 46 52, 54 64" fill="none" stroke="#BFE3F2" strokeWidth="5" strokeLinecap="round"/></svg>
      <Marks items={[{e:'📚',x:10,y:78,s:'md',a:'bob'},{e:'✏️',x:90,y:14,s:'md',a:'wiggle'},{e:'💡',x:48,y:10,s:'md',a:'pulse'}]}/>
      {teachers.map((t,i)=><span key={t.id} className={h.pinFace} style={{left:`${teacherPins[i].x}%`,top:`${teacherPins[i].y}%`}}>{t.image&&<img src={t.image} alt="" loading="eager"/>}{typeof t.rating==="number"&&<b><Star size={10}/>{t.rating.toFixed(1)}</b>}</span>)}
     </span>
     <span className={h.doorBar}><span className={h.doorIcon}><Mark e="🎓" a="wiggle" s="md"/></span><span className={h.doorText}><b>المدرسين</b></span><ArrowLeft size={18} className={h.doorGo} aria-hidden="true"/></span>
    </Link>
    <Link href="/centers" className={h.door} data-tone="center" aria-label="المنشآت التعليمية">
     <span className={h.map} aria-hidden="true">
      <svg viewBox="0 0 100 60" preserveAspectRatio="none"><rect x="6" y="6" width="22" height="14" rx="3" fill="#D6EFDC"/><rect x="72" y="40" width="22" height="14" rx="3" fill="#D6EFDC"/><rect x="34" y="40" width="14" height="12" rx="3" fill="#FCE9C4"/><rect x="60" y="6" width="14" height="12" rx="3" fill="#E4E0FF"/><path d="M-2 44 C 20 38, 30 52, 52 46 S 86 36, 102 42" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round"/><path d="M-2 20 L 102 24" fill="none" stroke="#fff" strokeWidth="2.6"/><path d="M42 -2 C 48 14, 40 24, 48 34 S 54 52, 46 64" fill="none" stroke="#BFE3F2" strokeWidth="5" strokeLinecap="round"/></svg>
      <Marks items={[{e:'📍',x:12,y:76,s:'md',a:'bob'},{e:'☕',x:90,y:12,s:'md',a:'wiggle'},{e:'🌳',x:56,y:84,s:'md',a:'pulse'}]}/>
      {centers.map((c,i)=><span key={c.id} className={h.pinPhoto} style={{left:`${centerPins[i].x}%`,top:`${centerPins[i].y}%`}}><img src={placePhoto('center',c.id,300)} alt="" loading="eager"/><b>{c.area}</b></span>)}
     </span>
     <span className={h.doorBar}><span className={h.doorIcon}><Mark e="🏫" a="bob" s="md"/></span><span className={h.doorText}><b>المنشآت التعليمية</b></span><ArrowLeft size={18} className={h.doorGo} aria-hidden="true"/></span>
    </Link>
   </div>
   <Link href="/spaces" className={h.spaces}><Mark e="📖" a="bob" s="md"/><b>مساحات المذاكرة</b><ArrowLeft size={18} aria-hidden="true"/></Link>
  </section>

  <section className={h.features} aria-labelledby="features-title">
   <h2 id="features-title"><Mark e="✨" a="pulse" s="md"/> معارج معمول للطالب ولولي الأمر</h2>
   <div className={h.audiences}>
    <article className={h.audience} data-who="student" aria-labelledby="for-student">
     <header><span className={h.who}><Mark e="🧑‍🎓" a="bob" s="sm"/> للطالب</span><h3 id="for-student">يومك منظم، ومجهودك باين</h3></header>
     <ul>{studentFeatures.map(({e,title,text})=><li key={title}><span className={h.fIcon}><Mark e={e} a="bob" s="md"/></span><div><b>{title}</b><p>{text}</p></div></li>)}</ul>
     <Link href="/student" className={h.audienceGo}><Mark e="🚀" a="bob" s="sm"/>افتح مساحتي<ArrowLeft size={18} aria-hidden="true"/></Link>
    </article>
    <article className={h.audience} data-who="parent" aria-labelledby="for-parent">
     <header><span className={h.who}><Mark e="👨‍👩‍👧" a="bob" s="sm"/> لولي الأمر</span><h3 id="for-parent">متابعة هادية، وثقة أكبر</h3></header>
     <ul>{parentFeatures.map(({e,title,text})=><li key={title}><span className={h.fIcon}><Mark e={e} a="bob" s="md"/></span><div><b>{title}</b><p>{text}</p></div></li>)}</ul>
     <Link href="/about" className={h.audienceGo}><Mark e="💬" a="bob" s="sm"/>اعرف أكتر عن معارج<ArrowLeft size={18} aria-hidden="true"/></Link>
    </article>
   </div>
  </section>
 </PublicMarketplaceShell>;
}
