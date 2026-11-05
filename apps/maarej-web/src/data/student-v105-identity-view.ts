import type { JourneyIdentitySource, JourneyNodeSource } from "@/components/journey/journey-identity-view";
export type IdentityStatus = "active" | "atRisk" | "downgraded" | "restored";
export type JourneyNodeStatus = "completed" | "active" | "upcoming" | "locked" | "atRisk";

export type IdentityVisualThemeConfig = {
  primaryAccent: string;
  secondaryAccent: string;
  symbol?: "spark" | "compass" | "diamond";
  shapeVariant?: "orb" | "diamond" | "hex" | "crest";
};

export type IdentityRef = {
  id: string;
  name: string;
  visualTheme?: IdentityVisualThemeConfig;
};

export type JourneyNode = {
  id: string;
  type: "milestone" | "identity" | "mission" | "next";
  label: string;
  status: JourneyNodeStatus;
  achievedAt?: string;
  relatedIdentityId?: string;
  relatedStageId?: string;
  relatedMissionId?: string;
  relatedBadgeId?: string;
};

export type StudentIdentityView = {
  currentIdentity: IdentityRef | null;
  highestAchievedIdentity: IdentityRef | null;
  currentDirection: string | null;
  currentStage: string | null;
  status: IdentityStatus;
  stageProgress?: number;
  nextMilestone?: string | null;
  recoveryRequirements?: Array<{ id: string; label: string; state: "met" | "needsAttention" }>;
  journeyNodes: JourneyNode[];
};

const visualIndigo: IdentityVisualThemeConfig = {
  primaryAccent: "#4B3FD6",
  secondaryAccent: "#8A81F0",
  symbol: "spark",
  shapeVariant: "hex",
};

const baseNodes: JourneyNodeSource[] = [
  { id: "journey-older", type: "milestone", label: "انطلاقة منظمة", subtitle: "خطة دراسية", state: "completed", stageId: "demo-start", identityId: "identity-current", achievedAt: "2026-09-18", evidence: ["سجّلت خطتك وتابعت أول واجب."] },
  { id: "journey-previous", type: "milestone", label: "تعلّم مستمر", subtitle: "متابعة الواجبات", state: "completed", stageId: "demo-learning", identityId: "identity-current", achievedAt: "2026-09-25", relatedAchievementId: "ملتزم", evidence: ["خلّصت واجباتك وتابعت دروس المجموعة."] },
  { id: "journey-current", type: "identity", label: "ثبات أسبوعي", subtitle: "حضور منتظم", state: "current", stageId: "demo-consistency", identityId: "identity-current", relatedMissionId: "current-mission", achievedAt: "2026-09-28" },
  { id: "journey-transition", type: "mission", label: "المشاركة بثقة", subtitle: "تحدّي المجموعة", state: "challenge", stageId: "demo-participation", identityId: "identity-current", relatedMissionId: "current-mission", relatedRewardId: "attendance", relatedAchievementId: "مبادر", requirements: ["احضر الحصة الجاية في مجموعة التفوق، وبعدها شارك في نشاط المجموعة."] },
  { id: "journey-next", type: "next", label: "مراجعة بإتقان", subtitle: "تثبيت الفهم", state: "next", stageId: "demo-review", identityId: "identity-current", requirements: ["بعد نشاط المشاركة، حل ورقة المراجعة مع المجموعة."] },
  { id: "journey-locked", type: "next", label: "مبادرة بالتعلّم", subtitle: "محطة مستقبلية", state: "locked", stageId: "demo-initiative", identityId: "identity-current" },
];
const demoTraits = [
  { id: "trait-learning", label: "التعلم", value: "قوي", symbol: "learning" as const },
  { id: "trait-commitment", label: "الالتزام", value: "ممتاز", symbol: "commitment" as const },
  { id: "trait-cooperation", label: "التعاون", value: "جيد", symbol: "cooperation" as const },
];

// Presentation/QA seed only. Identity names, counts, thresholds, maintenance periods,
// and progression formulas stay configurable and are not product rules.
export const identityDemoViews: Record<"active" | "atRisk" | "downgraded", JourneyIdentitySource> = {
  active: {
    currentIdentity: { id: "identity-current", name: "ملتزم", visualTheme: visualIndigo, traits: demoTraits },
    highestAchievedIdentity: { id: "identity-current", name: "ملتزم", visualTheme: visualIndigo },
    currentDirection: "تعلّم بالممارسة",
    currentStage: "ثبات أسبوعي",
    status: "active",
    nextMilestone: "كمّل مهمتك الحالية عشان تفتح خطوتك الجاية",
    journeyNodes: baseNodes,
  },
  atRisk: {
    currentIdentity: { id: "identity-current", name: "ملتزم", visualTheme: visualIndigo, traits: demoTraits },
    highestAchievedIdentity: { id: "identity-current", name: "ملتزم", visualTheme: visualIndigo },
    currentDirection: "تعلّم بالممارسة",
    currentStage: "ثبات أسبوعي",
    status: "atRisk",
    nextMilestone: "أسبوع هادي؟ حضور الحصة الجاية وتسليم واجب واحد يرجّعوا زخمك",
    recoveryRequirements: [],
    journeyNodes: baseNodes,
  },
  // Brief §13: identity never drops. This QA mode keeps the identity and only shows low momentum.
  downgraded: {
    currentIdentity: { id: "identity-current", name: "ملتزم", visualTheme: visualIndigo, traits: demoTraits },
    highestAchievedIdentity: { id: "identity-current", name: "ملتزم", visualTheme: visualIndigo },
    currentDirection: "تعلّم بالممارسة",
    currentStage: "ثبات أسبوعي",
    status: "downgraded",
    nextMilestone: "زخمك قلّ الفترة دي، وهويتك زي ما هي. ابدأ بخطوة واحدة النهارده",
    recoveryRequirements: [],
    journeyNodes: baseNodes,
  },
};

export const defaultIdentityView = identityDemoViews.active;
