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
  // Import from MyStudent
  matricNumber?: string;
  onMatricChange?: (v: string) => void;
  onImport?: () => void;
  loadingImport?: boolean;
}

// --- Timeline constants ---
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h - DAY_START_HOUR) * 60 + (m || 0);
}

function getSlotGeometry(
  timeSlot: string,
): { left: number; width: number } | null {
  const parts = timeSlot.split("-");
  if (parts.length !== 2) return null;
  const startMin = timeToMinutes(parts[0]);
  const endMin = timeToMinutes(parts[1]);
  if (isNaN(startMin) || isNaN(endMin) || endMin <= startMin) return null;
  return {
    left: (startMin / TOTAL_MINUTES) * 100,
    width: ((endMin - startMin) / TOTAL_MINUTES) * 100,
  };
}

// Distinct vibrant palette — auto-assigned per unique subject_code
const COLOR_PALETTE = [
  "#7c3aed", // violet
  "#0f766e", // teal
  "#1d4ed8", // blue
  "#15803d", // green
  "#b91c1c", // red
  "#7e22ce", // purple
  "#0369a1", // sky
  "#c2410c", // orange
  "#065f46", // emerald
  "#9d174d", // pink
  "#1e40af", // indigo
  "#92400e", // amber
];

const COLORS_STORAGE_KEY = "uitm-timetable-fetch-colors";

// Build hour labels 08:00 … 20:00
const HOUR_LABELS: string[] = [];
for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
  HOUR_LABELS.push(`${String(h).padStart(2, "0")}:00`);
}

