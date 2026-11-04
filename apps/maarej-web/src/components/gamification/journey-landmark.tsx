"use client";

import { BookOpenCheck, Check, Flag, LockKeyhole, ShieldAlert, Target } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { JourneyNode } from "@/data/student-v105-identity-view";

function NodeIcon({ node }: { node: JourneyNode }) {
  if (node.status === "completed") return <Check/>;
  if (node.status === "locked") return <LockKeyhole/>;
  if (node.status === "atRisk") return <ShieldAlert/>;
  if (node.status === "active") return <Target/>;
  if (node.type === "mission") return <BookOpenCheck/>;
  return <Flag/>;
}

export function JourneyLandmark({
  node,
  x,
  y,
  canvasWidth = 360,
  canvasHeight = 480,
  labelSide = "below",
  onOpen,
}: {
  node: JourneyNode;
  x: number;
  y: number;
  canvasWidth?: number;
  canvasHeight?: number;
  labelSide?: "above" | "below" | "side";
  onOpen?: (node: JourneyNode) => void;
}) {
  const reduce = useReducedMotion();
  const active = node.status === "active" || node.status === "atRisk";
  const style = { left: `${(x / canvasWidth) * 100}%`, top: `${(y / canvasHeight) * 100}%` };
  const content = <>
    <span className="v1053-landmark-base"/>
    <motion.span className="v1053-landmark-node" initial={reduce ? false : { scale: active ? .95 : .98 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : active ? .28 : .18 }}><NodeIcon node={node}/></motion.span>
    {active ? <em>أنت هنا</em> : null}
    <b>{node.label}</b>
    {node.status === "atRisk" ? <i className="v1053-risk-satellite" aria-label="اللقب يحتاج اهتمام"/> : null}
  </>;

  return <motion.div
    className={`v1053-landmark state-${node.status} label-${labelSide} type-${node.type} ${onOpen ? "is-interactive" : ""}`}
    style={style}
    initial={reduce ? false : { opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: reduce ? 0 : .18 }}
  >
    {onOpen ? <button type="button" onClick={() => onOpen(node)} aria-label={`تفاصيل ${node.label}`}>{content}</button> : content}
  </motion.div>;
}
