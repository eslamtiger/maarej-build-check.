"use client";
import {studentDetailHref} from "@/lib/student-navigation";
import {StudentContextLink as Link} from "@/components/student/student-context-link";
import { resolveStudentSource } from "@/data/student-records";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BookOpenCheck, Check, ChevronUp, Gift, Handshake, ShieldCheck, Sparkles, Target, TriangleAlert, Trophy, X } from "lucide-react";
import { identityDemoViews } from "@/data/student-v105-identity-view";
import { useQaIdentityMode } from "@/lib/qa-identity-state";
import { Progress } from "@/components/ui/progress";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { StudentV101Shell } from "@/components/student/StudentV101Shell";
import { IdentityEmblem, JourneyLandmark } from "./journey-landmark";
import { resolveIdentityTheme, type IdentityTheme } from "./journey-theme";
import { configuredIdentityTheme } from "./identity-theme-config";
import { availableIdentityText as meaningful, bindJourneyIdentity, type JourneyIdentitySource } from "./journey-identity-view";
import { journeyActionData } from "./journey-action-data";
import { resolveMissionReward, resolveMissionSource, type JourneyActionData, type MissionRecord, type SourceRecord } from "./journey-actions";
import { journeyLayout, journeyContours } from "./journey-layout";
import { formatArabicDate } from "@/lib/arabic-date";
import styles from "./learning-roadmap-v2.module.css";

const traitIcons = { learning: BookOpenCheck, commitment: ShieldCheck, cooperation: Handshake };

