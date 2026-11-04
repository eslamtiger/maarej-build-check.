"use client";
import {useStudentClock} from "@/lib/use-student-clock";
import {studentDetailHref} from "@/lib/student-navigation";

import {StudentContextLink as Link} from "../student-context-link";
import { useRouter } from "next/navigation";
import { useStudentAppState } from "@/lib/student-app-state";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BookOpenCheck, CalendarClock, CalendarDays, ChevronLeft, ChevronUp, Gift, GraduationCap, ShieldCheck, Trophy, X } from "lucide-react";
import { studentDemo } from "@/data/student-v101";
import { identityDemoViews } from "@/data/student-v105-identity-view";
import { studentPerformanceSnapshot } from "@/data/student-performance-view";
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
import { homeJourneyPreview, homeLaunchpadView, type HomeAction } from "./home-launchpad-view";
import { PerformanceStrip } from "./performance-snapshot";
import styles from "./student-home.module.css";

type HomeDetail = { kind: "source"; record: SourceRecord; href?: string } | { kind: "mission" } | { kind: "achievement"; id: string };
export function StudentHome() {
  const router=useRouter(), appState=useStudentAppState();
  const reduce = useReducedMotion(), mode = useQaIdentityMode();
  const baseIdentity = identityDemoViews[mode];
  const [progressSnapshot, setProgressSnapshot] = useState<{ base: JourneyIdentitySource; value: JourneyIdentitySource } | null>(null);
  const identity = bindJourneyIdentity(progressSnapshot?.base === baseIdentity ? progressSnapshot.value : baseIdentity);
  const theme = resolveIdentityTheme(identity.currentIdentity?.visualTheme, configuredIdentityTheme(identity.currentIdentity));
  const clock=useStudentClock();
  const [detail, setDetail] = useState<HomeDetail | null>(null);
  const objectRail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onProgress = (event: Event) => {
      const snapshot = (event as CustomEvent<{ identity?: JourneyIdentitySource }>).detail?.identity;
      if (snapshot?.journeyNodes) setProgressSnapshot({ base: baseIdentity, value: snapshot });
    };
    window.addEventListener("maarej:journey-progress", onProgress);
    return () => { window.removeEventListener("maarej:journey-progress", onProgress); };
  }, [baseIdentity]);
  const { nextAction, nextActionContext, timeline, mission, achievement, achievements, latestUpdate } = homeLaunchpadView(clock,Object.keys(appState.submissions));
  const reward = resolveMissionReward(mission, journeyActionData.rewards);
  const { current, next, nodes: preview } = homeJourneyPreview(identity);
  useEffect(() => { objectRail.current?.scrollTo({ left: 0, behavior: "instant" }); }, [achievement?.id]);
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
  const style = { "--home-primary": theme.primaryColor, "--home-secondary": theme.secondaryColor } as CSSProperties;
  const entrance = { initial: reduce ? false as const : { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: .22 } };
  return <StudentV101Shell active="home"><div className={styles.home} style={style}>
    <motion.section className={styles.hero} {...entrance} aria-labelledby="home-next-heading">
      <span className={styles.heroLayer} aria-hidden="true"/><span className={styles.heroSilhouette} aria-hidden="true"/>
      <div className={styles.heroCopy}><p className={styles.greeting}>صباح الخير يا {studentDemo.identity.name.split(" ")[0]}</p><small className={styles.kicker}>خطوتك الجاية:</small>
        <h1 id="home-next-heading">{nextAction?.title ?? "لا توجد خطوة مطلوبة حاليًا"}</h1>
        {nextActionContext && <p className={styles.nextContext}>{nextActionContext}</p>}
        {identity.currentIdentity?.name && <Link className={styles.identityPreview} href="/student/journey"><IdentityEmblem theme={theme} size={20}/><span><small>هويتك الحالية</small><b>{identity.currentIdentity.name}</b>{identity.currentStage && <em>{identity.currentStage}</em>}</span></Link>}
      </div>
      <motion.div className={styles.character} initial={reduce ? false : { opacity: 0, x: -6, scale: .96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: .25 }}>
        {theme.characterAsset ? <img src={theme.characterAsset.src} alt={theme.characterAsset.alt} width="1024" height="1536"/> : <div className={styles.characterFallback} role="img" aria-label="شعار الهوية الحالية"><IdentityEmblem theme={theme} size={76}/></div>}
      </motion.div>
      <div className={styles.heroActions}>{nextAction && <motion.button type="button" data-testid="home-next-action" onClick={() => openAction(nextAction)} whileTap={reduce ? undefined : { scale: .97 }} className={styles.primaryAction}>ابدأ الآن <ChevronLeft size={17}/></motion.button>}<Link href="/student/learning/schedule" className={styles.secondaryAction}><CalendarDays size={16}/>جدول اليوم</Link></div>
    </motion.section>

    <section className={styles.now} aria-labelledby="home-now-heading"><div className={styles.sectionHeading}><h2 id="home-now-heading">الآن وما بعده</h2><CalendarClock size={18}/></div>
      <div className={styles.timeline}>{timeline.length ? timeline.map((item, i) => <motion.button key={item.id} type="button" data-testid={`home-timeline-${item.id}`} className={styles.timelineItem} onClick={() => openAction(item)} initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18, delay: .05 * i }} whileTap={reduce ? undefined : { scale: .98 }}>
        <span className={styles.timelineTime}>{item.time}<small>{item.date}</small></span><span className={styles.timelineSymbol}>{item.kind === "session" ? <GraduationCap size={19}/> : <BookOpenCheck size={18}/>}</span><span className={styles.timelineText}><b>{item.title}</b><small>{item.context}</small></span><ChevronLeft size={16}/>
      </motion.button>) : <p className={styles.empty}>لا توجد التزامات قادمة في البيانات الحالية.</p>}</div>
    </section>

    {mission && nextAction?.missionId !== mission.id && <section className={styles.mission} aria-labelledby="home-mission-heading"><motion.button type="button" className={styles.missionBody} onClick={openMission} whileTap={reduce ? undefined : { scale: .99 }} aria-label={`متابعة المهمة: ${mission.title}`}><div className={styles.missionTop}><span className={styles.missionEmblem}><IdentityEmblem theme={theme}/></span><div><small id="home-mission-heading">مهمتك الحالية</small><h2>{mission.title}</h2><p>{mission.context}</p></div></div>
      <div className={styles.missionProgress}><Progress value={mission.value}/><b dir="ltr">{mission.progressText}</b></div><p className={styles.remaining}>{mission.remaining}</p></motion.button>
      <div className={styles.missionFooter}>{reward && <Link href="/student/rewards/attendance"><Gift size={17}/>{reward.amount} ج.م</Link>}<motion.button type="button" onClick={openMission} whileTap={reduce ? undefined : { scale: .97 }}>متابعة المهمة <ChevronLeft size={15}/></motion.button></div>
    </section>}

    <PerformanceStrip snapshot={studentPerformanceSnapshot} progressiveDisclosure/>

    <section className={styles.journey} aria-labelledby="home-journey-heading"><div className={styles.sectionHeading}><h2 id="home-journey-heading">رحلة التقدم</h2><Link href="/student/journey">شوف رحلتك <ChevronLeft size={14}/></Link></div>
      {current ? <><div className={styles.journeyPreview} aria-label="السابق ثم الحالي ثم القادم باتجاه الصعود"><svg viewBox="0 0 360 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><linearGradient id="home-journey-path"><stop stopColor={theme.primaryColor}/><stop offset="1" stopColor={theme.secondaryColor}/></linearGradient></defs><motion.path d="M 62 107 C 80 107 122 86 171 83 S 250 28 294 28" fill="none" stroke="url(#home-journey-path)" strokeWidth="5" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: .6 }}/></svg>
        {preview.map((node, i) => node && <JourneyLandmark key={node.id} state={i === 0 ? "completed" : i === 1 ? "current" : node.state} theme={theme} label={node.label} x={[.172, .475, .817][i]} y={[.766, .594, .203][i]} index={i} atRisk={node.attention} onOpen={() => { window.location.assign("/student/journey"); }}/>)}</div>
        <Link href="/student/journey" className={styles.journeyContext}><p><small>أنت هنا</small>{current.label && <b>{current.label}</b>}</p>{next && <><ChevronUp size={20}/><p><small>التالي</small>{next.label && <b>{next.label}</b>}</p></>}</Link></> : null}
    </section>

    <section className={styles.objects} aria-labelledby="home-objects-heading"><div className={styles.sectionHeading}><h2 id="home-objects-heading">إنجازك ومكافأتك</h2><Trophy size={17}/></div><div ref={objectRail} className={styles.objectRail} dir="rtl">
      {achievements.map(item => <motion.button key={item.id} type="button" data-testid={`home-achievement-${item.id}`} className={`${styles.object} ${styles.achievement}`} onClick={() => setDetail({ kind: "achievement", id: item.id })} whileTap={reduce ? undefined : { scale: .97 }}><span className={styles.objectEmblem}><Trophy size={26}/></span><span><small>{item.state === "earned" ? "إنجاز مكتسب" : "قيد التقدم"}</small><b>{item.name}</b>{item.state !== "earned" && item.progress !== undefined ? <em>{item.progress}%</em> : item.achievedAt && <em>{item.achievedAt}</em>}</span><ChevronLeft size={18}/></motion.button>)}
      {reward && <Link className={`${styles.object} ${styles.reward}`} href="/student/rewards/attendance"><span className={styles.objectEmblem}><Gift size={26}/></span><span><small>{reward.status}</small><b>{reward.title}</b><em>{reward.amount} ج.م</em></span><ChevronLeft size={18}/></Link>}
      {!achievement && !reward && <p className={styles.empty}>لا توجد إنجازات أو مكافآت متاحة حاليًا.</p>}
    </div></section>

    <section className={styles.update} aria-labelledby="home-update-heading"><div className={styles.sectionHeading}><h2 id="home-update-heading">آخر تحديث</h2></div>{latestUpdate ? <ActivityUpdate update={latestUpdate} onOpen={() => { if(latestUpdate.sourceHref)router.push(studentDetailHref(latestUpdate.sourceHref));else if (latestUpdate.source) setDetail({ kind: "source", record: latestUpdate.source, href: latestUpdate.sourceHref }); }}/> : <p className={styles.empty}>لا يوجد تحديث جديد.</p>}</section>
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
  const content = <><span><ShieldCheck size={20}/></span><div><small>{update.time}</small><b>{update.title}</b><p>{update.context}</p></div>{update.source && <ChevronLeft size={18}/>}</>;
  return update.source ? <button type="button" className={`${styles.activityRow} ${styles.activityButton}`} onClick={onOpen}>{content}</button> : <div className={styles.activityRow}>{content}</div>;
}
