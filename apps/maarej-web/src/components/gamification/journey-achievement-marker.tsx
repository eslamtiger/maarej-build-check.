import { Award } from "lucide-react";

export function JourneyAchievementMarker({ label }: { label: string }) {
  return <div className="v1052-achievement-marker"><span><Award size={16}/></span><div><small>تقدير قريب</small><b>{label}</b></div></div>;
}
