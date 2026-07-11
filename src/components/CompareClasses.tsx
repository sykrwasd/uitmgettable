"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import { parseDayTime } from "@/lib/parseTime";
import { rsStyles, useDark } from "@/components/CampusSelect";

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

export type CompareState = {
  campus: string;
  faculty: string;
  codes: string[];
};

type RawClass = { day_time: string; group: string; room: string; program: string; faculty: string; mode: string; status: string };
type CampusData = Record<string, RawClass[]>;

type Campus = { id: string; text: string };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const COLORS = [
  "#3b82f6", "#f97316", "#10b981", "#8b5cf6",
  "#ef4444", "#f59e0b", "#06b6d4", "#ec4899",
];


function getEntries(data: CampusData, code: string) {
  return Object.entries(data).flatMap(([subjectKey, classes]) => {
    const subject = subjectKey.startsWith(".") ? subjectKey.slice(1) : subjectKey;
    return classes.filter((c) => c.group?.trim() === code).flatMap((c) => {
      const parsed = parseDayTime(c.day_time);
      if (!parsed) return [];
      return [{ subject, day: parsed.day, timeSlot: parsed.timeSlot, room: c.room }];
    });
  });
}

function timeToMinutes(time: string, startHour: number) {
  const [h, m] = time.split(":").map(Number);
  return (h - startHour) * 60 + (m || 0);
}

function getSlot(timeSlot: string, startHour: number, endHour: number) {
  const [s, e] = timeSlot.split("-");
  const total = (endHour - startHour) * 60;
  const startMin = timeToMinutes(s, startHour);
  const endMin = timeToMinutes(e, startHour);
  if (isNaN(startMin) || isNaN(endMin) || endMin <= startMin) return null;
  return { left: (startMin / total) * 100, width: ((endMin - startMin) / total) * 100 };
}

// ─── Selector (left panel) ───────────────────────────────────────────────────

interface SelectorProps {
  fetchCampus: Campus[];
  loadingCampus: boolean;
  state: CompareState;
  onChange: (s: CompareState) => void;
}

