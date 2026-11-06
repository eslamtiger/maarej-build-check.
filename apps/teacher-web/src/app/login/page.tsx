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
    <div className="auth">
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>كراسة</h1>
      <p className="lbl" style={{ marginBottom: 16 }}>لوحة المدرس في معارج</p>
      <form className="card form" onSubmit={submit}>
        <div className="tabs" role="tablist">
          <button type="button" className={`tab ${mode === "in" ? "on" : ""}`} onClick={() => setMode("in")}>تسجيل دخول</button>
          <button type="button" className={`tab ${mode === "up" ? "on" : ""}`} onClick={() => setMode("up")}>حساب مدرس جديد</button>
        </div>
        {mode === "up" && (
          <>
            <label className="field">الاسم<input className="inp" required value={f.name} onChange={set("name")} autoComplete="name" /></label>
            <label className="field">رقم الموبايل<input className="inp" required inputMode="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" dir="ltr" /></label>
          </>
        )}
        <label className="field">الإيميل<input className="inp" type="email" required value={f.email} onChange={set("email")} autoComplete="email" dir="ltr" /></label>
        <label className="field">كلمة السر<input className="inp" type="password" required minLength={6} value={f.password} onChange={set("password")} autoComplete={mode === "in" ? "current-password" : "new-password"} dir="ltr" /></label>
        <button className="btn p" disabled={busy || !hasBackend}>{mode === "in" ? "دخول" : "إنشاء الحساب"}</button>
      </form>
      <p style={{ marginTop: 14, textAlign: "center" }}>
        <button className="btn" onClick={() => { setDemo(true); router.replace("/"); }}>جرّب بالبيانات التجريبية</button>
      </p>
    </div>
  );
}
