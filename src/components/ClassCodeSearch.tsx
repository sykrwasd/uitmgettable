"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import { parseDayTime } from "@/lib/parseTime";
import { rsStyles } from "@/components/CampusSelect";

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

type RawClass = {
  day_time: string;
  group: string;
  mode: string;
  status: string;
  room: string;
  program: string;
  faculty: string;
};

type CampusData = Record<string, RawClass[]>;

type SelectedClass = {
  no: string;
  day_time: string;
  class_code: string;
  mode: string;
  attempt: string;
  venue: string;
  subject_code: string;
  faculty: string;
  subject_name: string;
  day: string;
  timeSlot: string;
};

type Campus = { id: string; text: string };

interface Props {
  fetchCampus: Campus[];
  loadingCampus: boolean;
  onAddClasses: (classes: SelectedClass[]) => void;
}


export default function ClassCodeSearch({ fetchCampus, loadingCampus, onAddClasses }: Props) {
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [isSelangor, setIsSelangor] = useState(false);
  const dark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const [campusData, setCampusData] = useState<CampusData | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [checkedSubjects, setCheckedSubjects] = useState<Set<string>>(new Set());

  // Derive file name
  const getFile = () => {
    if (!campus) return null;
    if (campus === "B") return faculty ? `B_${faculty}` : null;
    return campus;
  };

  // Load campus JSON when campus/faculty changes
  useEffect(() => {
    const file = getFile();
    if (!file) { setCampusData(null); return; }
    setLoadingData(true);
    setSelectedCode(null);
    setCampusData(null);
    fetch(`/timetable/${file}.json`)
      .then((r) => r.json())
      .then((data) => { setCampusData(data); setLoadingData(false); })
      .catch(() => setLoadingData(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campus, faculty]);

  // Build class code options from loaded campus data
  const classCodeOptions = campusData
    ? Array.from(
        new Set(
          Object.values(campusData)
            .flat()
            .map((c) => c.group?.trim())
            .filter(Boolean)
        )
      )
        .sort()
        .map((code) => ({ value: code, label: code }))
    : [];

  // Preview: all subjects that contain this class code
  const preview = selectedCode && campusData
    ? Object.entries(campusData).flatMap(([subjectKey, classes]) => {
        const subject = subjectKey.startsWith(".") ? subjectKey.slice(1) : subjectKey;
        return classes
          .filter((c) => c.group?.trim() === selectedCode)
          .map((c) => ({ subject, ...c }));
      })
    : [];

  // Unique subjects in preview
  const uniquePreviewSubjects = Array.from(new Set(preview.map((e) => e.subject)));

  // When preview changes, check all by default
  useEffect(() => {
    setCheckedSubjects(new Set(preview.map((e) => e.subject)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCode]);

  const handleAdd = () => {
    if (!preview.length || !selectedCode) return;
    const classes: SelectedClass[] = preview
      .filter((entry) => checkedSubjects.has(entry.subject))
      .flatMap((entry, idx) => {
        const parsed = parseDayTime(entry.day_time);
        if (!parsed) return [];
        return [{
          no: `${idx + 1}.`,
          day_time: entry.day_time,
          // Use subject as class_code so each subject can be independently removed
          class_code: entry.subject,
          mode: entry.mode,
          attempt: entry.status,
          venue: entry.room,
          subject_code: entry.subject,
          faculty: entry.faculty || campus,
          subject_name: entry.subject,
          day: parsed.day,
          timeSlot: parsed.timeSlot,
        }];
      });
    if (!classes.length) { return; }
    onAddClasses(classes);
    setSelectedCode(null);
  };

  return (
    <div className="space-y-3">
      {/* Campus select */}
      {loadingCampus ? (
        <p className="text-sm text-gray-500">Loading campuses...</p>
      ) : (
        <Select
          options={[
            { value: "B - SELANGOR CAMPUS", label: "B - SELANGOR CAMPUS (Shah Alam)" },
            ...fetchCampus.map((c) => ({ value: c.text, label: c.text })),
          ]}
          onChange={(opt) => {
            const val = opt?.value ?? "";
            if (!val) { setCampus(""); setIsSelangor(false); setFaculty(""); return; }
            if (val === "B - SELANGOR CAMPUS") { setCampus("B"); setIsSelangor(true); setFaculty(""); }
            else { setCampus(val.split(" - ")[0]?.trim() ?? val); setIsSelangor(false); setFaculty(""); }
          }}
          placeholder="Select Campus"
          isClearable
          instanceId="ccs-campus"
          menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
          styles={rsStyles(dark)}
        />
      )}

      {/* Faculty select for Selangor */}
      {isSelangor && (
        <Select
          options={SELANGOR_FACULTIES.map((f) => ({ value: f.id, label: f.text }))}
          onChange={(opt) => setFaculty(opt?.value ?? "")}
          value={faculty ? { value: faculty, label: SELANGOR_FACULTIES.find(f => f.id === faculty)?.text ?? faculty } : null}
          placeholder="Select Faculty"
          isClearable
          instanceId="ccs-faculty"
          menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
          styles={rsStyles(dark)}
        />
      )}

      {/* Class code search — only once campus (and faculty if Selangor) is chosen */}
      {getFile() && (
        <Select
          options={classCodeOptions}
          onChange={(opt) => setSelectedCode(opt?.value ?? null)}
          value={selectedCode ? { value: selectedCode, label: selectedCode } : null}
          placeholder={loadingData ? "Loading classes…" : "Search class code e.g. CS1101B"}
          isLoading={loadingData}
          isSearchable
          isClearable
          instanceId="class-code-search"
          menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
          styles={rsStyles(dark)}
        />
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-white/80 dark:bg-white/10 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
          <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{selectedCode}</span>
              <span className="text-xs text-blue-500 dark:text-blue-400 ml-1">
                — {uniquePreviewSubjects.length} subjects, {checkedSubjects.size} selected
              </span>
            </div>
            <button
              onClick={handleAdd}
              disabled={checkedSubjects.size === 0}
              className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition disabled:opacity-40 shrink-0"
            >
              Add selected
            </button>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/5 max-h-64 overflow-y-auto">
            {uniquePreviewSubjects.map((subject) => {
              const sessions = preview.filter((e) => e.subject === subject);
              const checked = checkedSubjects.has(subject);
              return (
                <label key={subject} className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setCheckedSubjects((prev) => {
                        const next = new Set(prev);
                        if (checked) next.delete(subject); else next.add(subject);
                        return next;
                      });
                    }}
                    className="mt-0.5 w-4 h-4 accent-blue-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-100">{subject}</div>
                    {sessions.map((s, i) => (
                      <div key={i} className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {s.day_time}{s.room ? ` · ${s.room}` : ""}
                      </div>
                    ))}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
