"use client";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { listSessions, loadSheet, markAttendance } from "@/lib/api";
import { fmtDay, fmtTime } from "@/lib/format";
import { Loading, run, useLoad } from "@/components/ui";

const OPTS = [["present", "حاضر"], ["late", "متأخر"], ["absent", "غايب"], ["excused", "بعذر"]] as const;

export default function AttendancePage() {
  return <Suspense fallback={<Loading error={null} />}><Inner /></Suspense>;
}
function Inner() {
  const id = useSearchParams().get("session");
  return id ? <Sheet id={id} /> : <Pick />;
}

function Pick() {
  const { data, error } = useLoad(listSessions);
  if (!data) return <Loading error={error} />;
  return (
    <>
      <div className="page-head"><h1>تسجيل الحضور</h1></div>
      <div className="card">
        <h2>اختار الحصة</h2>
        {data.length === 0 ? <div className="empty">مفيش حصص حواليك. ولّد الحصص من صفحة المجموعة.</div> : (
          <div className="list">
            {data.map((s) => (
              <div className="item" key={s.id}>
                <div><b>{s.groupName}</b><div className="lbl">{fmtDay(s.startsAt)} · {fmtTime(s.startsAt)}</div></div>
                <Link className="btn sm p" href={`/attendance/?session=${s.id}`}>سجّل</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Sheet({ id }: { id: string }) {
  const { data: d, error, reload } = useLoad(() => loadSheet(id));
  if (!d) return <Loading error={error} />;
  return (
    <>
      <p><Link href="/attendance/">← كل الحصص</Link></p>
      <div className="page-head"><div><h1>{d.groupName}</h1><div className="lbl">{fmtDay(d.startsAt)} · {fmtTime(d.startsAt)}</div></div></div>
      <div className="card">
        {d.rows.length === 0 ? <div className="empty">مفيش طلاب مقبولين في المجموعة دي.</div> : (
          <div className="list">
            {d.rows.map((r) => (
              <div className="item" key={r.studentId}>
                <b>{r.name}</b>
                <span className="tabs" style={{ margin: 0 }}>
                  {OPTS.map(([k, l]) => <button key={k} className={`tab ${r.status === k ? "on" : ""}`} onClick={() => run(markAttendance(id, r.studentId, k), "اتسجّل", reload)}>{l}</button>)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
