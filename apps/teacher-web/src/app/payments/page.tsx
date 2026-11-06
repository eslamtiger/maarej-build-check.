"use client";
import { useState } from "react";
import { loadInvoices, recordPayment } from "@/lib/api";
import { egp, fmtShort, num } from "@/lib/format";
import { invoiceLabel, invoiceTone, Loading, Pill, run, useLoad } from "@/components/ui";
import type { InvoiceRow } from "@/lib/types";

const FILTERS = [["open", "لسه ما دفعوش"], ["paid", "دافعين"], ["all", "الكل"]] as const;

export default function Payments() {
  const { data, error, reload } = useLoad(loadInvoices);
  const [f, setF] = useState<(typeof FILTERS)[number][0]>("open");
  const [pay, setPay] = useState<{ inv: InvoiceRow; amount: string; method: string } | null>(null);
  if (!data) return <Loading error={error} />;

  const rem = (i: InvoiceRow) => i.amount - i.paid;
  const list = data.filter((i) => (f === "all" ? true : f === "paid" ? i.status === "paid" : i.status !== "paid" && i.status !== "waived"));
  const due = data.filter((i) => i.status !== "paid" && i.status !== "waived").reduce((a, i) => a + rem(i), 0);
  const got = data.reduce((a, i) => a + i.paid, 0);

  return (
    <>
      <div className="page-head"><h1>المدفوعات</h1></div>
      <div className="grid kpis" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", marginBottom: 14 }}>
        <div className="card kpi"><span className="lbl">اتحصّل</span><b>{egp(got)}</b></div>
        <div className="card kpi"><span className="lbl">لسه مستحق</span><b style={{ color: due ? "var(--bad)" : undefined }}>{egp(due)}</b></div>
        <div className="card kpi"><span className="lbl">فواتير</span><b>{num(data.length)}</b></div>
      </div>
      <div className="tabs">{FILTERS.map(([k, l]) => <button key={k} className={`tab ${f === k ? "on" : ""}`} onClick={() => setF(k)}>{l}</button>)}</div>

      {pay && (
        <form className="card form" style={{ marginBottom: 14 }} onSubmit={async (e) => {
          e.preventDefault();
          await run(recordPayment(pay.inv.id, Number(pay.amount), pay.method), "اتسجّلت الدفعة", () => { setPay(null); reload(); });
        }}>
          <h2>دفعة من {pay.inv.studentName}</h2>
          <div className="frow">
            <label className="field">المبلغ (المتبقي {egp(rem(pay.inv))})<input className="inp" type="number" min={1} max={rem(pay.inv)} step="0.01" required value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></label>
            <label className="field">الطريقة<select className="inp" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}><option value="cash">كاش</option><option value="wallet">من محفظة الطالب</option><option value="transfer">تحويل</option><option value="card">كارت</option></select></label>
          </div>
          <div style={{ display: "flex", gap: 8 }}><button className="btn p">تسجيل الدفعة</button><button type="button" className="btn" onClick={() => setPay(null)}>إلغاء</button></div>
        </form>
      )}

      <div className="card scroll">
        {list.length === 0 ? <div className="empty">مفيش فواتير هنا. ولّد فواتير الشهر من صفحة المجموعة.</div> : (
          <table className="tbl">
            <thead><tr><th>الطالب</th><th>المجموعة</th><th>الشهر</th><th>المطلوب</th><th>المدفوع</th><th>المتبقي</th><th>الاستحقاق</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id}>
                  <td><b>{i.studentName}</b></td><td>{i.groupName}</td><td>{fmtShort(i.periodStart)}</td>
                  <td className="num">{egp(i.amount)}</td><td className="num">{egp(i.paid)}</td><td className="num">{egp(rem(i))}</td>
                  <td>{i.dueDate ? fmtShort(i.dueDate) : "—"}</td><td><Pill tone={invoiceTone(i.status)}>{invoiceLabel(i.status)}</Pill></td>
                  <td>{rem(i) > 0 && i.status !== "waived" ? <button className="btn sm p" onClick={() => setPay({ inv: i, amount: String(rem(i)), method: "cash" })}>سجّل دفعة</button> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
