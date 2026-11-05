import Link from 'next/link';
import type {ReactNode} from 'react';
import {SiteHeader} from '@/components/site/site-header';
import styles from './marketplace.module.css';
import ui from './shell.module.css';
export type PublicSection='home'|'teachers'|'centers'|'spaces'|'about';
const sections=[{key:'teachers',href:'/teachers',label:'المدرسين'},{key:'centers',href:'/centers',label:'السناتر'},{key:'spaces',href:'/spaces',label:'مساحات المذاكرة'},{key:'about',href:'/about',label:'عن معارج'}] as const;

// Every public page shares the site header (also used in the student space) and this footer.
export function PublicMarketplaceShell({children,active='home'}:{children:ReactNode;active?:PublicSection}){
 return <div className={`${styles.shell} ${active==='teachers'?styles.searchShell:''}`} dir="rtl">
  <SiteHeader/>
  <main className={styles.main}>{children}</main>
  <footer className={ui.footer}><div><Link href="/" className={ui.brand}><span className={ui.mark} aria-hidden="true">م</span><span>معارج</span></Link><p>مدرسين وسناتر ومساحات مذاكرة في مكان واحد.</p></div><nav aria-label="روابط">{sections.map(s=><Link key={s.key} href={s.href}>{s.label}</Link>)}<Link href="/student">مساحتي</Link></nav><small>نسخة تجريبية: كل الأسماء والأسعار والتقييمات بيانات توضيحية.</small></footer>
 </div>;
}
