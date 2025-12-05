"use client";

import { getSubject } from "@/lib/api";
import { useEffect, useState } from "react";

type Subject = {
  course: string;
  href: string;
};

export function useSubjects(campus: string, faculty?: string) {
  const [fetchSubjects, setFetchSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    if (!campus) return;
    setLoadingSubjects(true);
    getSubject(campus, faculty || "")
      .then(setFetchSubjects)
      .catch(console.error)
      .finally(() => setLoadingSubjects(false))
  }, [campus, faculty]);

  return { fetchSubjects, loadingSubjects };
}