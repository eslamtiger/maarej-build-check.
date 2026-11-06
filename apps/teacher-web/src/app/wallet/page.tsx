"use client";
import { useState } from "react";
import { loadWallet, sendFunds } from "@/lib/api";
import { egp, fmtShort } from "@/lib/format";
import { Loading, run, useLoad } from "@/components/ui";

export default function WalletPage() {
  const { data: d, error, reload } = useLoad(loadWallet);
  const [to, setTo] = useState<"center" | "student">("center");
  const [f, setF] = useState({ id: "", amount: "", kind: "room_fee", note: "" });
  if (!d) return <Loading error={error} />;
  const opts = to === "center" ? d.centers : d.students.map((s) => ({ id: s.id, name: `${s.name} · ${s.group}` }));
  return (
    <>
      <div className="page-head"><h1>المحفظة</h1></div>
      <div className="grid cols2">
        <div className="card kpi"><span className="lbl">رصيدك</span><b style={{ fontSize: 32 }}>{egp(d.balance)}</b><span className="lbl">الفلوس جوه معارج بس. الدفعات اللي بتسجّلها بتدخل هنا.</span></div>
        <form className="card form" onSubmit={async (e) => {
          e.preventDefault();
          await run(sendFunds(to, f.id, Number(f.amount), f.kind, f.note), "اتحوّلت الفلوس", () => { setF({ id: "", amount: "", kind: f.kind, note: "" }); reload(); });
        }}>
          <h2>تحويل فلوس</h2>
          <div className="tabs" style={{ margin: 0 }}>
            <button type="button" className={`tab ${to === "center" ? "on" : ""}`} onClick={() => { setTo("center"); setF({ ...f, id: "", kind: "room_fee" }); }}>لسنتر</button>
            <button type="button" className={`tab ${to === "student" ? "on" : ""}`} onClick={() => { setTo("student"); setF({ ...f, id: "", kind: "transfer" }); }}>لطالب</button>
          </div>
          <label className="field">المستلم
            <select className="inp" required value={f.id} onChange={(e) => setF({ ...f, id: e.target.value })}>
              <option value="">اختار</option>
              {opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </label>
          <div className="frow">
            <label className="field">المبلغ (ج.م)<input className="inp" type="number" min={1} step="0.01" required value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></label>
            <label className="field">النوع<select className="inp" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}><option value="room_fee">إيجار قاعة</option><option value="commission">عمولة</option><option value="transfer">تحويل</option></select></label>
          </div>
          <label className="field">ملاحظة<input className="inp" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></label>
          <div><button className="btn p">تحويل</button></div>
        </form>
      </div>
      <section className="card" style={{ marginTop: 14 }}>
        <h2>الحركات</h2>
        {d.ledger.length === 0 ? <div className="empty">لسه مفيش حركات.</div> : (
          <div className="list">
            {d.ledger.map((l) => (
              <div className="item" key={l.id}>
                <div>{l.label}<div className="lbl">{fmtShort(l.at)}</div></div>
                <b className={`num ${l.amount >= 0 ? "amt-in" : "amt-out"}`}>{l.amount >= 0 ? "+" : "−"}{egp(Math.abs(l.amount))}</b>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
