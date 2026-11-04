import Link from 'next/link';
import type {ReactNode} from 'react';
import {Search,Building2,DoorOpen,UserRound} from 'lucide-react';
import {MaarejLogo,ProductHeaderLink,ProductNotifications} from '@/product/components/header-primitives';
import styles from './marketplace.module.css';
export type PublicSection='home'|'teachers'|'centers'|'spaces';
const sections=[{key:'teachers',href:'/teachers',label:'المدرسون',Icon:Search},{key:'centers',href:'/centers',label:'السناتر',Icon:Building2},{key:'spaces',href:'/spaces',label:'المساحات',Icon:DoorOpen}] as const;
export function PublicMarketplaceShell({children,active='home'}:{children:ReactNode;active?:PublicSection}){
 const current=(key:string)=>key===active?'page' as const:undefined;
 return <div className={`${styles.shell} ${active==='teachers'?styles.searchShell:''}`} dir="rtl">{active==='teachers'?<><div className={styles.discoveryHeader}><header className="v104-header v108-public-header"><MaarejLogo className="v108-brand"/><div className="v108-user-actions"><ProductNotifications/><ProductHeaderLink href="/student" className={styles.discoveryIdentity} ariaLabel="تعلّمي — تجربة الطالب"><UserRound size={19} aria-hidden="true"/></ProductHeaderLink></div></header></div><nav className={styles.discoveryNav} aria-label="استكشاف معارج">{sections.map(({key,href,label,Icon})=><Link key={key} href={href} aria-current={current(key)}><Icon size={16} aria-hidden="true"/><span>{label}</span>{key==='teachers'&&<i className={styles.navHighlight} aria-hidden="true"/>}</Link>)}</nav></>:<header className={styles.header}><MaarejLogo className={styles.brand} bilingual/><nav className={styles.navigation} aria-label="استكشاف معارج">{sections.map(({key,href,label,Icon})=><Link key={key} href={href} aria-current={current(key)}><Icon size={17} aria-hidden="true"/>{label}</Link>)}</nav><ProductHeaderLink href="/student" className={styles.studentEntry}><UserRound size={18} aria-hidden="true"/><span>تعلّمي</span></ProductHeaderLink></header>}<main className={styles.main}>{children}</main><footer className={styles.publicFooter}><Link href="/">معارج</Link><span>نسخة تجريبية · كل الأسماء والأسعار بيانات توضيحية</span></footer></div>;
}
