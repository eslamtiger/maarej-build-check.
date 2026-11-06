import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {Mark,Marks} from './fun';
import {Arrow} from './doodles';
import {PublicMarketplaceShell} from './public-shell';
import {marketplaceTeachers} from '../adapters/teachers';
import {marketplaceCenters,placePhoto} from '../adapters/places';
import h from './home.module.css';

// Home speaks to two people: the student and the parent.
// The hero is two map "doors" (teachers / centers) that lead straight to search. No listings here.

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
 const centers=[...marketplaceCenters].sort((a,b)=>b.rating-a.rating).slice(0,3);
 return <PublicMarketplaceShell>
  <section className={h.hero} aria-labelledby="home-title">
   <Marks items={[{e:'🎓',x:8,y:4,s:'lg',a:'float'},{e:'⭐',x:90,y:4,s:'lg',a:'spin'},{e:'✏️',x:4,y:58,s:'md',a:'wiggle'},{e:'🚀',x:95,y:56,s:'lg',a:'float'}]}/>
   <div className={h.copy}>
    <h1 id="home-title">المدرس الصح <span className={h.e}>🎯</span> والسنتر الأقرب <span className={h.e}>📍</span><br/><em>ورحلة تعليم واضحة لكل طالب</em> <span className={h.e}>🚀</span></h1>
   </div>
   <div className={h.hint} aria-hidden="true"><Mark e="👇" a="bob" s="md"/><Arrow w={80}/></div>
   <div className={h.doors}>
    <Link href="/teachers" className={h.door} data-tone="teacher" aria-label="المدرسين">
     <span className={h.faces} aria-hidden="true">{teachers.map(t=><img key={t.id} src={t.image} alt="" loading="eager"/>)}</span>
     <span className={h.doorText}><b>المدرسين</b><span className={h.count}><bdi>{marketplaceTeachers.length}</bdi> مدرس <Mark e="⭐" a="none" s="sm"/></span></span>
     <span className={h.go}><ArrowLeft size={18} aria-hidden="true"/></span>
    </Link>
    <Link href="/centers" className={h.door} data-tone="center" aria-label="المنشآت التعليمية">
     <span className={h.polas} aria-hidden="true">{centers.map(c=><img key={c.id} src={placePhoto('center',c.id,300)} alt="" loading="eager"/>)}</span>
     <span className={h.doorText}><b>المنشآت التعليمية</b><span className={h.count}><bdi>{marketplaceCenters.length}</bdi> سنتر <Mark e="🏫" a="none" s="sm"/></span></span>
     <span className={h.go}><ArrowLeft size={18} aria-hidden="true"/></span>
    </Link>
   </div>
   <Link href="/spaces" className={h.spaces}><Mark e="📖" a="none" s="md"/><b>مساحات المذاكرة</b><ArrowLeft size={18} aria-hidden="true"/></Link>
  </section>

  <section className={h.how} aria-labelledby="how-title">
   <h2 id="how-title"><Mark e="🧭" a="none" s="md"/> ازاي تبدأ؟</h2>
   <ol className={h.flow}>
    <li className={h.step}><Mark e="🔎" a="bob" s="xl" className={h.big}/><b>دوّر</b><small>مادة أو منطقة</small></li>
    <li className={h.between} aria-hidden="true"><Arrow w={70}/></li>
    <li className={h.step}><Mark e="⚖️" a="bob" s="xl" className={h.big}/><b>قارن</b><small>سعر وتقييم ومكان</small></li>
    <li className={h.between} aria-hidden="true"><Arrow w={70}/></li>
    <li className={h.step}><Mark e="🎉" a="bob" s="xl" className={h.big}/><b>احجز</b><small>وابدأ رحلتك</small></li>
   </ol>
  </section>

  <section className={h.features} aria-labelledby="features-title">
   <h2 id="features-title"><Mark e="✨" a="none" s="md"/> معارج معمول للطالب ولولي الأمر</h2>
   <div className={h.audiences}>
    <article className={h.audience} data-who="student" aria-labelledby="for-student">
     <header><span className={h.who}><Mark e="🧑‍🎓" a="none" s="sm"/> للطالب</span><h3 id="for-student">يومك منظم، ومجهودك باين</h3></header>
     <ul>{studentFeatures.map(({e,title,text})=><li key={title}><span className={h.fIcon}><Mark e={e} a="none" s="md"/></span><div><b>{title}</b><p>{text}</p></div></li>)}</ul>
     <Link href="/student" className={h.audienceGo}><Mark e="🚀" a="none" s="sm"/>افتح مساحتي<ArrowLeft size={18} aria-hidden="true"/></Link>
    </article>
    <article className={h.audience} data-who="parent" aria-labelledby="for-parent">
     <header><span className={h.who}><Mark e="👨‍👩‍👧" a="none" s="sm"/> لولي الأمر</span><h3 id="for-parent">متابعة هادية، وثقة أكبر</h3></header>
     <ul>{parentFeatures.map(({e,title,text})=><li key={title}><span className={h.fIcon}><Mark e={e} a="none" s="md"/></span><div><b>{title}</b><p>{text}</p></div></li>)}</ul>
     <Link href="/about" className={h.audienceGo}><Mark e="💬" a="none" s="sm"/>اعرف أكتر عن معارج<ArrowLeft size={18} aria-hidden="true"/></Link>
    </article>
   </div>
  </section>
 </PublicMarketplaceShell>;
}
