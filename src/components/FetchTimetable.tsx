"use client";

import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { SwatchesPicker } from "react-color";
import { event } from "../../utils/gtag";
import toast from "react-hot-toast";
import { trackEvent } from "@/utils/umami";

type Group = {
  no: string;
  day_time: string;
  class_code: string;
  mode: string;
  attempt: string;
  venue: string;
  subject_code: string;
  faculty: string;
  subject_name: string;
};

type SelectedClass = Group & {
  day: string;
  timeSlot: string;
};

interface TimetableProps {
  selectedClasses: SelectedClass[];
  onRemoveClass: (classCode: string, dayTime: string) => void;
  onClearAll?: () => void;
  matricNumber?: string;
  onMatricChange?: (v: string) => void;
  onImport?: () => void;
  loadingImport?: boolean;
  editable?: boolean; // enables edit mode on click (auto-fetch mode)
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function timeToMinutes(time: string, startHour: number): number {
  const [h, m] = time.split(":").map(Number);
  return (h - startHour) * 60 + (m || 0);
}

function getSlotGeometry(timeSlot: string, startHour: number, endHour: number) {
  const parts = timeSlot.split("-");
  if (parts.length !== 2) return null;
  const total = (endHour - startHour) * 60;
  const startMin = timeToMinutes(parts[0], startHour);
  const endMin = timeToMinutes(parts[1], startHour);
  if (isNaN(startMin) || isNaN(endMin) || endMin <= startMin) return null;
  return {
    left: (startMin / total) * 100,
    width: ((endMin - startMin) / total) * 100,
  };
}

const COLOR_PALETTE = [
  "#7c3aed", "#0f766e", "#1d4ed8", "#15803d",
  "#b91c1c", "#7e22ce", "#0369a1", "#c2410c",
  "#065f46", "#9d174d", "#1e40af", "#92400e",
];

const COLORS_STORAGE_KEY = "uitm-timetable-fetch-colors";

const FetchTimetable: React.FC<TimetableProps> = ({
  selectedClasses,
  onRemoveClass,
  onClearAll,
  matricNumber,
  onMatricChange,
  onImport,
  loadingImport,
  editable = false,
}) => {
  const timetableRef = useRef<HTMLDivElement>(null);

  const [classColors, setClassColors] = useState<Record<string, string>>({});
  const [pickerWidth, setPickerWidth] = useState(400);
  const [hideWeekend, setHideWeekend] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedClassForColor, setSelectedClassForColor] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Edit mode (auto-fetch) ---
  const [editingClass, setEditingClass] = useState<SelectedClass | null>(null);
  const [classOverrides, setClassOverrides] = useState<Record<string, Partial<SelectedClass>>>({});
  const [editForm, setEditForm] = useState({ day: "", startTime: "", endTime: "", venue: "" });

  const openEdit = (cls: SelectedClass) => {
    const overridden = { ...cls, ...classOverrides[cls.class_code + cls.day_time] };
    const [start, end] = overridden.timeSlot.split("-");
    setEditForm({ day: overridden.day, startTime: start, endTime: end, venue: overridden.venue });
    setEditingClass(cls);
  };

  const saveEdit = () => {
    if (!editingClass) return;
    const key = editingClass.class_code + editingClass.day_time;
    setClassOverrides((prev) => ({
      ...prev,
      [key]: {
        day: editForm.day,
        timeSlot: `${editForm.startTime}-${editForm.endTime}`,
        venue: editForm.venue,
      },
    }));
    setEditingClass(null);
    toast.success("Class updated!");
  };

  const getEffectiveClass = (cls: SelectedClass): SelectedClass => {
    const key = cls.class_code + cls.day_time;
    return { ...cls, ...classOverrides[key] };
  };

  // --- High value customizations ---
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(18);
  const [viewMode, setViewMode] = useState<"compact" | "comfortable">("comfortable");
  const [showVenue, setShowVenue] = useState(true);
  const [showClassCode, setShowClassCode] = useState(true);
  const [showTime, setShowTime] = useState(true);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  const rowHeight = viewMode === "compact" ? 64 : 96;

