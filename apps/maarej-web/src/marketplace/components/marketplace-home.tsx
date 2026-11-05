import Link from 'next/link';
import {GraduationCap,Building2,ArrowLeft,Search,Scale,Route,DoorOpen} from 'lucide-react';
import {PublicMarketplaceShell} from './public-shell';
import h from './home.module.css';

// Home: one message and two clear doors (teachers, centers). No listings here; results live on the search pages.
export function MarketplaceHome(){
 return <PublicMarketplaceShell>
  <section className={h.hero} aria-labelledby="home-title">
   <svg className={h.steps} viewBox="0 0 320 220" aria-hidden="true" focusable="false">
    <path d="M300 200H230V150H160V100H90V50H40" fill="none" stroke="#4B3FD6" strokeOpacity=".14" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="40" cy="40" r="16" fill="#FFB53D"/>
   </svg>
   <div className={h.copy}>
    <h1 id="home-title">ابحث. قارن. اختار.<br/><em>وكمّل رحلتك في التعلم.</em></h1>
    <p>دوّر على المدرس اللي يناسبك أو السنتر الأقرب ليك، وشوف الأسعار والمواعيد والتقييمات قبل ما تقرر.</p>
   </div>
   <div className={h.doors}>
    <Link href="/teachers" className={h.door} data-tone="teacher">
     <span className={h.doorIcon}><GraduationCap size={30} aria-hidden="true"/></span>
     <span className={h.doorText}><b>ابحث عن مدرس</b><small>بالمادة والمرحلة والمنطقة</small></span>
     <ArrowLeft size={22} className={h.doorGo} aria-hidden="true"/>
    </Link>
    <Link href="/centers" className={h.door} data-tone="center">
     <span className={h.doorIcon}><Building2 size={30} aria-hidden="true"/></span>
     <span className={h.doorText}><b>ابحث عن سنتر</b><small>القاعات والتجهيزات والموقع</small></span>
     <ArrowLeft size={22} className={h.doorGo} aria-hidden="true"/>
    </Link>
   </div>
   <Link href="/spaces" className={h.spaces}><DoorOpen size={18} aria-hidden="true"/>محتاج مكان تذاكر فيه؟ شوف مساحات المذاكرة</Link>
  </section>

  <section className={h.how} aria-labelledby="how-title">
   <h2 id="how-title">في 3 خطوات</h2>
   <ol>
    <li><span className={h.num}>1</span><div><h3><Search size={18} aria-hidden="true"/>دوّر</h3><p>اكتب المادة أو المنطقة أو اسم المدرس أو السنتر.</p></div></li>
    <li><span className={h.num}>2</span><div><h3><Scale size={18} aria-hidden="true"/>قارن</h3><p>الأسعار والتجهيزات والتقييمات والموقع جنب بعض.</p></div></li>
    <li><span className={h.num}>3</span><div><h3><Route size={18} aria-hidden="true"/>كمّل رحلتك</h3><p>حصصك وواجباتك ومهامك في مساحتك، وهويتك بتكبر معاك.</p></div></li>
   </ol>
  </section>

  <section className={h.student} aria-labelledby="student-title">
   <div><h2 id="student-title">مساحتك في معارج</h2><p>كل حصصك وواجباتك وتقدمك في مكان واحد، ورحلة بتكبر فيها هويتك خطوة بخطوة.</p></div>
   <Link href="/student" className={h.studentGo}>افتح مساحتي<ArrowLeft size={18} aria-hidden="true"/></Link>
  </section>
  <p className={h.note}>نسخة تجريبية: كل الأسماء والأسعار والتقييمات بيانات توضيحية.</p>
 </PublicMarketplaceShell>;
}
