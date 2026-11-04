"use client";

import { BookOpenCheck, Target } from "lucide-react";
import type { StudentIdentityView } from "@/data/student-v105-identity-view";
import { IdentityEmblem, type IdentityVisualConfig } from "./identity-emblem";
import { IdentityStatus } from "./identity-status";

export function IdentityScene({ view, visual }: { view: StudentIdentityView; visual: IdentityVisualConfig }) {
  return <section className={`v1052-identity-scene state-${view.status}`}>
    <span className="v1052-scene-geometry scene-line-a"/><span className="v1052-scene-geometry scene-line-b"/>
    <div className="v1052-scene-copy">
      <small>رحلتي</small>
      <span>هويتك الحالية</span>
      <h1>{view.currentIdentity?.name ?? "هوية غير محددة"}</h1>
      <p>{view.currentDirection ?? "التوجه غير محدد"}</p>
      <IdentityStatus view={view}/>
      <div className="v1052-scene-academic"><BookOpenCheck size={15}/><span>رحلة نمو مرتبطة بتعلمك والتزامك</span></div>
      {view.status === "downgraded" ? <div className="v1052-scene-history"><Target size={14}/><span><small>أعلى لقب حققته</small><b>{view.highestAchievedIdentity?.name ?? "—"}</b></span></div> : null}
    </div>
    <div className="v1052-scene-emblem"><IdentityEmblem config={visual} status={view.status}/></div>
  </section>;
}
