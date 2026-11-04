import type { StudentIdentityView } from "@/data/student-v105-identity-view";

const labels = {
  active: "مستقر",
  atRisk: "يحتاج اهتمام",
  downgraded: "قابل للاستعادة",
  restored: "مستعاد",
} as const;

export function IdentityStatus({ view }: { view: StudentIdentityView }) {
  return <span className={`v1051-status-chip status-${view.status}`}>{labels[view.status]}</span>;
}
