"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { StudentV101Shell } from "../StudentV101Shell";
import { StudentBackButton } from "../student-record-details";
import { SiteAvatar } from "@/components/site/site-header";
import { avatarColors, saveStudentProfile, studentStages, useStudentProfile } from "@/lib/student-profile";
import styles from "./profile-editor.module.css";

// Profile: what the header menu opens. Edits are saved on this device only (demo, no accounts yet).
export function ProfileEditor() {
  const profile = useStudentProfile();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setForm(profile); }, [profile.name, profile.stage, profile.city, profile.school, profile.bio, profile.avatarColor]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => { setSaved(false); setForm(f => ({ ...f, [k]: e.target.value })); };
  const valid = form.name.trim().length >= 2;
  return <StudentV101Shell active="account">
    <StudentBackButton fallback="/student"/>
    <section className={styles.hero}>
      <SiteAvatar name={form.name || profile.name} color={form.avatarColor} size={84}/>
      <div><h1>{form.name || profile.name}</h1><p>{form.stage}</p>{profile.identityName && <span className={styles.identity}>{profile.identityName}{profile.identityStage ? ` · مرحلة ${profile.identityStage}` : ""}</span>}</div>
    </section>
    <form className={styles.form} onSubmit={e => { e.preventDefault(); if (!valid) return; saveStudentProfile({ name: form.name.trim(), stage: form.stage, city: form.city.trim(), school: form.school.trim(), bio: form.bio.trim(), avatarColor: form.avatarColor }); setSaved(true); }}>
      <h2>بياناتك</h2>
      <fieldset className={styles.colors}><legend>لون صورتك</legend>{avatarColors.map(c => <label key={c} style={{ background: c }}><input type="radio" name="avatar" value={c} checked={form.avatarColor === c} onChange={set("avatarColor")}/>{form.avatarColor === c && <Check size={18} aria-hidden="true"/>}<span className={styles.srOnly}>{c}</span></label>)}</fieldset>
      <label>الاسم<input value={form.name} onChange={set("name")} autoComplete="name" required minLength={2}/></label>
      <label>المرحلة الدراسية<select value={form.stage} onChange={set("stage")}>{studentStages.map(s => <option key={s}>{s}</option>)}</select></label>
      <label>المدينة<input value={form.city} onChange={set("city")} placeholder="مثلًا: القاهرة"/></label>
      <label>المدرسة<input value={form.school} onChange={set("school")} placeholder="اسم مدرستك"/></label>
      <label>نبذة عنك<textarea value={form.bio} onChange={set("bio")} rows={3} placeholder="حاجة تحب الناس تعرفها عنك"/></label>
      <div className={styles.actions}><button type="submit" disabled={!valid}>حفظ التعديلات</button>{saved && <span role="status"><Check size={16} aria-hidden="true"/>اتحفظت</span>}</div>
      <p className={styles.note}>النسخة التجريبية بتحفظ بياناتك على الجهاز ده بس.</p>
    </form>
  </StudentV101Shell>;
}
