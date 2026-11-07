"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Award, CalendarCheck, LayoutDashboard, Receipt, UserCog, Users, Wallet } from "lucide-react";
import { isDemo, loadMe, setDemo, type Me } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Toast } from "./ui";

const NAV = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/groups/", label: "المجموعات", icon: Users },
  { href: "/attendance/", label: "الحضور", icon: CalendarCheck },
  { href: "/payments/", label: "المدفوعات", icon: Receipt },
  { href: "/badges/", label: "البادجات والمكافآت", icon: Award },
  { href: "/wallet/", label: "المحفظة", icon: Wallet },
  { href: "/assistants/", label: "المساعدين", icon: UserCog },
];

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [demo, setDemoOn] = useState(false);
  const onLogin = path.startsWith("/login");

  useEffect(() => {
    setDemoOn(isDemo());
    loadMe().then(setMe).catch(() => setMe(null));
  }, [path]);

  useEffect(() => {
    if (me === undefined) return;
    if (!me && !onLogin) router.replace("/login/");
    if (me && onLogin) router.replace("/");
  }, [me, onLogin, router]);

  if (onLogin) return <><main>{children}</main><Toast /></>;
  if (me === undefined || !me) return <div className="auth"><div className="empty">جاري التحميل…</div></div>;
  if (me.role !== "teacher" && me.role !== "assistant") {
    return <div className="auth"><div className="card"><h2>الموقع ده للمدرسين</h2><p className="lbl">حسابك مسجّل كـ«{me.role}». استخدم موقع الطالب أو ولي الأمر.</p></div></div>;
  }

  const signOut = async () => {
    await supabase?.auth.signOut();
    setDemo(false);
    setMe(null);
    router.replace("/login/");
  };

  return (
    <div className="app">
      <div className="topline" />
      <header className="top">
        <div className="top-in">
          <div className="brand"><i aria-hidden />مدرسين معارج</div>
          <nav className="nav" aria-label="التنقل">
            {NAV.map(({ href, label, icon: Icon }) => {
              const on = href === "/" ? path === "/" : path.startsWith(href);
              return <Link key={href} href={href} className={on ? "on" : ""}><Icon size={16} aria-hidden />{label}</Link>;
            })}
          </nav>
          <div className="me"><i aria-hidden>{me.name.replace(/^أ\.\s*/, "").slice(0, 1)}</i>{me.name}<button onClick={signOut}>خروج</button></div>
        </div>
      </header>
      <main className="main">
        {demo && <div className="demo">وضع تجريبي: البيانات دي عينة، ومفيش حاجة بتتحفظ.</div>}
        {children}
      </main>
      <Toast />
    </div>
  );
}
