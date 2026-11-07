"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasBackend } from "@/lib/supabase";
import { setDemo } from "@/lib/api";
import { notify } from "@/components/ui";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", email: "", password: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return notify("الموقع مش متوصّل بالداتابيز.", "err");
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      if (error) notify("الإيميل أو كلمة السر غلط.", "err");
      else { setDemo(false); router.replace("/"); }
    } else {
      const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.password, options: { data: { full_name: f.name, phone: f.phone, role: "teacher" } } });
      if (error) notify(error.message, "err");
      else if (data.session) { setDemo(false); router.replace("/"); }
      else notify("اتبعتلك إيميل تأكيد. أكّد الحساب وبعدين سجّل دخول.");
    }
    setBusy(false);
  }

  return (
    <div className="login">
      <section className="cover" aria-label="عن مدرسين معارج">
        <div className="sticker">
          <h1>مدرسين معارج</h1>
          <p>لوحة المدرس</p>
          <div className="rule"><b>المادة</b>كل مجموعاتك</div>
          <div className="rule"><b>الطلاب</b>حضور وواجبات ودرجات</div>
          <div className="rule"><b>الحساب</b>فاتورة لكل حصة</div>
        </div>
        <ul>
          <li><i />الحصص والحضور في مكان واحد</li>
          <li><i />مين دفع ومين لسه، وكل فاتورة لحصة</li>
          <li><i />بادجات ومكافآت لطلابك من رصيدك أو كاش</li>
        </ul>
      </section>
      <div className="sheet-wrap">
        <form className="sheet" onSubmit={submit}>
          <h2>{mode === "in" ? "تسجيل الدخول" : "حساب مدرس جديد"}</h2>
          <div className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={mode === "in"} className={`tab ${mode === "in" ? "on" : ""}`} onClick={() => setMode("in")}>تسجيل دخول</button>
            <button type="button" role="tab" aria-selected={mode === "up"} className={`tab ${mode === "up" ? "on" : ""}`} onClick={() => setMode("up")}>حساب مدرس جديد</button>
          </div>
          {mode === "up" && (
            <>
              <label className="field">الاسم<input className="inp" required value={f.name} onChange={set("name")} autoComplete="name" /></label>
              <label className="field">رقم الموبايل<input className="inp" required inputMode="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" dir="ltr" /></label>
            </>
          )}
          <label className="field">الإيميل<input className="inp" type="email" required value={f.email} onChange={set("email")} autoComplete="email" dir="ltr" /></label>
          <label className="field">كلمة السر<input className="inp" type="password" required minLength={6} value={f.password} onChange={set("password")} autoComplete={mode === "in" ? "current-password" : "new-password"} dir="ltr" /></label>
          <div className="actions">
            <button className="btn p" disabled={busy || !hasBackend}>{mode === "in" ? "دخول" : "إنشاء الحساب"}</button>
          </div>
          <div className="demo-link">
            <span className="lbl">عايز تشوف الشكل الأول؟</span>
            <button type="button" className="btn sm" onClick={() => { setDemo(true); router.replace("/"); }}>جرّب بالبيانات التجريبية</button>
          </div>
        </form>
      </div>
    </div>
  );
}
