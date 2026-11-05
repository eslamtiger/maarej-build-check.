"use client";
// Demo profile: the seed identity plus any edits the student saved on this device.
import { studentDemo } from "@/data/student-v101";
import { identityDemoViews } from "@/data/student-v105-identity-view";
import { useStudentAppState, updateStudentAppState, type StudentProfileEdits } from "./student-app-state";

export const avatarColors = ["#FFB53D", "#6F63FF", "#22C08A", "#FF6B8A", "#3FB6FF"] as const;
export const studentStages = ["الصف الأول الإعدادي", "الصف الثاني الإعدادي", "الصف الثالث الإعدادي", "الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"] as const;

export function useStudentProfile() {
  const app = useStudentAppState();
  const edits = app.profile ?? {};
  const identity = identityDemoViews.active;
  return {
    name: edits.name?.trim() || studentDemo.identity.name,
    stage: edits.stage || studentDemo.identity.stage,
    city: edits.city ?? "",
    school: edits.school ?? "",
    bio: edits.bio ?? "",
    avatarColor: edits.avatarColor || avatarColors[0],
    identityName: identity.currentIdentity?.name ?? null,
    identityStage: identity.currentStage,
  };
}
export function saveStudentProfile(edits: StudentProfileEdits) {
  updateStudentAppState(state => ({ ...state, profile: { ...state.profile, ...edits } }));
}
