"use client"; // make sure this component only runs on the client

import Select from "react-select";
import { useEffect, useState } from "react";

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
  // fix hydration: only render portalTarget on client
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

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
        menuPortalTarget={isClient ? document.body : undefined} 
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (base) => ({ ...base, backgroundColor: "white", borderColor: "#d1d5db" }),
          menu: (base) => ({ ...base, backgroundColor: "white" }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#eff6ff" : "white",
            color: state.isSelected ? "white" : "#111827",
          }),
          singleValue: (base) => ({ ...base, color: "#111827" }),
          placeholder: (base) => ({ ...base, color: "#6b7280" }),
          input: (base) => ({ ...base, color: "#111827" }),
        }}
        isLoading={loadingSubjects} 
        instanceId="subject-select" // fix SSR id mismatch
      />
    </div>
  );
}
