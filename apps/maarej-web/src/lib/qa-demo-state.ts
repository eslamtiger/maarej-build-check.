"use client";

import { useEffect, useState } from "react";
import { qaDefaults, type FundingSource, type StudentType } from "@/data/student-v103-view";

const STUDENT_KEY = "maarej-qa-student-type";
const FUNDING_KEY = "maarej-qa-funding-source";

export function readQaDemoState() {
  if (typeof window === "undefined") return qaDefaults;
  const studentType = window.localStorage.getItem(STUDENT_KEY) as StudentType | null;
  const fundingSource = window.localStorage.getItem(FUNDING_KEY) as FundingSource | null;
  return {
    studentType: studentType === "independent" || studentType === "dependent" ? studentType : qaDefaults.studentType,
    fundingSource: fundingSource === "self" || fundingSource === "parent" ? fundingSource : qaDefaults.fundingSource,
  };
}

export function writeQaDemoState(studentType: StudentType, fundingSource: FundingSource) {
  window.localStorage.setItem(STUDENT_KEY, studentType);
  window.localStorage.setItem(FUNDING_KEY, fundingSource);
  window.dispatchEvent(new Event("maarej-qa-change"));
}

export function resetQaDemoState() {
  window.localStorage.removeItem(STUDENT_KEY);
  window.localStorage.removeItem(FUNDING_KEY);
  window.dispatchEvent(new Event("maarej-qa-change"));
}

export function useQaDemoState() {
  const [state, setState] = useState(qaDefaults);
  useEffect(() => {
    const sync = () => setState(readQaDemoState());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("maarej-qa-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("maarej-qa-change", sync);
    };
  }, []);
  return state;
}
