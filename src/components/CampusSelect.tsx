"use client";
import Select from "react-select";
import { useState, useEffect } from "react";

const SELANGOR_FACULTIES = [
  { id: "AA", text: "AA - ARSHAD AYUB GRADUATE BUSINESS SCHOOL" },
  { id: "AC", text: "AC - FACULTY OF ACCOUNTANCY" },
  { id: "AD", text: "AD - FACULTY OF ART AND DESIGN" },
  { id: "AM", text: "AM - FACULTY OF ADMINISTRATIVE SCIENCE AND POLICY STUDIES" },
  { id: "AP", text: "AP - FACULTY OF ARCHITECTURE, PLANNING AND SURVEYING" },
  { id: "AS", text: "AS - FACULTY OF APPLIED SCIENCES" },
  { id: "BA", text: "BA - FACULTY OF BUSINESS AND MANAGEMENT" },
  { id: "BE", text: "BE - FACULTY OF BUILT ENVIRONMENT" },
  { id: "BM", text: "BM - FACULTY OF BUSINESS MANAGEMENT" },
  { id: "CA", text: "CA - COLLEGE OF CREATIVE ARTS" },
  { id: "CD", text: "CD - COLLEGE OF COMPUTING, INFORMATICS AND MATHEMATICS" },
  { id: "CE", text: "CE - COLLEGE OF ENGINEERING" },
  { id: "CF", text: "CF - COLLEGE OF BUILT ENVIRONMENT" },
  { id: "CP", text: "CP - INSTI OF CONTINUING EDUCATION & PROFESSIONAL STUDIES" },
  { id: "CS", text: "CS - FACULTY OF COMPUTER AND MATHEMATICAL SCIENCES" },
  { id: "DS", text: "DS - FACULTY OF DENTISTRY" },
  { id: "EC", text: "EC - FACULTY OF CIVIL ENGINEERING" },
  { id: "ED", text: "ED - FACULTY OF EDUCATION" },
  { id: "EE", text: "EE - FACULTY OF ELECTRICAL ENGINEERING" },
  { id: "EH", text: "EH - FACULTY OF CHEMICAL ENGINEERING" },
  { id: "EM", text: "EM - FACULTY OF MECHANICAL ENGINEERING" },
  { id: "FF", text: "FF - FACULTY OF FILM, THEATRE AND ANIMATION" },
  { id: "HM", text: "HM - FACULTY OF HOTEL AND TOURISM MANAGEMENT" },
  { id: "HS", text: "HS - FACULTY OF HEALTH SCIENCES" },
  { id: "IC", text: "IC - ACADEMY OF CONTEMPORARY ISLAMIC STUDIES" },
  { id: "IM", text: "IM - FACULTY OF INFORMATION MANAGEMENT" },
  { id: "IN", text: "IN - INTERNATIONAL" },
  { id: "LG", text: "LG - ACADEMY OF LANGUAGE STUDIES" },
  { id: "LT", text: "LT - MALAYSIA INSTITUTE OF TRANSPORT" },
  { id: "LW", text: "LW - FACULTY OF LAW" },
  { id: "MC", text: "MC - FACULTY OF COMMUNICATION AND MEDIA STUDIES" },
  { id: "MD", text: "MD - FACULTY OF MEDICINE" },
  { id: "MU", text: "MU - FACULTY OF MUSIC" },
  { id: "PH", text: "PH - FACULTY OF PHARMACY" },
  { id: "SI", text: "SI - FACULTY OF INFORMATION SCIENCE" },
  { id: "SR", text: "SR - FACULTY OF SPORTS SCIENCE AND RECREATION" },
];

type Campus = { id: string; text: string };

interface CampusProps {
  loadingCampus: boolean;
  fetchCampus: Campus[];
  selangor: boolean;
  handleCampusChange: (value: string) => void;
  setFaculty: (value: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchFaculty: any[];
}

export const rsStyles = (dark: boolean) => ({
  control: (b: object) => ({ ...b, backgroundColor: dark ? "#1f2937" : "white", borderColor: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", boxShadow: "none" }),
  menu: (b: object) => ({ ...b, backgroundColor: dark ? "#1f2937" : "white", zIndex: 9999 }),
  option: (b: object, s: { isSelected: boolean; isFocused: boolean }) => ({
    ...b,
    backgroundColor: s.isSelected ? "#3b82f6" : s.isFocused ? (dark ? "#374151" : "#eff6ff") : (dark ? "#1f2937" : "white"),
    color: s.isSelected ? "white" : (dark ? "#f3f4f6" : "#111827"),
  }),
  singleValue: (b: object) => ({ ...b, color: dark ? "#f3f4f6" : "#111827" }),
  placeholder: (b: object) => ({ ...b, color: dark ? "#9ca3af" : "#6b7280" }),
  input: (b: object) => ({ ...b, color: dark ? "#f3f4f6" : "#111827" }),
});

export function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export default function CampusSelect({
  loadingCampus,
  fetchCampus,
  handleCampusChange,
  selangor,
  setFaculty,
}: CampusProps) {
  const dark = useDark();

  const campusOptions = [
    { value: "B - SELANGOR CAMPUS", label: "B - SELANGOR CAMPUS (Shah Alam)" },
    ...fetchCampus.map((c) => ({ value: c.text, label: c.text })),
  ];

  const facultyOptions = SELANGOR_FACULTIES.map((f) => ({ value: f.id, label: f.text }));

  if (loadingCampus) return <p className="text-gray-500 text-sm">Loading campuses...</p>;

  return (
    <div className="space-y-3">
      <Select
        options={campusOptions}
        onChange={(opt) => handleCampusChange(opt?.value ?? "")}
        placeholder="Select Campus"
        isClearable
        instanceId="campus-select"
        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
        styles={rsStyles(dark)}
      />
      {selangor && (
        <Select
          options={facultyOptions}
          onChange={(opt) => setFaculty(opt?.value ?? "")}
          placeholder="Select Faculty"
          isClearable
          instanceId="faculty-select"
          menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
          styles={rsStyles(dark)}
        />
      )}
    </div>
  );
}