export function CompareSelector({ fetchCampus, loadingCampus, state, onChange }: SelectorProps) {
  const [campusData, setCampusData] = useState<CampusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const file = state.campus === "B" ? (state.faculty ? `B_${state.faculty}` : null) : state.campus || null;

  useEffect(() => {
    if (!file) { setCampusData(null); return; }
    setLoading(true);
    onChange({ ...state, codes: [] });
    fetch(`/timetable/${file}.json`)
      .then((r) => r.json())
      .then((d) => { setCampusData(d); setLoading(false); })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const options = campusData
    ? Array.from(new Set(Object.values(campusData).flat().map((c) => c.group?.trim()).filter(Boolean)))
        .sort()
        .filter((c) => !state.codes.includes(c))
        .map((c) => ({ value: c, label: c }))
    : [];

  const addCode = () => {
    if (!pending || state.codes.includes(pending)) return;
    onChange({ ...state, codes: [...state.codes, pending] });
    setPending(null);
  };

  const removeCode = (code: string) => onChange({ ...state, codes: state.codes.filter((c) => c !== code) });

  const dark = useDark();

  return (
    <div className="space-y-3">
      {/* Campus */}
      {loadingCampus ? <p className="text-sm text-gray-500">Loading campuses...</p> : (
        <Select
          options={[
            { value: "B - SELANGOR CAMPUS", label: "B - SELANGOR CAMPUS (Shah Alam)" },
            ...fetchCampus.map((c) => ({ value: c.text, label: c.text })),
          ]}
          onChange={(opt) => {
            const val = opt?.value ?? "";
            if (!val) { onChange({ campus: "", faculty: "", codes: [] }); return; }
            if (val === "B - SELANGOR CAMPUS") onChange({ campus: "B", faculty: "", codes: [] });
            else onChange({ campus: val.split(" - ")[0]?.trim() ?? val, faculty: "", codes: [] });
          }}
          placeholder="Select Campus"
          isClearable
          instanceId="compare-campus"
          menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
          styles={rsStyles(dark)}
        />
      )}

      {state.campus === "B" && (
        <Select
          options={SELANGOR_FACULTIES.map((f) => ({ value: f.id, label: f.text }))}
          onChange={(opt) => onChange({ ...state, faculty: opt?.value ?? "", codes: [] })}
          value={state.faculty ? { value: state.faculty, label: SELANGOR_FACULTIES.find(f => f.id === state.faculty)?.text ?? state.faculty } : null}
          placeholder="Select Faculty"
          isClearable
          instanceId="compare-faculty"
          menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
          styles={rsStyles(dark)}
        />
      )}

      {file && (
        <>
          {/* Add class code */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                options={options}
                onChange={(opt) => setPending(opt?.value ?? null)}
                value={pending ? { value: pending, label: pending } : null}
                placeholder={loading ? "Loading…" : "Add class code…"}
                isLoading={loading} isSearchable isClearable
                instanceId="compare-add"
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                styles={rsStyles(dark)}
              />
            </div>
            <button
              onClick={addCode}
              disabled={!pending}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-40"
            >
              Add
            </button>
          </div>

          {/* Added classes */}
          {state.codes.length > 0 && (
            <div className="space-y-1.5">
              {state.codes.map((code, i) => (
                <div key={code} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                  <span className="flex-1">{code}</span>
                  <button
                    onClick={() => removeCode(code)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 transition text-xs"
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {state.codes.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">Add at least two class codes to compare.</p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Single mini-timetable for one class code ────────────────────────────────

function MiniTimetable({ code, entries, color }: { code: string; entries: ReturnType<typeof getEntries>; color: string }) {
  const usedDays = DAYS.filter((d) => entries.some((e) => e.day === d));
  const allHours = entries.flatMap((e) => e.timeSlot.split("-").map((t) => parseInt(t)));
  const startHour = allHours.length ? Math.max(6, Math.min(...allHours) - 1) : 8;
  const endHour = allHours.length ? Math.min(22, Math.max(...allHours) + 1) : 18;
  const hourLabels: string[] = [];
  for (let h = startHour; h <= endHour; h++) hourLabels.push(`${String(h).padStart(2, "0")}:00`);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Code header */}
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: color }}>
        <span className="text-white font-extrabold text-sm">{code}</span>
        <span className="text-white/70 text-xs">{entries.length} session{entries.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: "520px" }}>
          {/* Hour ruler */}
          <div className="flex" style={{ paddingLeft: "52px" }}>
            {hourLabels.map((label, i) => (
              <div key={label} className="text-xs text-gray-400 font-medium select-none"
                style={{ width: i === hourLabels.length - 1 ? "0px" : `${100 / (hourLabels.length - 1)}%`, flexShrink: 0, paddingTop: "8px", paddingBottom: "4px", paddingLeft: "3px" }}>
                {label}
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100" style={{ marginLeft: "52px" }} />

          {usedDays.map((day) => {
            const dayEntries = entries.filter((e) => e.day === day);
            return (
              <div key={day} className="flex items-stretch" style={{ minHeight: "64px" }}>
                <div className="flex items-center text-xs font-medium text-gray-500 select-none shrink-0"
                  style={{ width: "52px", paddingRight: "10px", justifyContent: "flex-end" }}>
                  {day.slice(0, 3)}
                </div>
                <div className="relative flex-1 border-t border-gray-100" style={{ minHeight: "64px" }}>
                  {hourLabels.map((_, i) => (
                    <div key={i} className="absolute top-0 bottom-0 border-l border-gray-100"
                      style={{ left: `${(i / (hourLabels.length - 1)) * 100}%` }} />
                  ))}
                  {dayEntries.map((entry, i) => {
                    const geo = getSlot(entry.timeSlot, startHour, endHour);
                    if (!geo) return null;
                    return (
                      <div key={i}
                        className="absolute top-2 bottom-2 rounded-xl text-white overflow-hidden"
                        style={{ left: `calc(${geo.left}% + 2px)`, width: `calc(${geo.width}% - 4px)`, backgroundColor: color }}
                        title={`${entry.subject} · ${entry.timeSlot}${entry.room ? ` · ${entry.room}` : ""}`}
                      >
                        <div className="px-2 py-1.5 h-full flex flex-col justify-between">
                          <div className="text-white/70 font-medium leading-none" style={{ fontSize: "9px" }}>{entry.timeSlot}</div>
                          <div className="font-extrabold leading-tight truncate" style={{ fontSize: "0.8rem" }}>{entry.subject}</div>
                          {entry.room && <div className="text-white/70 leading-none truncate" style={{ fontSize: "9px" }}>{entry.room}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div style={{ height: "8px" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Full compare view (right panel) ─────────────────────────────────────────

interface TimetableProps {
  state: CompareState;
}

export function CompareTimetable({ state }: TimetableProps) {
  const [campusData, setCampusData] = useState<CampusData | null>(null);

  const file = state.campus === "B" ? (state.faculty ? `B_${state.faculty}` : null) : state.campus || null;

  useEffect(() => {
    if (!file) { setCampusData(null); return; }
    fetch(`/timetable/${file}.json`).then((r) => r.json()).then(setCampusData).catch(() => {});
  }, [file]);

  if (state.codes.length === 0) {
    return (
      <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg p-10 border border-white/30 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        Add class codes on the left to start comparing.
      </div>
    );
  }

  const entriesByCode = state.codes.map((code) => ({
    code,
    entries: campusData ? getEntries(campusData, code) : [],
  }));

  return (
    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/30 dark:border-white/10 space-y-4">
      <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">Class Comparison</h2>

      {/* One timetable per class code */}
      {entriesByCode.map(({ code, entries }, i) => (
        <MiniTimetable key={code} code={code} entries={entries} color={COLORS[i % COLORS.length]} />
      ))}
    </div>
  );
}
