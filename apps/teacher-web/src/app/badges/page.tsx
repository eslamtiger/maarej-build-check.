"use client";
import { useState } from "react";
import { Award, Flame, Heart, Lightbulb, Rocket, ShieldCheck, Star } from "lucide-react";
import { awardBadge, createBadge, loadBadges, releaseReward } from "@/lib/api";
import { egp, fmtShort } from "@/lib/format";
import { Loading, Pill, run, useLoad } from "@/components/ui";

const ICONS = { shield: ShieldCheck, lightbulb: Lightbulb, rocket: Rocket, award: Award, star: Star, heart: Heart, flame: Flame } as const;
type IconKey = keyof typeof ICONS;
const Ic = ({ k, size = 24 }: { k: string; size?: number }) => { const C = ICONS[k as IconKey] ?? Award; return <C size={size} aria-hidden />; };

export default function Badges() {
  const { data: d, error, reload } = useLoad(loadBadges);
  const [sel, setSel] = useState<string | null>(null);
  const [f, setF] = useState({ student: "", note: "", bonus: "", cond: "" });
  const [nb, setNb] = useState({ name: "", icon: "star", desc: "" });
  if (!d) return <Loading error={error} />;
  const badge = d.defs.find((b) => b.id === sel);

  return (
    <>
      <div className="page-head"><h1>البادجات والمكافآت</h1></div>
      <section className="card" style={{ marginBottom: 14 }}>
        <h2>بنك البادجات</h2>
        <p className="lbl sub">اختار بادج وبعدين الطالب. لو حطيت مكافأة مالية بتتخصم من محفظتك وتتحجز لحد ما تصرفها.</p>
        <div className="badge-grid">
          {d.defs.map((b) => (
            <button key={b.id} className={`badge ${sel === b.id ? "sel" : ""}`} onClick={() => setSel(b.id)} aria-pressed={sel === b.id}>
              <div className="ic"><Ic k={b.icon} /></div><b>{b.name}</b>
              <div className="lbl">{b.issuer === "system" ? "من معارج" : "بتاعتك"}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid cols2">
        <form className="card form" onSubmit={async (e) => {
          e.preventDefault();
          if (!badge) return;
          await run(awardBadge(badge.id, f.student, f.note, Number(f.bonus || 0), f.cond), "اتمنح البادج", () => { setF({ student: "", note: "", bonus: "", cond: "" }); reload(); });
        }}>
          <h2>امنح بادج{badge ? `: ${badge.name}` : ""}</h2>
          {!badge && <div className="lbl">اختار بادج من البنك فوق الأول.</div>}
          <label className="field">الطالب
            <select className="inp" required value={f.student} onChange={(e) => setF({ ...f, student: e.target.value })}>
              <option value="">اختار الطالب</option>
              {d.students.map((s) => <option key={s.id + s.group} value={s.id}>{s.name} · {s.group}</option>)}
            </select>
          </label>
          <label className="field">ملاحظة (اختياري)<input className="inp" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></label>
          <div className="frow">
            <label className="field">مكافأة مالية (ج.م)<input className="inp" type="number" min={0} step="0.01" value={f.bonus} onChange={(e) => setF({ ...f, bonus: e.target.value })} placeholder="من غير مكافأة" /></label>
            <label className="field">شرط الصرف<input className="inp" value={f.cond} onChange={(e) => setF({ ...f, cond: e.target.value })} placeholder="مثال: حضور ٩٠٪" /></label>
          </div>
          <div><button className="btn p" disabled={!badge}>منح البادج</button></div>
        </form>

        <form className="card form" onSubmit={async (e) => {
          e.preventDefault();
          await run(createBadge(nb.name, nb.icon, nb.desc), "اتضاف البادج", () => { setNb({ name: "", icon: "star", desc: "" }); reload(); });
        }}>
          <h2>بادج جديد بتاعك</h2>
          <label className="field">الاسم<input className="inp" required value={nb.name} onChange={(e) => setNb({ ...nb, name: e.target.value })} /></label>
          <label className="field">الأيقونة
            <select className="inp" value={nb.icon} onChange={(e) => setNb({ ...nb, icon: e.target.value })}>
              {(Object.keys(ICONS) as IconKey[]).map((k) => <option key={k} value={k}>{{ shield: "درع", lightbulb: "لمبة", rocket: "صاروخ", award: "ميدالية", star: "نجمة", heart: "قلب", flame: "شعلة" }[k]}</option>)}
            </select>
          </label>
          <label className="field">الوصف<input className="inp" value={nb.desc} onChange={(e) => setNb({ ...nb, desc: e.target.value })} /></label>
          <div><button className="btn">إضافة للبنك</button></div>
        </form>
      </div>

      <div className="grid cols2" style={{ marginTop: 14 }}>
        <section className="card">
          <h2>المكافآت</h2>
          {d.rewards.length === 0 ? <div className="empty">مفيش مكافآت لسه.</div> : (
            <div className="list">
              {d.rewards.map((r) => (
                <div className="item" key={r.id}>
                  <div><b>{r.student}</b> <span className="lbl">· {r.title}</span><div className="lbl">{egp(r.amount)}{r.condition ? ` · ${r.condition}` : ""}</div></div>
                  {r.status === "funded" ? <button className="btn sm p" onClick={() => run(releaseReward(r.id), "اتصرفت المكافأة", reload)}>اصرف</button> : <Pill tone={r.status === "released" ? "o" : "w"}>{r.status === "released" ? "اتصرفت" : "اتلغت"}</Pill>}
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="card">
          <h2>آخر البادجات</h2>
          {d.awards.length === 0 ? <div className="empty">لسه ما منحتش بادجات.</div> : (
            <div className="list">
              {d.awards.map((a) => <div className="item" key={a.id}><div><b>{a.student}</b><div className="lbl">{a.badge}{a.note ? ` · ${a.note}` : ""}</div></div><span className="lbl">{fmtShort(a.at)}</span></div>)}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
