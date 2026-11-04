export type MissionSourceType = "homework" | "session" | "exam" | "attendanceTarget";
export type MissionRecord = {
  id: string; title: string; context?: string; value: number; progressText: string;
  remaining?: string; sourceType?: MissionSourceType; sourceId?: string; rewardId?: string;
};
export type SourceRecord = {
  id: string; type: MissionSourceType | "payment" | "achievement" | "teacherUpdate"; title: string;
  href?: string; actionLabel?: string;
  fields: readonly { label: string; value: string }[];
};
export type RewardRecord = {
  id: string; amount: number; title: string; condition?: string; funder?: string;
  status?: string; progress?: number; releaseCondition?: string;
};
export type AchievementRecord = {
  id: string; name: string; reason?: string; source?: string;
  evidence?: readonly string[]; achievedAt?: string | null; state?: string;
};
export type JourneyActionData = {
  currentMissionId?: string; missions: readonly MissionRecord[];
  sources: readonly SourceRecord[]; rewards: readonly RewardRecord[];
  achievements: readonly AchievementRecord[];
};
export function resolveMissionSource(mission: MissionRecord | undefined, records: readonly SourceRecord[]) {
  if (!mission?.sourceType || !mission.sourceId) return undefined;
  return records.find(record => record.id === mission.sourceId && (
    record.type === mission.sourceType || mission.sourceType === "attendanceTarget" && record.type === "session"
  ));
}
export function resolveMissionReward(mission: MissionRecord | undefined, rewards: readonly RewardRecord[]) {
  return mission?.rewardId ? rewards.find(reward => reward.id === mission.rewardId) : undefined;
}
