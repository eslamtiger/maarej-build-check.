"use client";
// One header for every page of Maarej: public pages and the student space.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Building2, ChevronDown, DoorOpen, GraduationCap, Info, LogOut, PenLine, Settings } from "lucide-react";
import { studentNotifications } from "@/data/student-records";
import { useStudentAppState } from "@/lib/student-app-state";
import { useStudentProfile } from "@/lib/student-profile";
import { MaarejMark } from "./maarej-logo";
import styles from "./site-header.module.css";

const sections = [
  { href: "/teachers", label: "المدرسين", Icon: GraduationCap },
  { href: "/centers", label: "السناتر", Icon: Building2 },
  { href: "/spaces", label: "مساحات المذاكرة", Icon: DoorOpen },
  { href: "/about", label: "عن معارج", Icon: Info },
] as const;

// Inside the student space the avatar opens a small menu; everywhere else it goes straight to the space.
const menu = [
  { href: "/student/profile", label: "تعديل ملفي", Icon: PenLine },
  { href: "/student/account", label: "الإعدادات", Icon: Settings },
] as const;

export function SiteAvatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  return <span className={styles.avatar} style={{ width: size, height: size, background: color, fontSize: size * .42 }} aria-hidden="true">{name.trim().slice(0, 1)}</span>;
}

export function SiteHeader() {
  const path = usePathname() ?? "/";
  const app = useStudentAppState();
  const profile = useStudentProfile();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const unread = app.preferences.notifications && studentNotifications.some(n => n.readState === "unread" && !app.readNotifications.includes(n.id));
  useEffect(() => { setOpen(false); }, [path]);
  const bar = useRef<HTMLElement>(null);
  // Publish the real header height so sticky bars (filters, maps) sit right under it.
  useEffect(() => {
    const el = bar.current; if (!el) return;
    const set = () => document.documentElement.style.setProperty("--site-header-h", `${Math.round(el.getBoundingClientRect().height)}px`);
    set(); const ro = new ResizeObserver(set); ro.observe(el); return () => ro.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown); document.addEventListener("touchstart", onDown); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("touchstart", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const inStudent = path.startsWith("/student");
  const isActive = (href: string) => path === href || path.startsWith(href + "/");

  return <header ref={bar} className={styles.header} dir="rtl">
    <span className={styles.accent} aria-hidden="true"/>
    <div className={styles.inner}>
      <Link href="/" className={styles.brand} aria-label="معارج، الصفحة الرئيسية"><MaarejMark size={40}/><span className={styles.word}><b>معارج</b><small>تعليمك كله في مكان واحد</small></span></Link>
      <nav className={styles.nav} aria-label="صفحات معارج">
        {sections.map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}><Icon size={17} aria-hidden="true"/>{label}</Link>)}
      </nav>
      <div className={styles.user} ref={box}>
        <Link href="/student/notifications" className={styles.bell} aria-label={unread ? "الإشعارات، فيه جديد" : "الإشعارات"} aria-current={path === "/student/notifications" ? "page" : undefined}><Bell size={20} aria-hidden="true"/>{unread && <i aria-hidden="true"/>}</Link>
        {inStudent ? <button type="button" className={styles.me} aria-haspopup="menu" aria-expanded={open} aria-controls="site-user-menu" onClick={() => setOpen(v => !v)}>
          <SiteAvatar name={profile.name} color={profile.avatarColor}/>
          <span className={styles.meName}>{profile.name.split(" ")[0]}</span>
          <ChevronDown size={16} aria-hidden="true" className={styles.chev}/>
          <span className={styles.srOnly}>حسابي: {profile.name}</span>
        </button> : <Link href="/student" className={styles.me} aria-label={`مساحتي: ${profile.name}`}>
          <SiteAvatar name={profile.name} color={profile.avatarColor}/>
          <span className={styles.meName}>مساحتي</span>
        </Link>}
        {inStudent && open && <div id="site-user-menu" className={styles.menu} role="menu" aria-label="حسابي">
          <div className={styles.card}>
            <SiteAvatar name={profile.name} color={profile.avatarColor} size={56}/>
            <div><b>{profile.name}</b><small>{profile.stage}</small>{profile.identityName && <span className={styles.identity}>{profile.identityName}{profile.identityStage ? ` · مرحلة ${profile.identityStage}` : ""}</span>}</div>
          </div>
          {menu.map(({ href, label, Icon }) => <Link key={href} href={href} role="menuitem" aria-current={path === href ? "page" : undefined}><Icon size={18} aria-hidden="true"/>{label}</Link>)}
          <a href="/" role="menuitem" className={styles.logout}><LogOut size={18} aria-hidden="true"/>الخروج من مساحة الطالب</a>
        </div>}
      </div>
    </div>
  </header>;
}
