"use client";
import { useState } from "react";
import { addAssistant, loadDashboard, removeAssistant } from "@/lib/api";
import { Loading, PERM, run, useLoad } from "@/components/ui";

export default function Assistants() {
  const { data: d, error, reload } = useLoad(loadDashboard);
  const [phone, setPhone] = useState("");
  const [perms, setPerms] = useState<string[]>(["attendance"]);
  if (!d) return <Loading error={error} />;
  const toggle = (k: string) => setPerms(perms.includes(k) ? perms.filter((x) => x !== k) : [...perms, k]);
  return (
    <>
      <div className="page-head"><h1>المساعدين</h1></div>
      <div className="grid cols2">
        <section className="card">
          <h2>مساعديني</h2>
          {d.assistants.length === 0 ? <div className="empty">مفيش مساعدين لسه.</div> : (
            <div className="list">
              {d.assistants.map((a) => (
                <div className="item" key={a.id}>
                  <div><b>{a.name}</b><div className="lbl">{a.permissions.map((p) => PERM[p] ?? p).join("، ") || "من غير صلاحيات"}</div></div>
                  <button className="btn sm" onClick={() => run(removeAssistant(a.id), "اتشال", reload)}>شيل</button>
                </div>
              ))}
            </div>
          )}
        </section>
        <form className="card form" onSubmit={async (e) => { e.preventDefault(); await run(addAssistant(phone, perms), "اتضاف المساعد", () => { setPhone(""); reload(); }); }}>
          <h2>إضافة مساعد</h2>
          <p className="lbl">المساعد لازم يكون سجّل حساب كمساعد برقم الموبايل ده. المساعد ملحق بيك وصلاحياته من اللي تختاره هنا.</p>
          <label className="field">رقم موبايل المساعد<input className="inp" required inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" /></label>
          <div>{Object.entries(PERM).map(([k, l]) => <label key={k} className="chk"><input type="checkbox" checked={perms.includes(k)} onChange={() => toggle(k)} />{l}</label>)}</div>
          <div><button className="btn p">إضافة</button></div>
        </form>
      </div>
    </>
  );
}
