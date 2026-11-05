import Link from 'next/link';
import {GraduationCap,Building2,ArrowLeft,CalendarClock,BellRing,Timer,Route,ShieldCheck,HeartHandshake,Gift,Scale,DoorOpen,Star} from 'lucide-react';
import {PublicMarketplaceShell} from './public-shell';
import {marketplaceTeachers} from '../adapters/teachers';
import {marketplaceCenters,placePhoto} from '../adapters/places';
import h from './home.module.css';

// Home speaks to two people: the student and the parent.
// The hero is two map "doors" (teachers / centers) that lead straight to search. No listings here.
const teacherPins=[{x:22,y:30},{x:62,y:22},{x:40,y:62},{x:78,y:58}] as const;
const centerPins=[{x:28,y:26},{x:70,y:30},{x:46,y:64},{x:82,y:66}] as const;

const studentFeatures=[
 {Icon:CalendarClock,title:'نسّق مواعيدك',text:'حصصك في السنتر والأونلاين في جدول واحد، من غير ورق ولا رسايل كتير.'},
 {Icon:BellRing,title:'متنساش حصة ولا واجب',text:'بتعرف حصتك الجاية وأقرب تسليم من أول ما تفتح مساحتك.'},
 {Icon:Timer,title:'تابع وقتك وتقدّمك',text:'حلقات بسيطة للحضور والواجبات والمهام، ودرجاتك في كل مادة.'},
 {Icon:Route,title:'رحلة بتكبر معاك',text:'هويتك بتكبر بمجهودك خطوة بخطوة، ومش بتنزل بسبب أسبوع ضعيف.'},
] as const;
const parentFeatures=[
 {Icon:ShieldCheck,title:'اطمّن على ابنك',text:'الحضور والواجبات والدرجات أول بأول، من غير ما تسأل كل يوم.'},
 {Icon:HeartHandshake,title:'ثقة أكبر بينك وبين ابنك',text:'الاتنين شايفين نفس الصورة، فالكلام بقى عن المجهود مش عن الشك.'},
 {Icon:Gift,title:'كافئه على المجهود',text:'مكافأة إنت بتحددها وبتمولها، ومرتبطة بالتزام واضح.'},
 {Icon:Scale,title:'اختار له صح',text:'قارن المدرسين والسناتر بالأسعار والتقييمات والمكان قبل ما تدفع.'},
] as const;

export function MarketplaceHome(){
 const teachers=marketplaceTeachers.filter(t=>t.image).slice(0,4);
 const centers=[...marketplaceCenters].sort((a,b)=>b.rating-a.rating).slice(0,4);
 return <PublicMarketplaceShell>
  <section className={h.hero} aria-labelledby="home-title">
   <div className={h.copy}>
    <h1 id="home-title">المدرس الصح، والسنتر الأقرب،<br/><em>ورحلة تعليم واضحة للطالب وأهله.</em></h1>
    <p>ابدأ من هنا: اختار تدوّر على مدرس ولا على سنتر، وشوف مين قريب منك على الخريطة.</p>
   </div>
   <div className={h.doors}>
    <Link href="/teachers" className={h.door} data-tone="teacher" aria-label="ابحث عن مدرس على الخريطة">
     <span className={h.map} aria-hidden="true">
      <svg viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M58 -2 C 52 14, 60 24, 52 34 S 46 52, 54 64" fill="none" stroke="#BFE3F2" strokeWidth="5" strokeLinecap="round"/></svg>
      {teachers.map((t,i)=><span key={t.id} className={h.pinFace} style={{left:`${teacherPins[i].x}%`,top:`${teacherPins[i].y}%`}}>{t.image&&<img src={t.image} alt="" loading="eager"/>}{typeof t.rating==="number"&&<b><Star size={10}/>{t.rating.toFixed(1)}</b>}</span>)}
     </span>
     <span className={h.doorBar}><span className={h.doorIcon}><GraduationCap size={24} aria-hidden="true"/></span><span className={h.doorText}><b>ابحث عن مدرس</b><small>بالمادة والمرحلة والمنطقة</small></span><ArrowLeft size={22} className={h.doorGo} aria-hidden="true"/></span>
    </Link>
    <Link href="/centers" className={h.door} data-tone="center" aria-label="ابحث عن سنتر على الخريطة">
     <span className={h.map} aria-hidden="true">
      <svg viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M42 -2 C 48 14, 40 24, 48 34 S 54 52, 46 64" fill="none" stroke="#BFE3F2" strokeWidth="5" strokeLinecap="round"/></svg>
      {centers.map((c,i)=><span key={c.id} className={h.pinPhoto} style={{left:`${centerPins[i].x}%`,top:`${centerPins[i].y}%`}}><img src={placePhoto('center',c.id)} alt="" loading="eager"/><b>{c.area}</b></span>)}
     </span>
     <span className={h.doorBar}><span className={h.doorIcon}><Building2 size={24} aria-hidden="true"/></span><span className={h.doorText}><b>ابحث عن سنتر</b><small>القاعات والتجهيزات والموقع</small></span><ArrowLeft size={22} className={h.doorGo} aria-hidden="true"/></span>
    </Link>
   </div>
   <Link href="/spaces" className={h.spaces}><DoorOpen size={18} aria-hidden="true"/>محتاج مكان تذاكر فيه؟ شوف مساحات المذاكرة</Link>
  </section>

  <section className={h.features} aria-labelledby="features-title">
   <h2 id="features-title">معارج معمول للطالب ولأهله</h2>
   <div className={h.audiences}>
    <article className={h.audience} data-who="student" aria-labelledby="for-student">
     <header><span className={h.who}>للطالب</span><h3 id="for-student">يومك منظم، ومجهودك باين</h3></header>
     <ul>{studentFeatures.map(({Icon,title,text})=><li key={title}><span className={h.fIcon}><Icon size={20} aria-hidden="true"/></span><div><b>{title}</b><p>{text}</p></div></li>)}</ul>
     <Link href="/student" className={h.audienceGo}>افتح مساحتي<ArrowLeft size={18} aria-hidden="true"/></Link>
    </article>
    <article className={h.audience} data-who="parent" aria-labelledby="for-parent">
     <header><span className={h.who}>لولي الأمر</span><h3 id="for-parent">متابعة هادية، وثقة أكبر</h3></header>
     <ul>{parentFeatures.map(({Icon,title,text})=><li key={title}><span className={h.fIcon}><Icon size={20} aria-hidden="true"/></span><div><b>{title}</b><p>{text}</p></div></li>)}</ul>
     <Link href="/about" className={h.audienceGo}>اعرف أكتر عن معارج<ArrowLeft size={18} aria-hidden="true"/></Link>
    </article>
   </div>
  </section>
  <p className={h.note}>نسخة تجريبية: كل الأسماء والأسعار والتقييمات بيانات توضيحية.</p>
 </PublicMarketplaceShell>;
}
