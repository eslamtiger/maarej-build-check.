"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpenCheck, Grid3X3 } from "lucide-react";
import { MaarejBottomNav } from "@maarej/ui";
import { experienceConfig, type ExperienceKey } from "@/config/experiences";

export function ExperienceShell({ experience, active = "home", children }: { experience: ExperienceKey; active?: string; children: ReactNode }) {
  const config = experienceConfig[experience];
  return <div className="experience-root" dir="rtl">
    <aside className="desktop-sidebar">
      <Link href="/" className="brand-lockup"><span className="brand-mark"><BookOpenCheck size={22}/></span><span><strong>معارج</strong><small>Maarej New Project</small></span></Link>
      <div className="experience-chip"><Grid3X3 size={16}/>{config.label}</div>
      <nav aria-label={config.label}>
        {config.nav.map(item => <Link key={item.id} href={item.href} className={item.id === active ? "is-active" : ""}><item.icon size={20}/><span>{item.label}</span></Link>)}
      </nav>
    </aside>
    <main className="experience-main"><div className="experience-content">{children}</div></main>
    <MaarejBottomNav items={config.nav} activeId={active} />
  </div>;
}
