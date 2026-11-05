import Link from 'next/link';
import type {ReactNode} from 'react';
import {GraduationCap,Building2,DoorOpen,UserRound} from 'lucide-react';
import styles from './marketplace.module.css';
import ui from './shell.module.css';
export type PublicSection='home'|'teachers'|'centers'|'spaces';
const sections=[{key:'teachers',href:'/teachers',label:'المدرسون',Icon:GraduationCap},{key:'centers',href:'/centers',label:'السناتر',Icon:Building2},{key:'spaces',href:'/spaces',label:'مساحات المذاكرة',Icon:DoorOpen}] as const;

// One public header for every marketplace page (home, teachers, centers, spaces and their profiles).
export function PublicMarketplaceShell({children,active='home'}:{children:ReactNode;active?:PublicSection}){
 const current=(key:string)=>key===active?'page' as const:undefined;
 return <div className={`${styles.shell} ${active==='teachers'?styles.searchShell:''}`} dir="rtl">
  <header className={ui.bar}>
   <div className={ui.inner}>
    <Link href="/" className={ui.brand} aria-label="معارج — الرئيسية"><span className={ui.mark} aria-hidden="true">م</span><span>معارج</span></Link>
    <nav className={ui.nav} aria-label="استكشاف معارج">{sections.map(({key,href,label,Icon})=><Link key={key} href={href} aria-current={current(key)}><Icon size={17} aria-hidden="true"/>{label}</Link>)}</nav>
    <Link href="/student" className={ui.student}><UserRound size={17} aria-hidden="true"/><span>مساحة الطالب</span></Link>
   </div>
  </header>
  <main className={styles.main}>{children}</main>
  <footer className={ui.footer}><div><Link href="/" className={ui.brand}><span className={ui.mark} aria-hidden="true">م</span><span>معارج</span></Link><p>مدرسين وسناتر ومساحات مذاكرة في مكان واحد.</p></div><nav aria-label="روابط">{sections.map(s=><Link key={s.key} href={s.href}>{s.label}</Link>)}<Link href="/student">مساحة الطالب</Link></nav><small>نسخة تجريبية: كل الأسماء والأسعار والتقييمات بيانات توضيحية.</small></footer>
 </div>;
}
