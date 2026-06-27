"use client";

import React, { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
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
  const [isManageOpen, setIsManageOpen] = useState(false);

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
  const [timetableBg, setTimetableBg] = useState("#ffffff");
  const [blockTextColor, setBlockTextColor] = useState("#ffffff");
  const [labelColor, setLabelColor] = useState("");
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
      // Target the inner full-width div, not the overflow-x-auto wrapper
      const inner = timetableRef.current.firstElementChild as HTMLElement | null;
      const target = inner ?? timetableRef.current;
      const dataUrl = await toPng(target, {
        pixelRatio: 3,
        backgroundColor: timetableBg,
        cacheBust: true,
        width: target.scrollWidth,
        height: target.scrollHeight,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "timetable.png";
      link.click();
      toast.success("Timetable saved!", { id: "export", duration: 2000 });
      event({ action: "save_timetable", params: { classes_count: selectedClasses.length, method: "image" } });
      trackEvent("save_timetable", { classes_count: selectedClasses.length, method: "image" });
    } catch {
      toast.error("Failed to export timetable", { id: "export" });
    }
  };

  // Detect dark background to auto-flip label/grid colors
  const isDarkBg = (() => {
    const hex = timetableBg.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
  })();
  const resolvedLabelColor = labelColor || (isDarkBg ? "#94a3b8" : "#9ca3af");
  const resolvedGridColor = isDarkBg ? "#334155" : "#f3f4f6";

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

          {selectedClasses.length > 0 && (
            <button
              onClick={() => setIsManageOpen((p) => !p)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg shadow transition ${isManageOpen ? "bg-blue-500 text-white" : "bg-white/60 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-white/80"}`}
            >
              Manage Classes
            </button>
          )}

          {editable && (
            <span className="text-xs text-gray-400 dark:text-gray-500 self-center">
              Click a class to edit
            </span>
          )}
        </div>

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

            {/* Text Colors */}
            <div className="space-y-2 sm:col-span-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Text Colors</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                  <span>Class text</span>
                  <input type="color" value={blockTextColor} onChange={(e) => setBlockTextColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-white/20" />
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                  <span>Labels</span>
                  <input type="color" value={labelColor || (isDarkBg ? "#94a3b8" : "#9ca3af")}
                    onChange={(e) => setLabelColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-white/20" />
                  {labelColor && (
                    <button onClick={() => setLabelColor("")} className="text-xs text-gray-400 hover:text-gray-600">reset</button>
                  )}
                </label>
              </div>
            </div>

            {/* Timetable Background */}
            <div className="space-y-2 sm:col-span-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timetable Background</p>
              <div className="flex flex-wrap gap-2 items-center">
                {[
                  { label: "White",       value: "#ffffff" },
                  { label: "Soft Blue",   value: "#eff6ff" },
                  { label: "Soft Green",  value: "#f0fdf4" },
                  { label: "Soft Purple", value: "#faf5ff" },
                  { label: "Soft Pink",   value: "#fdf2f8" },
                  { label: "Soft Yellow", value: "#fefce8" },
                  { label: "Dark",        value: "#1e293b" },
                  { label: "Midnight",    value: "#0f172a" },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setTimetableBg(value)}
                    title={label}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: value,
                      borderColor: timetableBg === value ? "#3b82f6" : "#d1d5db",
                      transform: timetableBg === value ? "scale(1.2)" : undefined,
                    }}
                  />
                ))}
                {/* Custom colour picker */}
                <label className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition overflow-hidden" title="Custom colour">
                  <input
                    type="color"
                    value={timetableBg}
                    onChange={(e) => setTimetableBg(e.target.value)}
                    className="opacity-0 absolute w-7 h-7 cursor-pointer"
                  />
                  <span className="text-gray-400 text-xs pointer-events-none">+</span>
                </label>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Manage Classes Panel */}
      {isManageOpen && (
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-6 border border-black/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Manage Classes</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">Click X to remove a subject</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueSubjects.map((cls) => {
              const key = getSubjectKey(cls);
              const color = getClassColor(cls);
              const sessions = selectedClasses.filter((c) => getSubjectKey(c) === key);
              return (
                <div
                  key={key}
                  className="flex items-center gap-1.5 pl-3 pr-1 py-1.5 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  <span>{key}</span>
                  <span className="text-white/60 text-xs">×{sessions.length}</span>
                  <button
                    onClick={() => onRemoveClass(cls.class_code, cls.day_time)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 transition text-white text-xs leading-none"
                    title={`Remove all ${key} sessions`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            To add a subject, use the panel on the left — search by campus or class code.
          </p>
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
      <div className="rounded-2xl shadow-md overflow-hidden" style={{ backgroundColor: timetableBg }}>
        <div ref={timetableRef} className="overflow-x-auto">
          <div style={{ minWidth: "640px" }}>
            {/* Hour ruler */}
            <div className="flex" style={{ paddingLeft: "60px" }}>
              {HOUR_LABELS.map((label, i) => (
                <div
                  key={label}
                  className="text-xs font-medium select-none"
                  style={{
                    color: resolvedLabelColor,
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

            <div style={{ marginLeft: "60px", borderTop: `1px solid ${resolvedGridColor}` }} />

            {/* Day rows */}
            {days.map((day) => {
              const dayClasses = classesByDay[day] || [];
              return (
                <div key={day} className="flex items-stretch" style={{ minHeight: `${rowHeight}px` }}>
                  <div
                    className="flex items-center text-sm font-medium select-none shrink-0"
                    style={{ color: resolvedLabelColor, width: "60px", paddingRight: "12px", justifyContent: "flex-end" }}
                  >
                    {day.slice(0, 3)}
                  </div>

                  <div className="relative flex-1" style={{ minHeight: `${rowHeight}px`, borderTop: `1px solid ${resolvedGridColor}` }}>
                    {HOUR_LABELS.map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0"
                        style={{ borderLeft: `1px solid ${resolvedGridColor}`, left: `${(i / (HOUR_LABELS.length - 1)) * 100}%` }}
                      />
                    ))}

                    {dayClasses.map((cls, cIdx) => {
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
                          key={`${cls.class_code}-${cls.day_time}-${cIdx}`}
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
                              <div className="font-medium leading-none" style={{ fontSize: fs.time, color: blockTextColor, opacity: 0.8 }}>
                                {cls.timeSlot}
                              </div>
                            )}
                            {showClassCode && (
                              <div
                                className="font-extrabold leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                                style={{ fontSize: durationMin >= 90 ? `calc(${fs.code} * 1.4)` : fs.code, color: blockTextColor }}
                              >
                                {displayCode}
                              </div>
                            )}
                            {showVenue && cls.venue && durationMin >= 60 && (
                              <div className="leading-none overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: fs.venue, color: blockTextColor, opacity: 0.75 }}>
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
