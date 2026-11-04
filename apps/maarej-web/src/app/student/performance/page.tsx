import Link from "next/link";
import { PerformanceRouteRedirect } from "@/components/student/performance/performance-route-redirect";
export default function PerformancePage() {
  return <><meta httpEquiv="refresh" content="0;url=/student/learning/performance"/><PerformanceRouteRedirect/><Link href="/student/learning/performance">الانتقال إلى أدائي في تعلّمي</Link></>;
}
