"use client";
import Link from "next/link";
import { loadDashboard } from "@/lib/api";
import { egp, fmtDay, fmtShort, fmtTime, num, pct } from "@/lib/format";
import { invoiceLabel, invoiceTone, Loading, PERM, Pill, useLoad } from "@/components/ui";

export default function Dashboard() {
  const { data: d, error } = useLoad(loadDashboard);
  if (!d) return <Loading error={error} />;

  const collectedPct = d.monthExpected ? Math.min(100, (d.monthRevenue / d.monthExpected) * 100) : 0;
  const rates = d.groups.map((g) => g.attendanceRate).filter((x): x is number => x !== null);
  const avgAtt = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : null;
  const students = d.groups.reduce((a, g) => a + g.members, 0);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="lbl">{fmtDay(new Date().toISOString())}</div>
          <h1>أهلاً {d.teacherName}</h1>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn" href="/groups/">مجموعة جديدة</Link>
          <Link className="btn p" href="/attendance/">سجّل الحضور</Link>
        </div>
      </div>

      <div className="grid kpis">
        <div className="card kpi"><span className="lbl">إيراد الأسبوع</span><b>{egp(d.weekRevenue)}</b><span className="lbl">من أول السبت</span></div>
        <div className="card kpi">
          <span className="lbl">إيراد الشهر</span><b>{egp(d.monthRevenue)}</b>
          <div className="bar ok" aria-hidden><i style={{ width: `${collectedPct}%` }} /></div>
          <span className="lbl">من {egp(d.monthExpected)} متوقعة</span>
        </div>
        <div className="card kpi"><span className="lbl">لسه ما اتدفعش</span><b style={{ color: d.outstanding ? "var(--bad)" : undefined }}>{egp(d.outstanding)}</b><span className="lbl">{num(d.unpaidStudents)} طالب</span></div>
        <div className="card kpi"><span className="lbl">رصيد محفظتك</span><b>{egp(d.walletBalance)}</b><Link className="lbl" href="/wallet/">فتح المحفظة</Link></div>
      </div>

      <div className="grid kpis" style={{ marginTop: 14 }}>
        <div className="card kpi"><span className="lbl">الطلاب</span><b>{num(students)}</b><span className="lbl">في {num(d.groups.length)} مجموعات</span></div>
        <div className="card kpi"><span className="lbl">متوسط الحضور</span><b>{pct(avgAtt)}</b><span className="lbl">آخر ٦٠ يوم</span></div>
        <div className="card kpi"><span className="lbl">بادجات الأسبوع</span><b>{num(d.badgesThisWeek)}</b><Link className="lbl" href="/badges/">امنح بادج</Link></div>
        <div className="card kpi"><span className="lbl">مكافآت محجوزة</span><b>{egp(d.rewardsHeldAmount)}</b><span className="lbl">{num(d.rewardsHeldCount)} مكافأة مستنية الصرف</span></div>
      </div>

      <h2 style={{ fontSize: 17, margin: "22px 0 10px" }}>مجموعاتي</h2>
      {d.groups.length === 0 ? (
        <div className="empty">لسه ما عملتش مجموعات. <Link href="/groups/">ابدأ بأول مجموعة</Link></div>
      ) : (
        <div className="grid cards">
          {d.groups.map((g, i) => (
            <Link key={g.id} href={`/groups/?id=${g.id}`} className={`card gc c${(i % 3) + 1}`} style={{ color: "inherit" }}>
              <div className="row"><b className="num" style={{ fontSize: 16 }}>{g.name}</b><Pill>{g.subject}</Pill></div>
              <div className="lbl">{[g.stage, g.place].filter(Boolean).join(" · ")}</div>
              <div className="lbl" style={{ marginTop: 6 }}>{g.scheduleText}</div>
              <div className="bar" aria-hidden><i style={{ width: `${Math.min(100, (g.members / g.capacity) * 100)}%` }} /></div>
              <div className="lbl">الطلاب {num(g.members)} / {num(g.capacity)}{g.pending ? <> — <b style={{ color: "var(--warn)" }}>{num(g.pending)} طلب انضمام</b></> : null}</div>
              <div className="stats">
                <div><b>{pct(g.attendanceRate)}</b><span className="lbl">حضور</span></div>
                <div><b>{g.avgScore === null ? "—" : num(Math.round(g.avgScore))}</b><span className="lbl">متوسط الدرجات</span></div>
                <div><b>{egp(g.weekRevenue)}</b><span className="lbl">إيراد الأسبوع</span></div>
              </div>
              <div style={{ marginTop: 10 }}>
                {g.unpaidCount ? <Pill tone="b">{num(g.unpaidCount)} لسه ما دفعوش · {egp(g.outstanding)}</Pill> : <Pill tone="o">الكل دافع</Pill>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid cols2" style={{ marginTop: 22 }}>
        <section className="card">
          <h2>الحصص الجاية</h2>
          {d.sessions.length === 0 ? <div className="empty">مفيش حصص الأسبوع الجاي. ولّدها من صفحة المجموعة.</div> : (
            <div className="list">
              {d.sessions.slice(0, 5).map((s) => (
                <div className="item" key={s.id}>
                  <div><b>{s.groupName}</b><div className="lbl">{fmtDay(s.startsAt)} · {fmtTime(s.startsAt)}{s.place ? ` · ${s.place}` : ""}</div></div>
                  <Link className="btn sm" href={`/attendance/?session=${s.id}`}>الحضور</Link>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="card">
          <h2>الواجبات والامتحانات</h2>
          {d.deadlines.length === 0 ? <div className="empty">مفيش مواعيد قريبة.</div> : (
            <div className="list">
              {d.deadlines.map((x) => (
                <div className="item" key={x.kind + x.id}>
                  <div><b>{x.title}</b><div className="lbl">{x.groupName} · {fmtShort(x.at)} {fmtTime(x.at)}</div></div>
                  <Pill tone={x.kind === "exam" ? "w" : undefined}>{x.kind === "exam" ? "امتحان" : "واجب"}</Pill>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid cols2" style={{ marginTop: 14 }}>
        <section className="card">
          <h2>مين لسه ما دفعش</h2>
          {d.unpaid.length === 0 ? <div className="empty">كل الفواتير مدفوعة.</div> : (
            <div className="scroll">
              <table className="tbl">
                <thead><tr><th>الطالب</th><th>المجموعة</th><th>المتبقي</th><th>الحالة</th></tr></thead>
                <tbody>
                  {d.unpaid.map((i) => (
                    <tr key={i.id}><td><b>{i.studentName}</b></td><td>{i.groupName}</td><td className="num">{egp(i.amount - i.paid)}</td><td><Pill tone={invoiceTone(i.status)}>{invoiceLabel(i.status)}</Pill></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ marginTop: 10 }}><Link href="/payments/">كل المدفوعات</Link></p>
        </section>
        <section className="card">
          <h2>محتاج متابعة</h2>
          {d.attention.length === 0 ? <div className="empty">مفيش حد محتاج متابعة دلوقتي.</div> : (
            <div className="list">
              {d.attention.map((a) => (
                <div className="item" key={a.studentId + a.groupName}>
                  <div><b>{a.studentName}</b> <span className="lbl">· {a.groupName}</span><div className="lbl">{a.reason}</div></div>
                  <Pill tone="b">متابعة</Pill>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid cols2" style={{ marginTop: 14 }}>
        <section className="card">
          <h2>المساعدين</h2>
          {d.assistants.length === 0 ? <div className="empty">مفيش مساعدين. <Link href="/assistants/">ضيف مساعد</Link></div> : (
            <div className="list">
              {d.assistants.map((a) => <div className="item" key={a.id}><b>{a.name}</b><span className="lbl">{a.permissions.length ? a.permissions.map((p) => PERM[p] ?? p).join("، ") : "من غير صلاحيات"}</span></div>)}
            </div>
          )}
        </section>
        <section className="card">
          <h2>آخر حركات المحفظة</h2>
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
      </div>
    </>
  );
}
