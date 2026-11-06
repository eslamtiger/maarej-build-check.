"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createGroup, createExam, createHomework, addScheduleRow, loadDashboard, loadGroup, makeInvoices, makeSessions, removeScheduleRow, respondMember } from "@/lib/api";
import { DAYS, egp, num, pct } from "@/lib/format";
import { Dots, invoiceLabel, invoiceTone, Loading, Pill, run, useLoad, WeekGrid } from "@/components/ui";

const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];
const HW: Record<string, string> = { submitted: "سلّم", late: "متأخر", missing: "مش مسلّم", reviewed: "اتراجع", none: "—" };
const hwTone = (s: string): "w" | "b" | "o" | undefined => (s === "submitted" || s === "reviewed" ? "o" : s === "late" ? "w" : s === "missing" ? "b" : undefined);

export default function GroupsPage() {
  return <Suspense fallback={<Loading error={null} />}><Inner /></Suspense>;
}

function Inner() {
  const id = useSearchParams().get("id");
  return id ? <Detail id={id} /> : <List />;
}

function List() {
  const { data: d, error, reload } = useLoad(loadDashboard);
  const [open, setOpen] = useState(false);
  if (!d) return <Loading error={error} />;
  return (
    <>
      <div className="page-head">
        <h1>المجموعات والجدول</h1>
        <button className="btn p" onClick={() => setOpen(!open)}>{open ? "إلغاء" : "مجموعة جديدة"}</button>
      </div>
      {open && <NewGroup onDone={() => { setOpen(false); reload(); }} />}
      <section className="card" style={{ marginBottom: 14 }}>
        <h2>الأسبوع</h2>
        {d.groups.some((g) => g.slots.length) ? <WeekGrid groups={d.groups} /> : <div className="empty">ضيف ميعاد لأي مجموعة وهيظهر هنا.</div>}
      </section>
      {d.groups.length === 0 ? <div className="empty">لسه ما عملتش مجموعات.</div> : (
        <div className="card scroll">
          <table className="tbl">
            <thead><tr><th>المجموعة</th><th>المادة</th><th>الميعاد</th><th>الطلاب</th><th>حضور</th><th>متوسط</th><th>سعر الحصة</th><th>لسه ما دفعوش</th></tr></thead>
            <tbody>
              {d.groups.map((g) => (
                <tr key={g.id}>
                  <td><Link href={`/groups/?id=${g.id}`}><b>{g.name}</b></Link>{g.pending ? <> <Pill tone="w">{num(g.pending)} طلب</Pill></> : null}</td>
                  <td>{g.subject}</td><td>{g.scheduleText}</td><td className="num">{num(g.members)} / {num(g.capacity)}</td>
                  <td className="num">{pct(g.attendanceRate)}</td><td className="num">{g.avgScore === null ? "—" : num(Math.round(g.avgScore))}</td>
                  <td className="num">{egp(g.price)}</td><td>{g.unpaidCount ? <Pill tone="b">{num(g.unpaidCount)} · {egp(g.outstanding)}</Pill> : <Pill tone="o">الكل دافع</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function NewGroup({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ name: "", subject: "", stage: "", capacity: "20", price: "", online: false });
  const [days, setDays] = useState<number[]>([]);
  const [start, setStart] = useState("16:30");
  const [end, setEnd] = useState("18:00");
  const [busy, setBusy] = useState(false);
  const toggle = (d: number) => setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d]);
  return (
    <form className="card form" style={{ marginBottom: 14 }} onSubmit={async (e) => {
      e.preventDefault(); setBusy(true);
      await run(createGroup({ name: f.name, subject: f.subject, stage: f.stage, capacity: Number(f.capacity), price: Number(f.price), isOnline: f.online, schedule: days.map((day) => ({ day, start, end })) }), "اتعملت المجموعة", onDone);
      setBusy(false);
    }}>
      <div className="frow">
        <label className="field">اسم المجموعة<input className="inp" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="field">المادة<input className="inp" required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></label>
        <label className="field">المرحلة<input className="inp" value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })} /></label>
        <label className="field">السعة<input className="inp" type="number" min={1} required value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} /></label>
        <label className="field">سعر الحصة (ج.م)<input className="inp" type="number" min={0} step="0.01" required value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></label>
      </div>
      <div><span className="lbl">أيام المحاضرة</span><br />{WEEK_ORDER.map((d) => <label key={d} className="chk"><input type="checkbox" checked={days.includes(d)} onChange={() => toggle(d)} />{DAYS[d]}</label>)}</div>
      <div className="frow">
        <label className="field">من<input className="inp" type="time" value={start} onChange={(e) => setStart(e.target.value)} dir="ltr" /></label>
        <label className="field">إلى<input className="inp" type="time" value={end} onChange={(e) => setEnd(e.target.value)} dir="ltr" /></label>
        <label className="chk" style={{ alignSelf: "end" }}><input type="checkbox" checked={f.online} onChange={(e) => setF({ ...f, online: e.target.checked })} />أونلاين</label>
      </div>
      <div><button className="btn p" disabled={busy}>حفظ المجموعة</button></div>
    </form>
  );
}

const today = () => new Date().toISOString().slice(0, 10);
const plus = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

function Detail({ id }: { id: string }) {
  const { data: d, error, reload } = useLoad(() => loadGroup(id));
  const [sch, setSch] = useState({ day: 0, start: "16:30", end: "18:00" });
  const [gen, setGen] = useState({ from: today(), to: plus(30) });
  const [month, setMonth] = useState(today().slice(0, 7));
  const [hw, setHw] = useState({ title: "", due: "" });
  const [ex, setEx] = useState({ title: "", date: "", max: "100" });
  if (!d) return <Loading error={error} />;
  const g = d.group;
  return (
    <>
      <p><Link href="/groups/">← كل المجموعات</Link></p>
      <div className="page-head">
        <div><h1>{g.name}</h1><div className="lbl">{[g.subject, g.stage, g.place].filter(Boolean).join(" · ")} · {g.scheduleText} · {egp(g.price)} للحصة</div></div>
        <Pill>{num(g.members)} / {num(g.capacity)} طالب</Pill>
      </div>

      {d.requests.length > 0 && (
        <section className="card" style={{ marginBottom: 14 }}>
          <h2>طلبات الانضمام</h2>
          <div className="list">
            {d.requests.map((r) => (
              <div className="item" key={r.studentId}>
                <b>{r.name}</b>
                <span style={{ display: "flex", gap: 6 }}>
                  <button className="btn sm p" onClick={() => run(respondMember(id, r.studentId, "accepted"), "اتقبل", reload)}>قبول</button>
                  <button className="btn sm" onClick={() => run(respondMember(id, r.studentId, "refused"), "اترفض", reload)}>رفض</button>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card" style={{ marginBottom: 14 }}>
        <h2>الطلاب</h2>
        {d.members.length === 0 ? <div className="empty">مفيش طلاب لسه. الطلاب بيطلبوا الانضمام من موقع الطالب.</div> : (
          <div className="scroll">
            <table className="tbl">
              <thead><tr><th>الطالب</th><th>الحضور (آخر ٦ حصص)</th><th>الواجب</th><th>آخر درجة</th><th>الدفع</th></tr></thead>
              <tbody>
                {d.members.map((m) => (
                  <tr key={m.studentId}>
                    <td><b>{m.name}</b></td><td><Dots list={m.dots} /></td>
                    <td><Pill tone={hwTone(m.homework)}>{HW[m.homework]}</Pill></td><td className="num">{m.lastScore}</td>
                    <td>{m.invoice ? <><Pill tone={invoiceTone(m.invoice.status)}>{invoiceLabel(m.invoice.status)}</Pill>{m.invoice.remaining > 0 ? <span className="lbl"> {egp(m.invoice.remaining)}</span> : null}</> : <span className="lbl">مفيش فاتورة</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid cols2">
        <section className="card form">
          <h2>الميعاد والحصص</h2>
          <div className="list">
            {d.schedule.map((s) => <div className="item" key={s.id}><span>{DAYS[s.day]} · {s.start} – {s.end}</span><button className="btn sm" onClick={() => run(removeScheduleRow(s.id), "اتمسح", reload)}>مسح</button></div>)}
          </div>
          <div className="frow">
            <label className="field">اليوم<select className="inp" value={sch.day} onChange={(e) => setSch({ ...sch, day: Number(e.target.value) })}>{WEEK_ORDER.map((x) => <option key={x} value={x}>{DAYS[x]}</option>)}</select></label>
            <label className="field">من<input className="inp" type="time" value={sch.start} onChange={(e) => setSch({ ...sch, start: e.target.value })} dir="ltr" /></label>
            <label className="field">إلى<input className="inp" type="time" value={sch.end} onChange={(e) => setSch({ ...sch, end: e.target.value })} dir="ltr" /></label>
          </div>
          <div><button className="btn" onClick={() => run(addScheduleRow(id, sch.day, sch.start, sch.end), "اتضاف الميعاد", reload)}>إضافة ميعاد</button></div>
          <div className="frow">
            <label className="field">ولّد الحصص من<input className="inp" type="date" value={gen.from} onChange={(e) => setGen({ ...gen, from: e.target.value })} dir="ltr" /></label>
            <label className="field">إلى<input className="inp" type="date" value={gen.to} onChange={(e) => setGen({ ...gen, to: e.target.value })} dir="ltr" /></label>
          </div>
          <div><button className="btn p" onClick={() => run(makeSessions(id, gen.from, gen.to), "اتولّدت الحصص", reload)}>ولّد الحصص</button></div>
        </section>

        <section className="card form">
          <h2>الفواتير</h2>
          <p className="lbl">فاتورة كل طالب = سعر الحصة × عدد حصص الشهر (من غير الملغية).</p>
          <label className="field">الشهر<input className="inp" type="month" value={month} onChange={(e) => setMonth(e.target.value)} dir="ltr" /></label>
          <div><button className="btn p" onClick={() => run(makeInvoices(id, `${month}-01`), "اتولّدت الفواتير", reload)}>ولّد فواتير الشهر</button></div>
        </section>

        <section className="card form">
          <h2>واجب جديد</h2>
          <label className="field">العنوان<input className="inp" value={hw.title} onChange={(e) => setHw({ ...hw, title: e.target.value })} /></label>
          <label className="field">آخر ميعاد<input className="inp" type="datetime-local" value={hw.due} onChange={(e) => setHw({ ...hw, due: e.target.value })} dir="ltr" /></label>
          <div><button className="btn p" disabled={!hw.title || !hw.due} onClick={() => run(createHomework(id, hw.title, hw.due), "اتضاف الواجب", () => { setHw({ title: "", due: "" }); reload(); })}>إضافة الواجب</button></div>
        </section>

        <section className="card form">
          <h2>امتحان جديد</h2>
          <label className="field">العنوان<input className="inp" value={ex.title} onChange={(e) => setEx({ ...ex, title: e.target.value })} /></label>
          <div className="frow">
            <label className="field">الميعاد<input className="inp" type="datetime-local" value={ex.date} onChange={(e) => setEx({ ...ex, date: e.target.value })} dir="ltr" /></label>
            <label className="field">الدرجة النهائية<input className="inp" type="number" min={1} value={ex.max} onChange={(e) => setEx({ ...ex, max: e.target.value })} /></label>
          </div>
          <div><button className="btn p" disabled={!ex.title || !ex.date} onClick={() => run(createExam(id, ex.title, ex.date, Number(ex.max)), "اتضاف الامتحان", () => { setEx({ title: "", date: "", max: "100" }); reload(); })}>إضافة الامتحان</button></div>
        </section>
      </div>
    </>
  );
}
