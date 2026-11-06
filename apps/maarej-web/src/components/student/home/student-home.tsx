"use client";
import {useStudentClock} from "@/lib/use-student-clock";
import {studentDetailHref} from "@/lib/student-navigation";

import {StudentContextLink as Link} from "../student-context-link";
import { useRouter } from "next/navigation";
import { useStudentAppState } from "@/lib/student-app-state";
import { useStudentProfile } from "@/lib/student-profile";
import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BookOpenCheck, CalendarDays, ChevronLeft, ClipboardCheck, Gift, GraduationCap, ShieldCheck, Trophy, X } from "lucide-react";
import { studentDemo } from "@/data/student-v101";
import { studentHomework } from "@/data/student-records";
import { identityDemoViews } from "@/data/student-v105-identity-view";
import { studentPerformanceSnapshot, formatPerformanceChange } from "@/data/student-performance-view";
import { useQaIdentityMode } from "@/lib/qa-identity-state";
import { StudentV101Shell } from "../StudentV101Shell";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { bindJourneyIdentity, type JourneyIdentitySource } from "@/components/journey/journey-identity-view";
import { configuredIdentityTheme } from "@/components/journey/identity-theme-config";
import { resolveIdentityTheme } from "@/components/journey/journey-theme";
import { IdentityEmblem, JourneyLandmark } from "@/components/journey/journey-landmark";
import { journeyActionData } from "@/components/journey/journey-action-data";
import { resolveMissionReward, resolveMissionSource, type SourceRecord } from "@/components/journey/journey-actions";
import { ProgressRings, SubjectTiles, subjectStyle, type RingItem } from "../v2/student-v2";
import { homeJourneyPreview, homeLaunchpadView, type HomeAction } from "./home-launchpad-view";
import styles from "./student-home.module.css";
import {GameStrip} from "./game-strip";
import {Wallpaper} from "@/marketplace/components/doodles";
import {Marks} from "@/marketplace/components/fun";

type HomeDetail = { kind: "source"; record: SourceRecord; href?: string } | { kind: "mission" } | { kind: "achievement"; id: string };
const doneStatuses = ["تم التسليم", "تمت المراجعة"];

