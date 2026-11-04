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
  primaryAccent: "#635BDF",
  secondaryAccent: "#219EBC",
  symbol: "spark",
  shapeVariant: "hex",
};
const visualBlue: IdentityVisualThemeConfig = {
  primaryAccent: "#167C9C",
  secondaryAccent: "#635BDF",
  symbol: "compass",
  shapeVariant: "orb",
};

const baseNodes: JourneyNodeSource[] = [
  { id: "journey-older", type: "milestone", label: "انطلاقة منظمة", subtitle: "خطة دراسية", state: "completed", stageId: "demo-start", identityId: "identity-current", achievedAt: "2026-09-18", evidence: ["سجّل الطالب خطته وتابع أول واجب."] },
  { id: "journey-previous", type: "milestone", label: "تعلّم مستمر", subtitle: "متابعة الواجبات", state: "completed", stageId: "demo-learning", identityId: "identity-current", achievedAt: "2026-09-25", relatedAchievementId: "ملتزم", evidence: ["أنجز الطالب واجباته وتابع دروس المجموعة."] },
  { id: "journey-current", type: "identity", label: "ثبات أسبوعي", subtitle: "حضور منتظم", state: "current", stageId: "demo-consistency", identityId: "identity-current", relatedMissionId: "current-mission", achievedAt: "2026-09-28" },
  { id: "journey-transition", type: "mission", label: "المشاركة بثقة", subtitle: "تحدّي المجموعة", state: "challenge", stageId: "demo-participation", identityId: "identity-current", relatedMissionId: "current-mission", relatedRewardId: "attendance", relatedAchievementId: "مبادر", requirements: ["أكمل الحصة القادمة في مجموعة التفوق، ثم تابع نشاط المشاركة."] },
  { id: "journey-next", type: "next", label: "مراجعة بإتقان", subtitle: "تثبيت الفهم", state: "next", stageId: "demo-review", identityId: "identity-current", requirements: ["متابعة نشاط المشاركة، ثم حل ورقة المراجعة في المجموعة."] },
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
    nextMilestone: "كمّل مهمتك الحالية لتفتح خطوتك التالية",
    journeyNodes: baseNodes,
  },
  atRisk: {
    currentIdentity: { id: "identity-current", name: "ملتزم", visualTheme: visualIndigo, traits: demoTraits },
    highestAchievedIdentity: { id: "identity-current", name: "ملتزم", visualTheme: visualIndigo },
    currentDirection: "تعلّم بالممارسة",
    currentStage: "ثبات أسبوعي",
    status: "atRisk",
    nextMilestone: "راجع متطلبات الحفاظ المرتبطة بهويتك",
    recoveryRequirements: [],
    journeyNodes: baseNodes.map((node) => node.id === "journey-current" ? { ...node, state: "atRisk" as const } : node),
  },
  downgraded: {
    currentIdentity: { id: "identity-current-lower", name: "متعلّم", visualTheme: visualBlue, traits: demoTraits },
    highestAchievedIdentity: { id: "identity-highest", name: "ملتزم", visualTheme: visualIndigo },
    currentDirection: "تعلّم بالممارسة",
    currentStage: "استعادة الانتظام",
    status: "downgraded",
    nextMilestone: "استعد لقبك السابق عند تحقق متطلبات الاستعادة المعتمدة",
    recoveryRequirements: [],
    journeyNodes: baseNodes.map((node) => {
      if (node.id === "journey-previous") return { ...node, label: "أعلى إنجاز محفوظ" };
      if (node.id === "journey-current") return { ...node, label: "استعادة الانتظام", identityId: "identity-current-lower" };
      return node;
    }),
  },
};

export const defaultIdentityView = identityDemoViews.active;
