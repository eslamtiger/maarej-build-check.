import Link from 'next/link';
import type {ReactNode} from 'react';
import {SiteHeader} from '@/components/site/site-header';
import {MaarejMark} from '@/components/site/maarej-logo';
import {Wallpaper} from './doodles';
import styles from './marketplace.module.css';
import ui from './shell.module.css';
export type PublicSection='home'|'teachers'|'centers'|'spaces'|'about';
// Footer: only links that work today.
const footerCols=[
 {title:'اكتشف',links:[{href:'/teachers',label:'المدرسين',emoji:'🧑‍🏫'},{href:'/centers',label:'السناتر',emoji:'🏫'},{href:'/spaces',label:'مساحات المذاكرة',emoji:'📚'}]},
 {title:'مساحتي',links:[{href:'/student',label:'الرئيسية',emoji:'🏠'},{href:'/student/schedule',label:'جدولي',emoji:'🗓️'},{href:'/student/journey',label:'رحلتي',emoji:'🧗'},{href:'/student/performance',label:'أدائي',emoji:'📈'}]},
 {title:'معارج',links:[{href:'/about',label:'عن معارج',emoji:'💡'},{href:'/',label:'الصفحة الرئيسية',emoji:'✨'}]},
] as const;

// Every public page shares the site header (also used in the student space) and this footer.
export function PublicMarketplaceShell({children,active='home'}:{children:ReactNode;active?:PublicSection}){
 return <div className={styles.shell} dir="rtl" style={{background:'transparent',position:'relative'}}>
  <Wallpaper/>
  <div style={{position:'relative',zIndex:1}}>
  <SiteHeader/>
  <main className={styles.main}>{children}</main>
  <footer className={ui.footer}>
   <div className={ui.footInner}>
    <div className={ui.footBrand}><Link href="/" className={ui.brand} aria-label="معارج، الصفحة الرئيسية"><MaarejMark size={44}/><b>معارج</b></Link><p>المدرس الصح، والسنتر الأقرب، ورحلة تعليم واضحة لكل طالب.</p></div>
    {footerCols.map(col=><nav key={col.title} className={ui.footCol} aria-label={col.title}><h2>{col.title}</h2><ul>{col.links.map(l=><li key={l.href}><Link href={l.href}><span aria-hidden="true">{l.emoji}</span>{l.label}</Link></li>)}</ul></nav>)}
   </div>
   <div className={ui.footBottom}><span>© {new Date().getFullYear()} معارج</span><small>نسخة تجريبية: كل الأسماء والأسعار والتقييمات بيانات توضيحية.</small></div>
  </footer>
  </div>
 </div>;
}