  const fontSizeMap = {
    sm: { code: "0.7rem", time: "9px", venue: "9px" },
    md: { code: "0.85rem", time: "10px", venue: "10px" },
    lg: { code: "1rem", time: "11px", venue: "11px" },
  };

  // Build hour labels dynamically
  const HOUR_LABELS: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    HOUR_LABELS.push(`${String(h).padStart(2, "0")}:00`);
  }

  // Auto-assign colors
  const autoColors = useRef<Record<string, string>>({});
  let paletteIdx = 0;
  const getAutoColor = (subjectCode: string) => {
    if (!autoColors.current[subjectCode]) {
      autoColors.current[subjectCode] = COLOR_PALETTE[paletteIdx % COLOR_PALETTE.length];
      paletteIdx++;
    }
    return autoColors.current[subjectCode];
  };

  const seenSubjects = new Set<string>();
  for (const cls of selectedClasses) {
    const key = cls.subject_code.length > 15 ? cls.class_code : cls.subject_code;
    if (!seenSubjects.has(key)) { getAutoColor(key); seenSubjects.add(key); }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(COLORS_STORAGE_KEY);
        if (saved) setClassColors(JSON.parse(saved));
      } catch {}
      setPickerWidth(Math.min(window.innerWidth * 0.9, 400));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try { localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(classColors)); } catch {}
    }
  }, [classColors]);

  const getSubjectKey = (cls: SelectedClass) =>
    cls.subject_code.length > 15 ? cls.class_code : cls.subject_code;

  const getClassColor = (cls: SelectedClass) => {
    const key = getSubjectKey(cls);
    return classColors[key] || autoColors.current[key] || COLOR_PALETTE[0];
  };

  const updateClassColor = (key: string, color: string) =>
    setClassColors((prev) => ({ ...prev, [key]: color }));

  const saveAsImage = async () => {
    if (!timetableRef.current) return;
    try {
      toast.loading("Generating timetable image...", { id: "export" });
      const clone = timetableRef.current.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.width = "max-content";
      document.body.appendChild(clone);
      const canvas = await html2canvas(clone, { scale: 3 });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "timetable.png";
      link.click();
      document.body.removeChild(clone);
      toast.success("Timetable saved!", { id: "export", duration: 2000 });
      event({ action: "save_timetable", params: { classes_count: selectedClasses.length, method: "image" } });
      trackEvent("save_timetable", { classes_count: selectedClasses.length, method: "image" });
    } catch {
      toast.error("Failed to export timetable", { id: "export" });
    }
  };

  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const days = hideWeekend ? allDays.slice(0, 5) : allDays;

  const classesByDay: Record<string, SelectedClass[]> = {};
  for (const d of days) classesByDay[d] = [];
  for (const cls of selectedClasses) {
    const effective = getEffectiveClass(cls);
    if (classesByDay[effective.day]) classesByDay[effective.day].push(effective);
  }

  const uniqueSubjects = Array.from(
    new Map(selectedClasses.map((c) => [getSubjectKey(c), c])).values()
  );

  return (
    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/30 dark:border-white/10">

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsImportOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Import from MyStudent</h3>
              <button onClick={() => setIsImportOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter your UiTM matric number to auto-load your registered timetable.</p>
            <input
              type="text"
              value={matricNumber || ""}
              onChange={(e) => onMatricChange?.(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && matricNumber?.trim()) { onImport?.(); setIsImportOpen(false); } }}
              placeholder="e.g. 2023123456"
              autoFocus
              className="px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            />
            <button
              onClick={() => { onImport?.(); setIsImportOpen(false); }}
              disabled={loadingImport || !matricNumber?.trim()}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingImport ? "Loading…" : "Import Timetable"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditingClass(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Edit Class</h3>
              <button onClick={() => setEditingClass(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <p className="text-sm font-semibold text-blue-500">{editingClass.subject_name || editingClass.subject_code}</p>
            <p className="text-xs text-gray-400 -mt-2">Changes are saved locally only.</p>

            {/* Day */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Day</label>
              <select
                value={editForm.day}
                onChange={(e) => setEditForm((f) => ({ ...f, day: e.target.value }))}
                className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Time */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Start Time</label>
                <input
                  type="time"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">End Time</label>
                <input
                  type="time"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Venue */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Venue</label>
              <input
                type="text"
                value={editForm.venue}
                onChange={(e) => setEditForm((f) => ({ ...f, venue: e.target.value }))}
                placeholder="e.g. FSG BK 12A"
                className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditingClass(null)} className="flex-1 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition">
                Cancel
              </button>
              <button onClick={saveEdit} className="flex-1 py-2 text-sm rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 text-center">Your Timetable</h2>

        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={saveAsImage} className="px-4 py-2 bg-blue-600/80 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-500 transition">
            Save as Image
          </button>

          {onImport && (
            <button onClick={() => setIsImportOpen(true)} className="px-4 py-2 bg-blue-600/60 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-600 transition">
              Import
            </button>
          )}

          {onClearAll && selectedClasses.length > 0 && (
            <button onClick={onClearAll} className="px-4 py-2 bg-red-500/70 text-white text-sm font-semibold rounded-lg shadow hover:bg-red-600 transition">
              Clear All
            </button>
          )}

          <button
            onClick={() => { setIsCustomizing((p) => !p); setSelectedClassForColor(null); }}
            className="px-4 py-2 bg-white/60 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-lg shadow hover:bg-white/80 transition"
          >
            Colors
          </button>

          <button
            onClick={() => setIsSettingsOpen((p) => !p)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow transition ${isSettingsOpen ? "bg-blue-500 text-white" : "bg-white/60 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-white/80"}`}
          >
            Settings
          </button>

          {editable && (
            <span className="text-xs text-gray-400 dark:text-gray-500 self-center">
              Click a class to edit
            </span>
          )}
        </div>

        <p className="text-center text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 rounded-lg px-4 py-2 mt-1">
          For best results, save the image on mobile. Desktop export may not render styles correctly.
        </p>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-6 border border-black/10 dark:border-white/10">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Timetable Settings</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Time Range */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time Range</p>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Start</label>
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    className="text-sm px-2 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-200"
                  >
                    {Array.from({ length: 14 }, (_, i) => i + 6).map((h) => (
                      <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                    ))}
                  </select>
                </div>
                <span className="text-gray-400 mt-5">→</span>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400">End</label>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                    className="text-sm px-2 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-200"
                  >
                    {Array.from({ length: 14 }, (_, i) => i + 10).map((h) => (
                      <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* View Mode */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">View Mode</p>
              <div className="flex gap-2">
                {(["compact", "comfortable"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition ${viewMode === m ? "bg-blue-500 text-white" : "bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/20"}`}
                  >
                    {m === "compact" ? "📐 Compact" : "🖥 Comfortable"}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Font Size</p>
              <div className="flex gap-2">
                {(["sm", "md", "lg"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition ${fontSize === s ? "bg-blue-500 text-white" : "bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/20"}`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Show/Hide Info */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Show on Card</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "Time", value: showTime, set: setShowTime },
                  { label: "Class Code", value: showClassCode, set: setShowClassCode },
                  { label: "Venue", value: showVenue, set: setShowVenue },
                  { label: "Hide Weekend", value: hideWeekend, set: setHideWeekend },
                ].map(({ label, value, set }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => set(e.target.checked)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Color customizer */}
      {isCustomizing && (
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">Customize Colors</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {uniqueSubjects.map((cls) => {
              const key = getSubjectKey(cls);
              const color = getClassColor(cls);
              return (
                <button
                  key={key}
                  onClick={() => setSelectedClassForColor(selectedClassForColor === key ? null : key)}
                  className="px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    borderColor: color,
                    backgroundColor: selectedClassForColor === key ? color : `${color}22`,
                    color: selectedClassForColor === key ? "#fff" : "#1f2937",
                  }}
                >
                  {key}
                </button>
              );
            })}
          </div>
          {selectedClassForColor && (
            <div className="mt-8 flex flex-col items-center bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4 text-center">
                Pick a color for <span className="font-bold">{selectedClassForColor}</span>
              </p>
              <SwatchesPicker
                width={pickerWidth}
                color={classColors[selectedClassForColor] || autoColors.current[selectedClassForColor] || COLOR_PALETTE[0]}
                onChange={(colorResult: any) => updateClassColor(selectedClassForColor, colorResult.hex)}
              />
            </div>
          )}
        </div>
      )}

      {/* Timetable */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div ref={timetableRef} className="overflow-x-auto">
          <div style={{ minWidth: "640px" }}>
            {/* Hour ruler */}
            <div className="flex" style={{ paddingLeft: "60px" }}>
              {HOUR_LABELS.map((label, i) => (
                <div
                  key={label}
                  className="text-xs text-gray-400 font-medium select-none"
                  style={{
                    width: i === HOUR_LABELS.length - 1 ? "0px" : `${100 / (HOUR_LABELS.length - 1)}%`,
                    flexShrink: 0,
                    paddingTop: "12px",
                    paddingBottom: "6px",
                    paddingLeft: "4px",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100" style={{ marginLeft: "60px" }} />

            {/* Day rows */}
            {days.map((day) => {
              const dayClasses = classesByDay[day] || [];
              return (
                <div key={day} className="flex items-stretch" style={{ minHeight: `${rowHeight}px` }}>
                  <div
                    className="flex items-center text-sm font-medium text-gray-500 select-none shrink-0"
                    style={{ width: "60px", paddingRight: "12px", justifyContent: "flex-end" }}
                  >
                    {day.slice(0, 3)}
                  </div>

                  <div className="relative flex-1 border-t border-gray-100" style={{ minHeight: `${rowHeight}px` }}>
                    {HOUR_LABELS.map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-gray-100"
                        style={{ left: `${(i / (HOUR_LABELS.length - 1)) * 100}%` }}
                      />
                    ))}

                    {dayClasses.map((cls) => {
                      const geo = getSlotGeometry(cls.timeSlot, startHour, endHour);
                      if (!geo) return null;
                      const color = getClassColor(cls);
                      const displayCode = cls.subject_code.length > 15 ? "KOKO" : cls.subject_code;
                      const [sh, sm] = cls.timeSlot.split("-")[0].split(":").map(Number);
                      const [eh, em] = cls.timeSlot.split("-")[1].split(":").map(Number);
                      const durationMin = eh * 60 + em - (sh * 60 + sm);
                      const fs = fontSizeMap[fontSize];

                      return (
                        <div
                          key={`${cls.class_code}-${cls.day_time}`}
                          className="absolute top-2 bottom-2 rounded-xl text-white cursor-pointer overflow-hidden select-none"
                          style={{
                            left: `calc(${geo.left}% + 2px)`,
                            width: `calc(${geo.width}% - 4px)`,
                            backgroundColor: color,
                            transition: "filter 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.88)")}
                          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                          onClick={() => editable ? openEdit(cls) : onRemoveClass(cls.class_code, cls.day_time)}
                          title={editable ? `${cls.subject_name}\nClick to edit` : `${cls.subject_name}\n${cls.timeSlot}\n${cls.venue}\nClick to remove`}
                        >
                          <div className="flex flex-col justify-between h-full p-2">
                            {showTime && (
                              <div className="text-white/80 font-medium leading-none" style={{ fontSize: fs.time }}>
                                {cls.timeSlot}
                              </div>
                            )}
                            {showClassCode && (
                              <div
                                className="font-extrabold leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                                style={{ fontSize: durationMin >= 90 ? `calc(${fs.code} * 1.4)` : fs.code }}
                              >
                                {displayCode}
                              </div>
                            )}
                            {showVenue && cls.venue && durationMin >= 60 && (
                              <div className="text-white/75 leading-none overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: fs.venue }}>
                                {cls.venue}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div style={{ height: "12px" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FetchTimetable;
