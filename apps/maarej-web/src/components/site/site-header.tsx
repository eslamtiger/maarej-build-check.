"use client";
// One header for every page of Maarej: public pages and the student space.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Building2, ChevronDown, DoorOpen, GraduationCap, Info, LogOut, PenLine, Route, Settings, BookOpenCheck, House } from "lucide-react";
import { studentNotifications } from "@/data/student-records";
import { useStudentAppState } from "@/lib/student-app-state";
import { useStudentProfile } from "@/lib/student-profile";
import styles from "./site-header.module.css";

const sections = [
  { href: "/teachers", label: "المدرسين", Icon: GraduationCap },
  { href: "/centers", label: "السناتر", Icon: Building2 },
  { href: "/spaces", label: "مساحات المذاكرة", Icon: DoorOpen },
  { href: "/about", label: "عن معارج", Icon: Info },
] as const;

const menu = [
  { href: "/student", label: "مساحتي", Icon: House },
  { href: "/student/learning", label: "تعلّمي", Icon: BookOpenCheck },
  { href: "/student/journey", label: "رحلتي", Icon: Route },
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
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown); document.addEventListener("touchstart", onDown); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("touchstart", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const isActive = (href: string) => path === href || path.startsWith(href + "/");

  return <header className={styles.header} dir="rtl">
    <div className={styles.inner}>
      <Link href="/" className={styles.brand} aria-label="معارج، الصفحة الرئيسية"><span className={styles.mark} aria-hidden="true">م</span><span>معارج</span></Link>
      <nav className={styles.nav} aria-label="صفحات معارج">
        {sections.map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}><Icon size={17} aria-hidden="true"/>{label}</Link>)}
      </nav>
      <div className={styles.user} ref={box}>
        <Link href="/student/notifications" className={styles.bell} aria-label={unread ? "الإشعارات، فيه جديد" : "الإشعارات"} aria-current={path === "/student/notifications" ? "page" : undefined}><Bell size={20} aria-hidden="true"/>{unread && <i aria-hidden="true"/>}</Link>
        <button type="button" className={styles.me} aria-haspopup="menu" aria-expanded={open} aria-controls="site-user-menu" onClick={() => setOpen(v => !v)}>
          <SiteAvatar name={profile.name} color={profile.avatarColor}/>
          <ChevronDown size={16} aria-hidden="true" className={styles.chev}/>
          <span className={styles.srOnly}>حسابي: {profile.name}</span>
        </button>
        {open && <div id="site-user-menu" className={styles.menu} role="menu" aria-label="حسابي">
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