export function StudentHome() {
  const router=useRouter(), appState=useStudentAppState(), profile=useStudentProfile();
  const reduce = useReducedMotion(), mode = useQaIdentityMode();
  const baseIdentity = identityDemoViews[mode];
  const [progressSnapshot, setProgressSnapshot] = useState<{ base: JourneyIdentitySource; value: JourneyIdentitySource } | null>(null);
  const identity = bindJourneyIdentity(progressSnapshot?.base === baseIdentity ? progressSnapshot.value : baseIdentity);
  const theme = resolveIdentityTheme(identity.currentIdentity?.visualTheme, configuredIdentityTheme(identity.currentIdentity));
  const clock=useStudentClock();
  const [detail, setDetail] = useState<HomeDetail | null>(null);
  useEffect(() => {
    const onProgress = (event: Event) => {
      const snapshot = (event as CustomEvent<{ identity?: JourneyIdentitySource }>).detail?.identity;
      if (snapshot?.journeyNodes) setProgressSnapshot({ base: baseIdentity, value: snapshot });
    };
    window.addEventListener("maarej:journey-progress", onProgress);
    return () => { window.removeEventListener("maarej:journey-progress", onProgress); };
  }, [baseIdentity]);
  const { nextAction, nextActionContext, timeline, mission, achievements, latestUpdate } = homeLaunchpadView(clock,Object.keys(appState.submissions));
  const reward = resolveMissionReward(mission, journeyActionData.rewards);
  const { current, next, nodes: preview } = homeJourneyPreview(identity);
  const selectedAchievement = detail?.kind === "achievement" ? journeyActionData.achievements.find(item => item.id === detail.id) : undefined;
  const openMission = () => {
    const source = resolveMissionSource(mission, journeyActionData.sources);
    if(source?.href)router.push(studentDetailHref(source.href));else setDetail(source ? { kind: "source", record: source, href: source.href } : { kind: "mission" });
  };
  const openAction = (action: HomeAction) => {
    if (action.kind === "mission") openMission();
    else if(action.href ?? action.source?.href) router.push(studentDetailHref((action.href ?? action.source?.href)!));
    else if (action.source) setDetail({ kind: "source", record: action.source, href: action.href });
  };

  // Rings use recorded data only: attendance rate, finished homework, mission steps.
  const homeworkDone = studentHomework.filter(h => doneStatuses.includes(h.status) || appState.submissions[h.id]).length;
  const missionSteps = mission?.progressText.match(/(\d+)\s*\/\s*(\d+)/);
  const snap = studentPerformanceSnapshot;
  const rings: RingItem[] = [
    ...(snap.attendanceRate !== undefined ? [{ id: "attendance", label: "الحضور", caption: `${snap.attendancePresent ?? 0} حضور · ${snap.attendanceAbsent ?? 0} غياب`, value: snap.attendanceRate / 100, display: `${snap.attendanceRate}%`, color: "#1FA774", href: "/student/learning/attendance" }] : []),
    { id: "homework", label: "الواجبات", caption: homeworkDone === studentHomework.length ? "خلّصتها كلها" : `فاضل ${studentHomework.length - homeworkDone}`, value: studentHomework.length ? homeworkDone / studentHomework.length : 0, display: `${homeworkDone}/${studentHomework.length}`, color: "#F59E0B", href: "/student/learning/tasks#homework" },
    ...(mission ? [{ id: "mission", label: "المهمة", caption: missionSteps ? `فاضل ${Number(missionSteps[2]) - Number(missionSteps[1])}` : mission.title, value: mission.value / 100, display: missionSteps ? `${missionSteps[1]}/${missionSteps[2]}` : `${mission.value}%`, color: "#6F63FF", href: "/student/journey" }] : []),
  ];
  const quests = [
    ...(nextAction ? [{ id: "next", e: "📝", title: nextAction.title }] : []),
    ...(timeline.find(t => t.kind === "session") ? [{ id: "session", e: "🎓", title: `احضر ${timeline.find(t => t.kind === "session")!.title}` }] : []),
    { id: "review", e: "⏱️", title: "راجع 15 دقيقة" },
  ].slice(0, 3);
  const tags = nextActionContext?.split(" · ").filter(Boolean) ?? [];
  const firstName = profile.name.split(" ")[0];
  const greeting = clock.minutes < 12 * 60 ? "صباح الخير" : "مساء الخير";
  // Brief §13: momentum shows the current week; the identity itself never drops.
  const momentumLow = baseIdentity.status === "atRisk" || baseIdentity.status === "downgraded";
  const style = { "--home-primary": theme.primaryColor, "--home-secondary": theme.secondaryColor } as CSSProperties;
  const rise = (i: number) => ({ initial: reduce ? false as const : { y: 10 }, animate: { y: 0 }, transition: { duration: .32, delay: reduce ? 0 : i * .05, ease: [.16, 1, .3, 1] as const } });

  return <StudentV101Shell active="home"><div className={styles.home} style={style}>
    <Wallpaper/>
    <motion.section className={styles.hero} {...rise(0)} aria-labelledby="home-next-heading">
      <Marks items={[{ e: "⭐", x: 6, y: 8, s: "md", a: "spin" }, { e: "🚀", x: 94, y: 90, s: "md", a: "float" }]}/>
      <div className={styles.heroHead}>
        <h1>{greeting} يا {firstName}</h1>
        {identity.currentIdentity?.name && <Link className={styles.identity} href="/student/journey"><span className={styles.identityEmblem}><IdentityEmblem theme={theme} size={15}/></span><span>{identity.currentIdentity.name}{identity.currentStage && <small> · مرحلة {identity.currentStage}</small>}</span></Link>}
        <span className={styles.momentum} data-low={momentumLow}><i aria-hidden="true"/>{momentumLow ? "زخمك محتاج دفعة" : "زخمك قوي"}</span>
      </div>
      <div className={styles.heroBody}>
        <article className={styles.next}>
          <small className={styles.kicker}>خطوتك الجاية</small>
          <h2 id="home-next-heading">{nextAction?.title ?? "مفيش خطوة مطلوبة دلوقتي"}</h2>
          {tags.length > 0 && <div className={styles.tags}>{tags.map(tag => <span key={tag} className={styles.tag} data-tone={tag.includes("متأخر") ? "late" : undefined} style={subjectStyle(tag)}>{tag}</span>)}</div>}
          <div className={styles.nextActions}>
            {nextAction && <motion.button type="button" data-testid="home-next-action" onClick={() => openAction(nextAction)} className={styles.go}>ابدأ الآن <ChevronLeft size={20} strokeWidth={2.6}/></motion.button>}
            <Link href="/student/learning/schedule" className={styles.ghost}><CalendarDays size={17}/>جدول النهارده</Link>
          </div>
        </article>
        {theme.characterAsset && <motion.img className={styles.character} src={theme.characterAsset.src} alt="" width="1024" height="1536" initial={reduce ? false : { y: 12 }} animate={{ y: 0 }} transition={{ duration: .4, delay: .1 }}/>}
      </div>
    </motion.section>

    <motion.div {...rise(1)} className={styles.game}><GameStrip quests={quests} badges={journeyActionData.achievements.map(a => ({ id: a.id, name: a.name, earned: a.state === "earned", progress: achievements.find(x => x.id === a.id)?.progress }))}/></motion.div>

    <motion.section className={`${styles.card} ${styles.rings}`} {...rise(1)} aria-labelledby="home-rings-heading">
      <div className={styles.head}><h2 id="home-rings-heading">🎯 حلقاتك</h2><Link href="/student/learning/performance">أداؤك <bdi dir="ltr">{snap.primaryValue}</bdi>{snap.trend && <bdi dir="ltr" className={styles.up}>{formatPerformanceChange(snap.trend.value)}</bdi>}</Link></div>
      <ProgressRings items={rings}/>
    </motion.section>

    <motion.section className={`${styles.card} ${styles.today}`} {...rise(2)} aria-labelledby="home-now-heading">
      <div className={styles.head}><h2 id="home-now-heading">⏰ الجاي</h2><Link href="/student/learning/schedule">الجدول كامل</Link></div>
      {timeline.length ? <ol className={styles.timeline}>{timeline.map((item, i) => <li key={item.id}><button type="button" data-testid={`home-timeline-${item.id}`} className={styles.timelineItem} data-first={i === 0} onClick={() => openAction(item)}>
        <time><b>{item.time}</b>{item.date && <small dir="ltr">{item.date.slice(5).replace("-", "/")}</small>}</time>
        <span className={styles.timelineIcon} style={subjectStyle(item.context?.split(" · ")[0] ?? "")}>{item.kind === "session" ? <GraduationCap size={18}/> : item.kind === "exam" ? <ClipboardCheck size={18}/> : <BookOpenCheck size={18}/>}</span>
        <span className={styles.timelineText}><b>{item.title}</b><small>{item.context}</small></span><ChevronLeft size={16} aria-hidden="true"/>
      </button></li>)}</ol> : <p className={styles.empty}>مفيش مواعيد جاية في البيانات الحالية.</p>}
    </motion.section>

    {mission && <motion.section className={`${styles.card} ${styles.mission}`} {...rise(3)} aria-labelledby="home-mission-heading">
      <div className={styles.head}><h2 id="home-mission-heading">🚩 مهمتك</h2>{missionSteps && <span className={styles.count}><bdi dir="ltr">{missionSteps[1]} / {missionSteps[2]}</bdi></span>}</div>
      <button type="button" className={styles.missionBody} onClick={openMission} aria-label={`متابعة المهمة: ${mission.title}`}><b>{mission.title}</b><small>{mission.context}</small></button>
      {missionSteps ? <div className={styles.steps} aria-hidden="true">{Array.from({ length: Number(missionSteps[2]) }, (_, i) => <span key={i} data-on={i < Number(missionSteps[1])}/>)}</div> : <Progress value={mission.value}/>}
      <div className={styles.missionFoot}><span>{mission.remaining}</span>{reward && <Link href="/student/rewards/attendance" className={styles.reward}><Gift size={16}/>{reward.amount} ج.م</Link>}</div>
    </motion.section>}

    <motion.section className={`${styles.card} ${styles.subjects}`} {...rise(4)} aria-labelledby="home-subjects-heading">
      <div className={styles.head}><h2 id="home-subjects-heading">📚 موادك</h2><Link href="/student/learning/subjects">كل المواد</Link></div>
      <SubjectTiles/>
    </motion.section>

    {current && <motion.section className={`${styles.card} ${styles.journey}`} {...rise(5)} aria-labelledby="home-journey-heading">
      <div className={styles.head}><h2 id="home-journey-heading">🧗 رحلتك</h2><Link href="/student/journey">افتح الخريطة</Link></div>
      <div className={styles.journeyPreview} aria-label="السابق ثم الحالي ثم القادم"><svg viewBox="0 0 360 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M 62 107 C 80 107 122 86 171 83 S 250 28 294 28" fill="none" stroke="#DCD8F5" strokeWidth="5" strokeDasharray="2 11" strokeLinecap="round"/><motion.path d="M 62 107 C 80 107 122 86 171 83" fill="none" stroke={theme.primaryColor} strokeWidth="5" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .7, delay: .3 }}/></svg>
        {preview.map((node, i) => node && <JourneyLandmark key={node.id} state={i === 0 ? "completed" : i === 1 ? "current" : node.state} theme={theme} label={node.label} x={[.172, .475, .817][i]} y={[.766, .594, .203][i]} index={i} atRisk={node.attention} onOpen={() => router.push("/student/journey")}/>)}</div>
      <div className={styles.journeyLegend}><p><small>أنت هنا</small><b>{current.label}</b></p>{next && <p><small>الجاية</small><b>{next.label}</b></p>}</div>
    </motion.section>}

    {achievements.length > 0 && <motion.section className={`${styles.card} ${styles.wins}`} {...rise(6)} aria-labelledby="home-wins-heading">
      <div className={styles.head}><h2 id="home-wins-heading">🏅 إنجازاتك</h2><Link href="/student/journey/achievements">الكل</Link></div>
      <div className={styles.winList}>{achievements.map(item => { const earned = item.state === "earned"; return <button key={item.id} type="button" data-testid={`home-achievement-${item.id}`} className={styles.win} data-earned={earned} onClick={() => setDetail({ kind: "achievement", id: item.id })}>
        <span className={styles.medal}><Trophy size={22}/></span><span className={styles.winText}><b>{item.name}</b><small>{earned ? (item.achievedAt ? `اتكسب ${item.achievedAt}` : "اتكسب") : <>قرّبت: <bdi dir="ltr">{item.progress ?? 0}%</bdi></>}</small>{!earned && item.progress !== undefined && <i className={styles.winBar}><i style={{ width: `${item.progress}%` }}/></i>}</span>
      </button>; })}</div>
    </motion.section>}

    {latestUpdate && <motion.section className={`${styles.card} ${styles.update}`} {...rise(7)} aria-labelledby="home-update-heading">
      <h2 id="home-update-heading" className={styles.srOnly}>آخر تحديث</h2>
      <ActivityUpdate update={latestUpdate} onOpen={() => { if(latestUpdate.sourceHref)router.push(studentDetailHref(latestUpdate.sourceHref));else if (latestUpdate.source) setDetail({ kind: "source", record: latestUpdate.source, href: latestUpdate.sourceHref }); }}/>
    </motion.section>}
    <p className={styles.note}>نسخة تجريبية · كل الأسماء والأرقام بيانات توضيحية</p>
  </div>
    <Drawer open={Boolean(detail)} onOpenChange={open => { if (!open) setDetail(null); }}><DrawerContent className={styles.detailSheet}><DrawerTitle>{detail?.kind === "source" ? detail.record.title : detail?.kind === "achievement" ? selectedAchievement?.name ?? "تفاصيل الإنجاز" : "مهمتك الحالية"}</DrawerTitle><DrawerDescription>تفاصيل السجل المرتبط بخطوتك</DrawerDescription><DrawerClose className={styles.drawerClose} aria-label="إغلاق"><X size={20}/></DrawerClose>
      <div className={styles.detailBody}>{detail?.kind === "source" && <>{detail.record.fields.map(field => <p className={styles.detailRow} key={field.label}><span>{field.label}</span><b>{field.value}</b></p>)}{(detail.href ?? detail.record.href) && <Link href={(detail.href ?? detail.record.href)!} className={styles.primaryAction}>{detail.record.actionLabel ?? "فتح السجل"}<ChevronLeft size={16}/></Link>}</>}
        {detail?.kind === "mission" && mission && <><h2>{mission.title}</h2><p>{mission.context}</p><Progress value={mission.value}/><strong dir="ltr">{mission.progressText}</strong><p>{mission.remaining}</p>{reward && <p className={styles.detailRow}><span>المكافأة المرتبطة</span><b>{reward.amount} ج.م</b></p>}<Link href="/student/journey" className={styles.primaryAction}>عرض المهمة في رحلتي<ChevronLeft size={16}/></Link></>}
        {selectedAchievement && <><p>{selectedAchievement.reason}</p>{selectedAchievement.source && <p className={styles.detailRow}><span>المصدر</span><b>{selectedAchievement.source}</b></p>}{selectedAchievement.achievedAt && <p className={styles.detailRow}><span>تاريخ الوصول</span><b>{selectedAchievement.achievedAt}</b></p>}{selectedAchievement.evidence?.map(value => <p key={value}>{value}</p>)}<Link href="/student/journey" className={styles.primaryAction}>شوف رحلتك<ChevronLeft size={16}/></Link></>}
      </div>
    </DrawerContent></Drawer>
  </StudentV101Shell>;
}

function ActivityUpdate({ update, onOpen }: { update: ReturnType<typeof homeLaunchpadView>["latestUpdate"]; onOpen: () => void }) {
  const content = <><span className={styles.updateIcon}><ShieldCheck size={20}/></span><div><small>آخر تحديث · {update.time}</small><b>{update.title}</b>{update.context && <p>{update.context}</p>}</div>{update.source && <ChevronLeft size={18}/>}</>;
  return update.source ? <button type="button" className={styles.activityRow} onClick={onOpen}>{content}</button> : <div className={styles.activityRow}>{content}</div>;
}
