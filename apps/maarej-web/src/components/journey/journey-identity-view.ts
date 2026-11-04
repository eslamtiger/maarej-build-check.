import type { IdentityRef, JourneyNode, JourneyNodeStatus, StudentIdentityView } from "@/data/student-v105-identity-view";
import type { LandmarkState } from "./journey-landmark";
import type { IdentityTheme } from "./journey-theme";

export type IdentityTrait = { id: string; label: string; value?: string; symbol?: "learning" | "commitment" | "cooperation" };
export type JourneyNodeSource = Omit<JourneyNode, "status"> & {
  status?: JourneyNodeStatus;
  state?: LandmarkState | JourneyNodeStatus;
  subtitle?: string;
  identityId?: string;
  stageId?: string;
  relatedRewardId?: string;
  relatedAchievementId?: string;
  requirements?: readonly string[];
  evidence?: readonly string[];
};
export type JourneyIdentitySource = Omit<StudentIdentityView, "journeyNodes" | "currentIdentity"> & {
  currentIdentity: (IdentityRef & { traits?: readonly IdentityTrait[]; identityTheme?: Partial<IdentityTheme> }) | null;
  traits?: readonly IdentityTrait[];
  journeyNodes: JourneyNodeSource[];
};
export type JourneyViewNode = Omit<JourneyNodeSource, "status" | "state"> & { state: LandmarkState; attention: boolean };
export const availableIdentityText = (value?: string | null): string | null => {
  const text = value?.trim();
  return text && !/^\[.*\]$/.test(text) ? text : null;
};
function nodeState(node: JourneyNodeSource): LandmarkState {
  const state = node.state ?? node.status;
  if (state === "active" || state === "atRisk" || state === "current") return "current";
  if (state === "completed" || state === "locked" || state === "challenge" || state === "next") return state;
  return state === "upcoming" ? node.type === "mission" ? "challenge" : "next" : "locked";
}
// Route-scoped adapter for the existing identity view. No names, thresholds,
// traits or milestone count are supplied by the visual component.
export function bindJourneyIdentity(source: JourneyIdentitySource) {
  return {
    ...source,
    currentIdentity: source.currentIdentity ? { ...source.currentIdentity, name: availableIdentityText(source.currentIdentity.name) } : null,
    currentStage: availableIdentityText(source.currentStage),
    currentDirection: availableIdentityText(source.currentDirection),
    highestAchievedIdentity: source.highestAchievedIdentity ? { ...source.highestAchievedIdentity, name: availableIdentityText(source.highestAchievedIdentity.name) } : null,
    traits: (source.traits ?? source.currentIdentity?.traits ?? []).filter(trait => availableIdentityText(trait.label)),
    journeyNodes: source.journeyNodes.map((node): JourneyViewNode => ({
      ...node,
      state: nodeState(node),
      attention: (node.state ?? node.status) === "atRisk",
      identityId: node.identityId ?? node.relatedIdentityId,
      stageId: node.stageId ?? node.relatedStageId,
    })),
  };
}
