"use client";
import { useState } from "react";
import { Check, ChevronDown, LockKeyhole } from "lucide-react";
import { growthDomains, identityDefinitions, identityFrameworkStatus, identityIndexByName, identityStages, stageIndexByName } from "@/data/identity-framework";
import styles from "./identity-ladder.module.css";

const pending = "الشروط قيد الإعداد";

// Identity ladder: seven identities, three stages inside the current one, and the life areas they draw on.
// Rendering only; names and rules come from data/identity-framework.ts.
export function IdentityLadder({ identityName, stageName }: { identityName?: string | null; stageName?: string | null }) {
  const current = identityIndexByName(identityName);
  const stage = stageIndexByName(stageName);
  const [open, setOpen] = useState<string | null>(null);
  const proposed = identityFrameworkStatus.names === "proposed" || identityFrameworkStatus.requirements === "proposed";
  if (current < 0) return null;
  return <section className={styles.ladder} aria-labelledby="identity-ladder-heading">
    <header className={styles.head}>
      <h2 id="identity-ladder-heading">سلّم هويتك</h2>
      <p>كل هوية فيها 3 مراحل. هويتك ما بتنزلش، واللي بيتغير من أسبوع للتاني هو زخمك.</p>
    </header>
    <ol className={styles.steps}>
      {identityDefinitions.map((item, i) => {
        const state = i < current ? "done" : i === current ? "current" : "locked";
        const expanded = open === item.id;
        return <li key={item.id} data-state={state}>
          <button type="button" className={styles.row} aria-expanded={expanded} aria-controls={`identity-${item.id}`} onClick={() => setOpen(expanded ? null : item.id)}>
            <span className={styles.badge} aria-hidden="true">{state === "done" ? <Check size={18} strokeWidth={3}/> : state === "locked" ? <LockKeyhole size={16}/> : item.order}</span>
            <span className={styles.name}><b>{item.name}</b><small>{state === "done" ? "اكتسبتها" : state === "current" ? `أنت هنا${stage >= 0 ? ` · مرحلة ${identityStages[stage].name}` : ""}` : item.question}</small></span>
            <ChevronDown size={18} className={styles.chev} aria-hidden="true"/>
          </button>
          {state === "current" && <div className={styles.stages} aria-label="مراحل هويتك الحالية">{identityStages.map((s, si) => <span key={s.id} data-state={stage < 0 ? "next" : si < stage ? "done" : si === stage ? "current" : "next"}><i aria-hidden="true"/>{s.name}</span>)}</div>}
          {expanded && <div id={`identity-${item.id}`} className={styles.detail}>
            <p><strong>السؤال:</strong> {item.question}</p>
            <p><strong>بتبني فيها:</strong> {item.focus}</p>
            {state === "current" && stage >= 0 && <p><strong>مرحلتك:</strong> {identityStages[stage].meaning}</p>}
            {state !== "done" && <p className={styles.pending}>{item.requirements?.length ? item.requirements.join("، ") : pending}</p>}
          </div>}
        </li>;
      })}
    </ol>
    <div className={styles.domains} aria-labelledby="growth-domains-heading">
      <h3 id="growth-domains-heading">جوانب حياتك اللي بتبني هويتك</h3>
      <ul>{growthDomains.map(d => <li key={d.id} title={d.builds}><b>{d.name}</b><small>{d.builds}</small>{d.optional && <em>اختياري</em>}</li>)}</ul>
    </div>
    {proposed && <p className={styles.note}>الأسماء مقترحة، وشروط الانتقال بين الهويات والمراحل لسه بتتكتب.</p>}
  </section>;
}