const FetchTimetable: React.FC<TimetableProps> = ({
  selectedClasses,
  onRemoveClass,
  onClearAll,
  matricNumber,
  onMatricChange,
  onImport,
  loadingImport,
}) => {
  const timetableRef = useRef<HTMLDivElement>(null);

  const [classColors, setClassColors] = useState<Record<string, string>>({});
  const [pickerWidth, setPickerWidth] = useState(400);
  const [hideWeekend, setHideWeekend] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedClassForColor, setSelectedClassForColor] = useState<
    string | null
  >(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Auto-assign palette colors for subjects that don't have a saved color
  const autoColors = useRef<Record<string, string>>({});
  let paletteIdx = 0;
  const getAutoColor = (subjectCode: string) => {
    if (!autoColors.current[subjectCode]) {
      autoColors.current[subjectCode] =
        COLOR_PALETTE[paletteIdx % COLOR_PALETTE.length];
      paletteIdx++;
    }
    return autoColors.current[subjectCode];
  };

  // Seed auto-colors in order of first appearance so they're stable
  const seenSubjects = new Set<string>();
  for (const cls of selectedClasses) {
    const key =
      cls.subject_code.length > 15 ? cls.class_code : cls.subject_code;
    if (!seenSubjects.has(key)) {
      getAutoColor(key);
      seenSubjects.add(key);
    }
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
      try {
        localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(classColors));
      } catch {}
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
      toast.success("📥 Timetable saved successfully!", {
        id: "export",
        duration: 2000,
      });
      event({
        action: "save_timetable",
        params: { classes_count: selectedClasses.length, method: "image" },
      });
      trackEvent("save_timetable", {
        classes_count: selectedClasses.length,
        method: "image",
      });
    } catch {
      toast.error("Failed to export timetable", { id: "export" });
    }
  };

  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const days = hideWeekend ? allDays.slice(0, 5) : allDays;

  const classesByDay: Record<string, SelectedClass[]> = {};
  for (const d of days) classesByDay[d] = [];
  for (const cls of selectedClasses) {
    if (classesByDay[cls.day]) classesByDay[cls.day].push(cls);
  }

  // Deduplicated list of unique subjects for the color picker
  const uniqueSubjects = Array.from(
    new Map(selectedClasses.map((c) => [getSubjectKey(c), c])).values(),
  );

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      {/* Import Modal */}
      {isImportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsImportOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                🎓 Import from MyStudent
              </h3>
              <button
                onClick={() => setIsImportOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Enter your UiTM matric number to auto-load your registered
              timetable.
            </p>
            <input
              type="text"
              value={matricNumber || ""}
              onChange={(e) => onMatricChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matricNumber?.trim()) {
                  onImport?.();
                  setIsImportOpen(false);
                }
              }}
              placeholder="e.g. 2023123456"
              autoFocus
              className="px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            />
            <button
              onClick={() => {
                onImport?.();
                setIsImportOpen(false);
              }}
              disabled={loadingImport || !matricNumber?.trim()}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingImport ? "Loading…" : "Import Timetable"}
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center">
          Your Timetable
        </h2>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={saveAsImage}
            className="px-5 py-2 bg-blue-600/50 text-white font-semibold rounded-lg shadow hover:bg-blue-500 transition"
          >
            Save as Image
          </button>

          {/* Import from MyStudent — opens modal */}
          {onImport && (
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-5 py-2 bg-blue-600/80 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition"
            >
              🎓 Import
            </button>
          )}

          {onClearAll && selectedClasses.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-5 py-2 bg-red-500/50 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition"
            >
              Clear All
            </button>
          )}

          <button
            onClick={() => {
              setIsCustomizing((p) => !p);
              setSelectedClassForColor(null);
            }}
            className="px-5 py-2 bg-white/50 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
          >
            {isCustomizing ? "Close Colors" : "Customize Colors"}
          </button>

          <label className="ml-2 flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => setHideWeekend(e.target.checked)}
              className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-white font-medium">Hide weekend</span>
          </label>
        </div>
      </div>

      {/* Color customizer */}
      {isCustomizing && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            Customize Colors
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {uniqueSubjects.map((cls) => {
              const key = getSubjectKey(cls);
              const color = getClassColor(cls);
              return (
                <button
                  key={key}
                  onClick={() =>
                    setSelectedClassForColor(
                      selectedClassForColor === key ? null : key,
                    )
                  }
                  className="px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    borderColor: color,
                    backgroundColor:
                      selectedClassForColor === key ? color : `${color}22`,
                    color: selectedClassForColor === key ? "#fff" : "#1f2937",
                  }}
                >
                  {key}
                </button>
              );
            })}
          </div>
          {selectedClassForColor && (
            <div className="mt-8 flex flex-col items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-600 mb-4 text-center">
                Pick a color for{" "}
                <span className="font-bold">{selectedClassForColor}</span>
              </p>
              <SwatchesPicker
                width={pickerWidth}
                color={
                  classColors[selectedClassForColor] ||
                  autoColors.current[selectedClassForColor] ||
                  COLOR_PALETTE[0]
                }
                onChange={(colorResult: any) =>
                  updateClassColor(selectedClassForColor, colorResult.hex)
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Timetable — weekview style */}
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
                    width:
                      i === HOUR_LABELS.length - 1
                        ? "0px"
                        : `${100 / (HOUR_LABELS.length - 1)}%`,
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

            {/* Separator line */}
            <div
              className="border-t border-gray-100"
              style={{ marginLeft: "60px" }}
            />

            {/* Day rows */}
            {days.map((day) => {
              const dayClasses = classesByDay[day] || [];
              return (
                <div
                  key={day}
                  className="flex items-stretch"
                  style={{ minHeight: "96px" }}
                >
                  {/* Day label */}
                  <div
                    className="flex items-center text-sm font-medium text-gray-500 select-none shrink-0"
                    style={{
                      width: "60px",
                      paddingRight: "12px",
                      justifyContent: "flex-end",
                    }}
                  >
                    {day.slice(0, 3)}
                  </div>

                  {/* Timeline */}
                  <div
                    className="relative flex-1 border-t border-gray-100"
                    style={{ minHeight: "96px" }}
                  >
                    {/* Hour grid lines */}
                    {HOUR_LABELS.map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-gray-100"
                        style={{
                          left: `${(i / (HOUR_LABELS.length - 1)) * 100}%`,
                        }}
                      />
                    ))}

                    {/* Class blocks */}
                    {dayClasses.map((cls) => {
                      const geo = getSlotGeometry(cls.timeSlot);
                      if (!geo) return null;
                      const color = getClassColor(cls);
                      const displayCode =
                        cls.subject_code.length > 15
                          ? "KOKO"
                          : cls.subject_code;
                      const [sh, sm] = cls.timeSlot
                        .split("-")[0]
                        .split(":")
                        .map(Number);
                      const [eh, em] = cls.timeSlot
                        .split("-")[1]
                        .split(":")
                        .map(Number);
                      const durationMin = eh * 60 + em - (sh * 60 + sm);

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
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.filter = "brightness(0.88)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.filter = "brightness(1)")
                          }
                          onClick={() =>
                            onRemoveClass(cls.class_code, cls.day_time)
                          }
                          title={`${cls.subject_name}\n${cls.timeSlot}\n${cls.venue}\nClick to remove`}
                        >
                          <div className="flex flex-col justify-between h-full p-2">
                            {/* Time */}
                            <div className="flex items-center gap-1 text-white/80 text-[10px] font-medium leading-none">
                              <span>{cls.timeSlot}</span>
                            </div>

                            {/* Course code — large */}
                            <div
                              className="font-extrabold leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                              style={{
                                fontSize:
                                  durationMin >= 90 ? "1.25rem" : "0.85rem",
                              }}
                            >
                              {displayCode}
                            </div>

                            {/* Venue */}
                            {cls.venue && durationMin >= 60 && (
                              <div className="flex items-center gap-1 text-white/75 text-[10px] leading-none overflow-hidden text-ellipsis whitespace-nowrap">
                                <span>{cls.venue}</span>
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

            {/* Bottom padding */}
            <div style={{ height: "12px" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FetchTimetable;
