"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PerformanceRouteRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/student/learning/performance"); }, [router]);
  return null;
}
