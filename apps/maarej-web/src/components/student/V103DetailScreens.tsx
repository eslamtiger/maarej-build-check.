"use client";

import Link from "next/link";
import {StudentBackButton} from "./student-record-details";
import {
  ArrowRight, Bell, BookOpen, CalendarClock, CheckCircle2, FileQuestion, FileText, GraduationCap,
  LockKeyhole, MapPin, RotateCcw, Settings, ShieldCheck, Star, UserRound, UsersRound, WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { studentDemo as d } from "@/data/student-v101";
import {
  groupById, groupForSubject, qaDefaults, teacherById, type FundingSource, type StudentType, v103BuildVersion,
} from "@/data/student-v103-view";
import { resetQaDemoState, useQaDemoState, writeQaDemoState } from "@/lib/qa-demo-state";
import { Avatar, Badge, Button, Card } from "./V101Primitives";
import { CompleteGroupScreen, CompleteTeacherScreen } from "./student-learning-module";
import { CompleteSecurityScreen, CompleteSettingsScreen } from "./student-account-module";
import { StudentV101Shell } from "./StudentV101Shell";

function Head({ title, desc }: { title: string; desc: string }) {
  return <div className="v102-pagehead"><div><h1>{title}</h1><p>{desc}</p></div></div>;
}

export function GroupWorkspaceScreen({groupId}:{groupId:string}){return <CompleteGroupScreen groupId={groupId}/>;}

function Empty({ text }: { text: string }) { return <Card className="v102-empty-compact"><FileText/><b>{text}</b></Card>; }

export function TeacherProfileScreen({teacherId}:{teacherId:string}){return <CompleteTeacherScreen teacherId={teacherId}/>;}

export function StudentProfileScreen() {
  return <StudentV101Shell active="account"><StudentBackButton fallback="/student/account"/><Head title="الملف الشخصي" desc="بيانات الطالب الأساسية"/><Card className="v103-profile-card"><Avatar className="v103-avatar-lg">ي</Avatar><h2>{d.identity.name}</h2><p>{d.identity.stage}</p></Card><Card className="v102-list"><div className="v102-item"><UserRound/><div><b>الاسم</b><small>{d.identity.name}</small></div></div><div className="v102-item"><GraduationCap/><div><b>المرحلة الدراسية</b><small>{d.identity.stage}</small></div></div></Card><p className="v103-note">هذه البيانات للعرض فقط في النسخة الحالية.</p></StudentV101Shell>;
}

export function SecurityScreen(){return <CompleteSecurityScreen/>;}

export function SettingsScreen(){return <CompleteSettingsScreen/>;}

const qaLinks = [
  ["Home", "/student"], ["Taallami", "/student/learning"], ["Journey", "/student/journey"],
  ["Schedule", "/student/schedule"], ["Finance", "/student/finance"], ["Account", "/student/account"],
  ["Plans", "/student/plans"], ["Notifications", "/student/notifications"], ["Reward Details", "/student/rewards/attendance"],
] as const;

const qaChecklist = [
  ["Bottom navigation", "Navigate to five student sections"], ["Home daily mission", "Open learning context"],
  ["Home next achievement", "Open achievement preview drawer"], ["Group open", "Open group workspace route"],
  ["Homework row", "Open homework details drawer"], ["Exam row/result", "Open exam/result drawer"],
  ["Teacher profile", "Open linked teacher public profile"], ["Schedule day", "Filter agenda by selected date"],
  ["Finance pay", "Open payment simulation drawer"], ["Finance top-up", "Open top-up simulation drawer"],
  ["Withdrawal", "Validate amount and branch by QA state"], ["Account rows", "Navigate or show explicit disabled state"],
] as const;

export function QaScreen() {
  const state = useQaDemoState();
  const [studentType, setStudentType] = useState<StudentType>(state.studentType);
  const [fundingSource, setFundingSource] = useState<FundingSource>(state.fundingSource);
  useEffect(() => { setStudentType(state.studentType); setFundingSource(state.fundingSource); }, [state.studentType, state.fundingSource]);
  function apply(nextType: StudentType, nextFunding: FundingSource) {
    setStudentType(nextType); setFundingSource(nextFunding); writeQaDemoState(nextType, nextFunding);
  }
  return <main className="v103-qa" dir="rtl">
    <Head title="QA Mode" desc="Preview-only test controls"/>
    <Card className="v103-qa-summary"><div><span>Build version</span><b>{v103BuildVersion}</b></div><div><span>Current role</span><b>Student</b></div><div><span>Student type</span><b>{studentType === "dependent" ? "Dependent" : "Independent"}</b></div><div><span>Funding source</span><b>{fundingSource === "parent" ? "Parent-funded" : "Self-funded"}</b></div></Card>
    <section><h2>Student type</h2><div className="v103-qa-actions"><Button data-testid="qa-dependent" variant={studentType === "dependent" ? "default" : "secondary"} onClick={() => apply("dependent", fundingSource)}>Dependent</Button><Button data-testid="qa-independent" variant={studentType === "independent" ? "default" : "secondary"} onClick={() => apply("independent", fundingSource)}>Independent</Button></div></section>
    <section><h2>Funding source</h2><div className="v103-qa-actions"><Button data-testid="qa-parent-funded" variant={fundingSource === "parent" ? "default" : "secondary"} onClick={() => apply(studentType, "parent")}>Parent-funded</Button><Button data-testid="qa-self-funded" variant={fundingSource === "self" ? "default" : "secondary"} onClick={() => apply(studentType, "self")}>Self-funded</Button></div></section>
    <Button variant="ghost" data-testid="qa-reset" onClick={() => { resetQaDemoState(); setStudentType(qaDefaults.studentType); setFundingSource(qaDefaults.fundingSource); }}><RotateCcw size={16}/> Reset demo state</Button>
    <section><h2>Screen links</h2><Card className="v103-qa-links">{qaLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</Card></section>
    <section><h2>Interaction checklist</h2><Card className="v103-qa-table"><div className="is-head"><b>Element</b><b>Expected action</b><b>Implemented</b></div>{qaChecklist.map(([element, expected]) => <div key={element}><span>{element}</span><span>{expected}</span><Badge tone="mint">Yes</Badge></div>)}</Card></section>
  </main>;
}