// UI consumes an authoritative snapshot. It never computes eligibility or awards.
export type JourneyProgressEvent = {
  eventId: string;
  type: "achievement.completed";
  identity: JourneyIdentitySource;
  achievement?: { label: string };
};
export function LearningRoadmapV2({ identity, identityTheme, actionData = journeyActionData }: {
  identity?: JourneyIdentitySource; identityTheme?: Partial<IdentityTheme>; actionData?: JourneyActionData;
}) {
  const router=useRouter();
  const mode = useQaIdentityMode(), reduce = useReducedMotion();
  const baseView = identity ?? identityDemoViews[mode];
  const [eventSnapshot, setEventSnapshot] = useState<{ base: JourneyIdentitySource; value: JourneyIdentitySource } | null>(null);
  const view = bindJourneyIdentity(eventSnapshot?.base === baseView ? eventSnapshot.value : baseView);
  const [selected, setSelected] = useState<string | null>(null);
  const [sourceRecord, setSourceRecord] = useState<SourceRecord | undefined>();
  const [celebration, setCelebration] = useState<JourneyProgressEvent | null>(null);
  const seenEvents = useRef(new Set<string>());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onProgress = (event: Event) => {
      const payload = (event as CustomEvent<JourneyProgressEvent>).detail;
      if (payload?.type !== "achievement.completed" || !payload.eventId || !payload.identity?.journeyNodes?.length || seenEvents.current.has(payload.eventId)) return;
      seenEvents.current.add(payload.eventId);
      setEventSnapshot({ base: baseView, value: payload.identity });
      setCelebration(payload);
      clearTimeout(timer);
      timer = setTimeout(() => setCelebration(null), 1400);
    };
    window.addEventListener("maarej:journey-progress", onProgress);
    return () => { window.removeEventListener("maarej:journey-progress", onProgress); clearTimeout(timer); };
  }, [baseView]);
  const theme = resolveIdentityTheme(view.currentIdentity?.visualTheme, configuredIdentityTheme(view.currentIdentity), identityTheme);
  const mission = actionData.missions.find(record => record.id === actionData.currentMissionId);
  const missionReward = resolveMissionReward(mission, actionData.rewards);
  const reward = missionReward ?? actionData.rewards.find(record => view.journeyNodes.some(node => node.relatedRewardId === record.id));
  const name = view.currentIdentity?.name;
  const stage = view.currentStage;
  const direction = view.currentDirection;
  // Brief §13: an earned identity never drops. A weak week only lowers momentum.
  const atRisk = view.status === "atRisk" || view.status === "downgraded";
  const nodes = view.journeyNodes;
  const activeIndex = nodes.findIndex(n => n.state === "current");
  const currentIndex = activeIndex < 0 ? Math.floor(nodes.length / 2) : activeIndex;
  const stateOf = (i: number) => nodes[i].state;
  const labelOf = (i: number) => meaningful(nodes[i].label) ?? "";
  const completed = nodes.filter(n => n.state === "completed").length;
  const selectedIndex = nodes.findIndex(n => n.id === selected);
  const selectedNode = nodes[selectedIndex];
  const selectedState = selectedNode ? stateOf(selectedIndex) : null;
  const selectedMission = selected === "mission" ? mission : selectedNode?.relatedMissionId ? actionData.missions.find(record => record.id === selectedNode.relatedMissionId) : selectedState === "current" ? mission : undefined;
  const selectedReward = selected?.startsWith("reward:") ? actionData.rewards.find(record => selected === `reward:${record.id}`) : undefined;
  const selectedAchievement = selected?.startsWith("achievement:") ? actionData.achievements.find(record => selected === `achievement:${record.id}`) : actionData.achievements.find(record => record.id === (selectedNode?.relatedAchievementId ?? selectedNode?.relatedBadgeId));
  const nearbyAchievement = nodes.map(n => actionData.achievements.find(record => record.id === (n.relatedAchievementId ?? n.relatedBadgeId) && record.state === "progress")).find(Boolean);
  const explicitRewardNode = reward ? nodes.findIndex(n => n.relatedRewardId === reward.id) : -1;
  const rewardNodeIndex = explicitRewardNode >= 0 ? explicitRewardNode : reward ? nodes.findIndex(n => n.relatedMissionId === mission?.id && mission?.rewardId === reward.id) : -1;
  const achievementNodeIndex = nearbyAchievement ? nodes.findIndex(node => (node.relatedAchievementId ?? node.relatedBadgeId) === nearbyAchievement.id) : -1;
  const { height: roadmapHeight, positions, segments, markerPositions } = journeyLayout(nodes.length, currentIndex, [
    // Brief §14: rewards are not drawn on the path; the mission card shows them.
    ...(nearbyAchievement && achievementNodeIndex >= 0 ? [{ id: "achievement", nodeIndex: achievementNodeIndex, kind: "achievement" as const }] : []),
  ]);
  const rewardPosition = positions[rewardNodeIndex], rewardAnchor = markerPositions.reward;
  const achievementPosition = positions[achievementNodeIndex], achievementAnchor = markerPositions.achievement;
  // The current mission already carries the primary next action. Retain only
  // distinct recovery/maintenance context; never repeat the mission instruction.
  const nextHint = meaningful(view.nextMilestone);
  const distinctNextHint = nextHint && (!mission || (nextHint !== mission.remaining && nextHint !== mission.title && !/(?:أكمل|كمّل|تابع).*مهم|(?:خطوتك|خطوة).*التالية/.test(nextHint))) ? nextHint : null;
  const openMission = (record?: MissionRecord) => {
    const source = resolveMissionSource(record, actionData.sources);
    if(source?.href){router.push(studentDetailHref(source.href));return;}
    setSourceRecord(source);
    setSelected(source ? "source" : record?.id === mission?.id ? "mission" : selectedNode?.id ?? null);
  };
  const accentStyle = {
    "--identity-accent": theme.primaryColor, "--identity-secondary": theme.secondaryColor, "--identity-gold": theme.accentColor,
  } as CSSProperties;
  return <div className={styles.journey} style={accentStyle} data-pattern={theme.surfacePattern}>
    <div className={styles.identityColumn}>
      <section className={styles.hero} aria-label="هويتك" data-testid="journey-identity-hero">
        <span className={styles.heroLayer} aria-hidden="true"/><span className={styles.characterAura} aria-hidden="true"/>
        <div className={styles.heroEmblem} aria-hidden="true"><IdentityEmblem theme={theme}/></div>
        <Sparkles className={styles.heroSpark} size={24} aria-hidden="true"/>
        <div className={styles.heroCopy} role={name && activeIndex >= 0 ? "button" : undefined} tabIndex={name && activeIndex >= 0 ? 0 : undefined} aria-label={name ? `عرض تفاصيل هوية ${name}` : undefined} style={name && activeIndex >= 0 ? { cursor: "pointer" } : undefined} onClick={() => { if (name && activeIndex >= 0) setSelected(nodes[activeIndex].id); }} onKeyDown={event => { if (name && activeIndex >= 0 && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setSelected(nodes[activeIndex].id); } }}>
          <h1>رحلتي</h1>{name && <><span className={styles.eyebrow}>هويتك</span><h2>{name}</h2></>}
          {stage && <p className={styles.stage}><small>المرحلة</small>{stage}</p>}
          {direction && <span className={styles.direction}><small>التوجه</small>{direction}</span>}
          {view.currentIdentity && <span className={`${styles.health} ${atRisk ? styles.atRisk : ""}`}>{atRisk ? <TriangleAlert size={15}/> : <ShieldCheck size={15}/>} زخمك {atRisk ? "محتاج دفعة" : "قوي"}</span>}
        </div>
        <motion.div className={`${styles.character} ${!theme.characterAsset ? styles.emblemFallback : ""}`} initial={reduce ? false : { opacity: 0, x: -7, scale: .96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: .25 }}>
          {theme.characterAsset ? <img src={theme.characterAsset.src} alt={theme.characterAsset.alt} width={1024} height={1536}/> : <span role="img" aria-label="شعار هويتك"><IdentityEmblem theme={theme} size={88}/></span>}
        </motion.div>
        {distinctNextHint && <div className={styles.progressHint}><ChevronUp size={16} aria-hidden="true"/><span>{distinctNextHint}</span></div>}
      </section>
      {!!view.traits.length && <section className={styles.traits} aria-label="صفات هويتك">
        {view.traits.slice(0, 3).map((trait, i) => { const Icon = trait.symbol ? traitIcons[trait.symbol] : Sparkles; return <span key={trait.id} style={{ "--trait-order": i } as CSSProperties}>
          <Icon size={19} aria-hidden="true"/><span>{trait.label}<b>{trait.value}</b></span>
        </span>; })}
      </section>}
    </div>
    <div className={styles.progressColumn}>
      <section className={styles.surface} aria-labelledby="journey-progress-heading">
        <span className={styles.shapeOne} aria-hidden="true"/><span className={styles.shapeTwo} aria-hidden="true"/>
        <BookOpenCheck className={styles.worldLearning} size={54} aria-hidden="true"/>
        <header className={styles.statusRow}><h2 id="journey-progress-heading">مسار التقدم</h2>{nodes.length > 0 && <p><b>{completed} من {nodes.length}</b> مراحل مكتملة</p>}</header>
        {nodes.length > 0 ? <div className={styles.roadmap} style={{ aspectRatio: `360 / ${roadmapHeight}` }} data-testid="learning-roadmap-v2">
          <svg viewBox={`0 0 360 ${roadmapHeight}`} width="100%" height="auto" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs><linearGradient id="journeyAscendingGradient" x1="0" y1="1" x2="1" y2="0"><stop stopColor={theme.primaryColor}/><stop offset="1" stopColor={theme.secondaryColor}/></linearGradient></defs>
            <g fill="none" stroke={theme.primaryColor} strokeOpacity=".045" strokeWidth="1.5">
              {journeyContours(roadmapHeight).map((d,i) => <path key={i} d={d}/>)}
            </g>
            {segments.map((d, i) => <g key={`${celebration?.eventId ?? "entry"}-${i}`}>
              <path d={d} fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" opacity=".7"/>
              <motion.path d={d} fill="none" stroke={nodes[i].state === "completed" ? "url(#journeyAscendingGradient)" : nodes[i].state === "current" ? theme.secondaryColor : "#C7C3DF"} strokeWidth={nodes[i].state === "completed" ? 9 : 6} strokeOpacity={nodes[i].state === "current" ? .65 : 1} strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduce ? 0 : .7 / Math.max(segments.length, 1), delay: reduce ? 0 : i * .7 / Math.max(segments.length, 1) }}/>
              {nodes[i].state !== "completed" && nodes[i].state !== "current" && <path d={d} fill="none" stroke="#F5F3FE" strokeWidth="7" strokeDasharray="1 13" strokeLinecap="round"/>}
            </g>)}

            {rewardPosition && rewardAnchor && <path d={`M ${rewardPosition.x * 360 + (rewardPosition.x > .5 ? 24 : -24)} ${rewardPosition.y * roadmapHeight - 15} L ${rewardAnchor.x * 360} ${rewardAnchor.y * roadmapHeight + 18}`} fill="none" stroke={theme.accentColor} strokeWidth="2" strokeDasharray="3 4"/>}
            {achievementPosition && achievementAnchor && <path d={`M ${achievementPosition.x * 360 + (achievementPosition.x > .5 ? 24 : -24)} ${achievementPosition.y * roadmapHeight} L ${achievementAnchor.x * 360} ${achievementAnchor.y * roadmapHeight}`} fill="none" stroke={theme.accentColor} strokeWidth="2" strokeDasharray="3 4"/>}
            {nodes.map((n, i) => <g key={n.id} data-state={n.state} transform={`translate(${positions[i].tx * 360} ${positions[i].ty * roadmapHeight})`} className={styles.nodeText}>
              {stateOf(i) === "current" && <><path d="M -35 -38 H 35 L 30 -26 L 35 -14 H -35 L -30 -26 Z" fill={theme.primaryColor}/><text y="-21" textAnchor="middle" className={styles.here}>أنت هنا</text></>}
              <text y="4" textAnchor="middle" className={stateOf(i) === "current" ? styles.currentLabel : styles.nodeLabel}>{labelOf(i)}</text>
              {n.state !== "locked" && Math.abs(i - currentIndex) <= 1 && meaningful(n.state === "current" && stage !== n.label ? stage ?? n.subtitle : n.subtitle) && <text y="25" textAnchor="middle" className={styles.nodeContext}>{n.state === "current" && stage !== n.label ? stage ?? n.subtitle : n.subtitle}</text>}
            </g>)}
          </svg>
          {nodes.map((n, i) => <JourneyLandmark key={n.id} state={stateOf(i)} theme={theme} label={labelOf(i)} x={positions[i].x} y={positions[i].y} index={i} atRisk={n.attention} onOpen={() => setSelected(n.id)}/>)}
          {reward && rewardAnchor && <motion.button type="button" className={styles.rewardMarker} style={{ left: `${rewardAnchor.x * 100}%`, top: `${rewardAnchor.y * 100}%`, width: 64, translate: "-50% -50%" }} aria-label={`مكافأة ${mission?.title ?? labelOf(rewardNodeIndex)}: ${reward.amount} جنيه — عرض تفاصيل المكافأة`} onClick={() => setSelected(`reward:${reward.id}`)}
            initial={reduce ? false : { opacity: 0, y: 6, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", bounce: .22, duration: .4, delay: reduce ? 0 : .5 }} whileTap={reduce ? undefined : { scale: .97 }}>
            <span><Gift size={21}/></span><b>{reward.amount} ج.م</b>
          </motion.button>}
          {nearbyAchievement && achievementAnchor && <motion.button type="button" className={styles.achievementMarker} style={{ left: `${achievementAnchor.x * 100}%`, top: `${achievementAnchor.y * 100}%`, translate: "-50% -50%" }} whileTap={reduce ? undefined : { scale: .97 }} onClick={() => setSelected(`achievement:${nearbyAchievement.id}`)}><Trophy size={20}/><span>إنجاز قريب</span></motion.button>}
          {celebration && <div className={styles.celebration} role="status">
            <span><Check size={18}/>{celebration.achievement?.label ?? "اكتملت خطوة في رحلتك"}</span>
            {!reduce && Array.from({ length: 10 }, (_, i) => <i key={i} style={{ "--particle-x": `${(i - 5) * 18}px`, "--particle-turn": `${i * 40}deg`, background: [theme.primaryColor, theme.secondaryColor, theme.accentColor][i % 3] } as CSSProperties}/>)}
          </div>}
        </div> : null}
      </section>
      {mission && <section className={styles.mission} aria-label="مهمتك الآن" data-testid="journey-current-mission">
        <div className={styles.missionKicker}><Target size={18} aria-hidden="true"/>مهمتك الآن</div><h2>{mission.title}</h2>
        <div className={styles.missionProgress}><span>{mission.context}</span><b dir="ltr">{mission.progressText}</b></div>
        <Progress value={mission.value} aria-label="تقدم المهمة الحالية"/>
        <p className={styles.nextAction}>{resolveMissionSource(mission, actionData.sources) ? "كمّل مهمتك عشان تفتح خطوتك الجاية" : mission.remaining}</p>
        <div className={styles.missionActions}>{missionReward && <strong className={styles.reward}><Gift size={16}/>{missionReward.amount} ج.م</strong>}
          <motion.button type="button" className={styles.missionCta} whileTap={reduce ? undefined : { scale: .97 }} onClick={() => openMission(mission)}>{resolveMissionSource(mission, actionData.sources) ? "كمّل المهمة" : "تفاصيل المهمة"}</motion.button>
        </div>
      </section>}
    </div>
    <Link href="/student/journey/achievements" className={styles.missionCta}>المكافآت والإنجازات والتقدير</Link>
    <Drawer open={selected !== null} onOpenChange={open => { if (!open) { setSelected(null); setSourceRecord(undefined); } }}>
      <DrawerContent className={styles.detailSheet} dir="rtl" style={accentStyle}>
        <DrawerClose className={styles.closeSheet} aria-label="إغلاق"><X size={20}/></DrawerClose>
        <div className={styles.sheetScroll}><div className={styles.sheetEmblem}><IdentityEmblem theme={theme} size={30}/></div>
        <DrawerTitle>{selectedReward ? "تفاصيل المكافأة" : selected === "source" ? sourceRecord?.type === "homework" ? "تفاصيل الواجب" : sourceRecord?.type === "exam" ? "تفاصيل الاختبار" : "تفاصيل الحصة" : selected?.startsWith("achievement:") ? "تفاصيل الإنجاز" : selected === "mission" ? "مهمتك الآن" : selectedState === "current" ? <><small className={styles.sheetEyebrow}>أنت هنا</small>{stage ?? selectedNode?.label}</> : selectedNode ? labelOf(selectedIndex) : ""}</DrawerTitle>
        <DrawerDescription>{selectedReward?.title ?? (selected === "source" ? sourceRecord?.title : selected?.startsWith("achievement:") ? selectedAchievement?.name : selected === "mission" ? mission?.title : selectedState === "current" ? selectedNode?.subtitle : selectedState === "completed" ? "مرحلة مكتملة" : selectedState === "locked" ? "مرحلة مقفلة" : "المرحلة القادمة")}</DrawerDescription>
        {selected === "source" && sourceRecord && <div className={styles.detailBlock}>{sourceRecord.fields.filter(field => meaningful(field.value)).map(field => <p key={field.label}><strong>{field.label}: </strong>{/تاريخ/.test(field.label) ? formatArabicDate(field.value) : field.value}</p>)}{sourceRecord.href && <Link href={sourceRecord.href} className={styles.missionCta}>{sourceRecord.actionLabel ?? "فتح السجل"}</Link>}</div>}
        {selectedReward && <div className={styles.detailBlock}>
          <p><strong>قيمة المكافأة: </strong>{selectedReward.amount} ج.م</p>
          {mission?.rewardId === selectedReward.id && <p><strong>المهمة المرتبطة: </strong>{mission.title}</p>}
          {meaningful(selectedReward.condition) && <p><strong>الشرط: </strong>{selectedReward.condition}</p>}
          {meaningful(selectedReward.funder) && <p><strong>المموّل: </strong>{selectedReward.funder}</p>}
          {meaningful(selectedReward.status) && <p><strong>حالة التمويل: </strong>{selectedReward.status}</p>}
          {typeof selectedReward.progress === "number" && <><p><strong>التقدم الحالي: </strong>{selectedReward.progress}%</p><Progress value={selectedReward.progress} aria-label="تقدم شرط المكافأة"/></>}
          {meaningful(selectedReward.releaseCondition) && <p><strong>شرط الصرف: </strong>{selectedReward.releaseCondition}</p>}{resolveStudentSource("reward",selectedReward.id)?.href && <Link href={resolveStudentSource("reward",selectedReward.id)!.href} className={styles.missionCta}>تفاصيل المكافأة وسجل شرطها</Link>}
        </div>}
        {selectedState === "current" && <div className={styles.identityMetadata}>
          {name && <span>هويتك: <strong>{name}</strong></span>}
          {view.currentIdentity && <span className={`${styles.health} ${atRisk ? styles.atRisk : ""}`}>{atRisk ? <TriangleAlert size={15}/> : <ShieldCheck size={15}/>}زخم الأسبوع: {atRisk ? "محتاج دفعة، وهويتك محفوظة" : "قوي"}</span>}
          {view.highestAchievedIdentity?.name && view.highestAchievedIdentity.id !== view.currentIdentity?.id && <span>أعلى هوية وصلت لها: <strong>{view.highestAchievedIdentity.name}</strong></span>}
        </div>}
        {selectedMission && <div className={styles.sheetMission}>
          <div className={styles.missionProgress}><strong>تقدمك</strong><b dir="ltr">{selectedMission.progressText}</b></div><Progress value={selectedMission.value} aria-label="تقدم المهمة"/>
          <div className={styles.missionKicker}><Target size={18}/>مهمتك الآن</div>
          <h3>{selectedMission.title}</h3>{selectedMission.context && <p>{selectedMission.context}</p>}
          {selectedMission.remaining && <p>{selectedMission.remaining}</p>}
          {resolveMissionReward(selectedMission, actionData.rewards) && <motion.button type="button" className={styles.rewardDetailsAction} whileTap={reduce ? undefined : { scale: .97 }} onClick={() => setSelected(`reward:${selectedMission.rewardId}`)}><Gift size={16}/>تفاصيل المكافأة · {resolveMissionReward(selectedMission, actionData.rewards)?.amount} ج.م</motion.button>}
        </div>}
        {selectedState !== "current" && selectedNode?.subtitle && <p className={styles.detailBlock}>{selectedNode.subtitle}</p>}
        {selectedAchievement && <div className={styles.detailBlock}>
          <strong>{selectedAchievement.name}</strong>
          {selectedAchievement.reason && <p>سبب الوصول: {selectedAchievement.reason}</p>}
          {selectedAchievement.source && <p>المصدر: {selectedAchievement.source}</p>}
          {selectedAchievement.evidence?.map((evidence, i) => <p key={i}>{evidence}</p>)}
          {selectedAchievement.achievedAt && <p>تاريخ الإنجاز: {formatArabicDate(selectedAchievement.achievedAt)}</p>}{resolveStudentSource("achievement",selectedAchievement.id)?.href && <Link href={resolveStudentSource("achievement",selectedAchievement.id)!.href} className={styles.missionCta}>فتح سجل الإنجاز</Link>}
        </div>}
        {selectedNode?.evidence?.map((evidence, i) => <p key={i} className={styles.detailBlock}>{evidence}</p>)}
        {selectedNode?.achievedAt && <p className={styles.detailBlock}>تاريخ الوصول: {formatArabicDate(selectedNode.achievedAt)}</p>}
        {selectedState === "current" && view.recoveryRequirements?.map(r => <p key={r.id} className={styles.detailBlock}>{r.label} · {r.state === "met" ? "تحقق" : "يحتاج اهتمام"}</p>)}
        {selectedNode?.requirements?.map((requirement, i) => <p key={i} className={styles.detailBlock}>{requirement}</p>)}
        {selectedState === "current" && distinctNextHint && <p className={styles.detailBlock}>{distinctNextHint}</p>}
        </div>
        {selectedMission && (selected !== "mission" || resolveMissionSource(selectedMission, actionData.sources)) && <footer className={styles.sheetFooter}><motion.button type="button" className={styles.missionCta} whileTap={reduce ? undefined : { scale: .97 }} onClick={() => openMission(selectedMission)}>{resolveMissionSource(selectedMission, actionData.sources) ? "كمّل المهمة" : "تفاصيل المهمة"}</motion.button></footer>}
      </DrawerContent>
    </Drawer>
  </div>;
}
export function JourneyRoadmapScreen() {

  return <div className={styles.page}><StudentV101Shell active="journey"><LearningRoadmapV2/></StudentV101Shell></div>;
}
