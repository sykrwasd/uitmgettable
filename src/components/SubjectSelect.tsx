"use client";

import Select from "react-select";
import { useState, useEffect } from "react";
import { rsStyles } from "@/components/CampusSelect";

type Subject = {
  course: string;
  href: string;
};

interface SubjectProps {
  loadingSubjects: boolean;
  fetchSubjects: Subject[];
  setSubjectName: (value: string) => void;
}

export default function SubjectSelect({
  loadingSubjects,
  fetchSubjects,
  setSubjectName,
}: SubjectProps) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <Select
        options={fetchSubjects.map((row) => ({
          value: row.course.replace(/\./g, "").trim(),
          label: row.course.replace(/\./g, "").trim(),
        }))}
        onChange={(selected) => setSubjectName(selected?.value ?? "")}
        placeholder={loadingSubjects ? "Loading subjects…" : "Select Subject"}
        className="w-full"
        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
        styles={{ menuPortal: (base: object) => ({ ...base, zIndex: 9999 }), ...rsStyles(dark) }}
        isLoading={loadingSubjects}
        instanceId="subject-select"
      />
    </div>
  );
}
