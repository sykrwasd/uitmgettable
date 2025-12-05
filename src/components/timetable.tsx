"use client";

import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { SwatchesPicker } from "react-color";
import { event } from "../../utils/gtag";
import toast from "react-hot-toast";

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
}

const Timetable: React.FC<TimetableProps> = ({
  selectedClasses,
  onRemoveClass,
  onClearAll,
}) => {
  // Time slots from 8AM to 6PM in 2-hour intervals
  const timeSlots = [
    "08:00-10:00",
    "10:00-12:00",
    "12:00-14:00",
    "14:00-16:00",
    "16:00-18:00",
  ];

  const timetableRef = useRef<HTMLDivElement>(null);

  const saveAsImage = async () => {
    if (!timetableRef.current) return;

    try {
      toast.loading("Generating timetable image...", { id: "export" });

      // Clone the timetable to render off-screen
      const clone = timetableRef.current.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px"; // move off-screen
      clone.style.width = "max-content"; // expand to full width
      document.body.appendChild(clone);

      // Capture screenshot
      const canvas = await html2canvas(clone, { scale: 3 });
      const imgData = canvas.toDataURL("image/png");

      // Download
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "timetable.png";
      link.click();

      // Cleanup
      document.body.removeChild(clone);

      toast.success("📥 Timetable saved successfully!", {
        id: "export",
        duration: 2000,
      });

      event({
        action: "save_timetable",
        params: { classes_count: selectedClasses.length, method: "image" },
      });
    } catch (error) {
      toast.error("Failed to export timetable", { id: "export" });
    }
  };

  const DEFAULT_COLOR = "#155dfc";
  const COLORS_STORAGE_KEY = "uitm-timetable-colors";
  const TIMETABLE_COLOR_HEADER_KEY = "timetable_header_key";

  const [classColors, setClassColors] = useState<Record<string, string>>({});
  const [pickerWidth, setPickerWidth] = useState(400);
  const [hideWeekend, setHideWeekend] = useState(false);
  const [invert, setInvert] = useState(false);
  const [selectedClassForColor, setSelectedClassForColor] = useState<
    string | null
  >(null);

  const [headerColor, setHeaderColor] = useState<string | null>(null);

  // Load colors from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(COLORS_STORAGE_KEY);
        if (saved) {
          setClassColors(JSON.parse(saved));
          console.log("saved", JSON.parse(saved));
        }
        const savedHeader = localStorage.getItem(TIMETABLE_COLOR_HEADER_KEY);
        if (savedHeader) {
          setHeaderColor(JSON.parse(savedHeader));
        }
      } catch (error) {
        console.error("Failed to load colors from localStorage:", error);
      }
    }
    setPickerWidth(Math.min(window.innerWidth * 0.9, 400));
  }, []);

  // Save colors to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(classColors));
      } catch (error) {
        console.error("Failed to save colors to localStorage:", error);
      }
    }
  }, [classColors]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          TIMETABLE_COLOR_HEADER_KEY,
          JSON.stringify(headerColor)
        );
      } catch (error) {
        console.error("Failed to save header color:", error);
      }
    }
  }, [headerColor]);

  // Get color for a specific class
  const getClassColor = (classCode: string) => {
    return classColors[classCode] || DEFAULT_COLOR;
  };

  // Update color for a specific class
  const updateClassColor = (classCode: string, color: string) => {
    setClassColors((prev) => ({ ...prev, [classCode]: color }));
  };

  let days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (!hideWeekend) {
    days = days;
  } else {
    days = days.slice(0, 5);
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
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

          {onClearAll && selectedClasses.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-5 py-2 bg-red-500/50 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition"
            >
              Clear All
            </button>
          )}

          <button
            onClick={() =>
              (
                document.getElementById("classListModal") as HTMLDialogElement
              )?.show()
            }
            className="px-5 py-2 bg-white/50 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
          >
            Customize Colors
          </button>

          <label className="ml-2 flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="toggleWeekend"
              onChange={(e) => setHideWeekend(e.target.checked)}
              className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-white font-medium">Hide weekend</span>
            <input
              type="checkbox"
              name="toggleWeekend"
              onChange={(e) => setInvert(e.target.checked)}
              className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-white font-medium">Invert Day and Time</span>
          </label>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <div ref={timetableRef} className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr
                className="text-white"
                style={{ backgroundColor: headerColor || DEFAULT_COLOR }}
              >
                <th className="border border-gray-300 p-3 text-left font-semibold">
                  {invert ? "Day" : "Time"}
                </th>
                {(invert ? timeSlots : days).map((header) => (
                  <th
                    key={header}
                    className="border border-gray-300 p-3 text-center font-semibold min-w-[160px]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(invert ? days : timeSlots).map((row) => (
                <tr key={row} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium bg-gray-100">
                    {row}
                  </td>
                  {(invert ? timeSlots : days).map((col) => {
                    const day = invert ? row : col;
                    const timeSlot = invert ? col : row;

                    const classInSlot = selectedClasses.find(
                      (cls) => cls.day === day && cls.timeSlot === timeSlot
                    );

                    return (
                      <td
                        key={`${day}-${timeSlot}`}
                        className="border border-gray-300 p-2 h-20 relative"
                      >
                        {classInSlot && (
                          <div
                            className="text-white p-2 rounded text-xs h-full cursor-pointer transition-colors"
                            style={{
                              backgroundColor: getClassColor(
                                classInSlot.class_code
                              ),
                              filter: "brightness(1)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.filter = "brightness(0.9)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.filter = "brightness(1)")
                            }
                            onClick={() =>
                              onRemoveClass(
                                classInSlot.class_code,
                                classInSlot.day_time
                              )
                            }
                            title="Click to remove"
                          >
                            <div className="font-semibold">
                              {classInSlot.subject_name}
                            </div>
                            <div className="opacity-90">
                              {classInSlot.class_code.replace(/\*/g, "").trim()}
                            </div>
                            <div className="text-xs opacity-90">
                              {classInSlot.venue}
                            </div>

                            <div className="text-xs opacity-60">
                              {classInSlot.timeSlot}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Classes Summary - Only show if there are classes */}
      {selectedClasses.length > 0 && (
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Selected Classes ({selectedClasses.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {selectedClasses.map((cls, idx) => (
              <div
                key={idx}
                className="bg-blue-50 border border-blue-200 rounded p-3"
              >
                <div className="text-md text-blue-900">{cls.subject_name}</div>
                <div className="text-sm text-blue-6Re00">
                  {cls.class_code.replace(/\*/g, "").trim()}
                </div>
                <div className="text-sm text-blue-700">{cls.day_time}</div>
                <div className="text-sm text-blue-600">{cls.venue}</div>
                <button
                  onClick={() => onRemoveClass(cls.class_code, cls.day_time)}
                  className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state message */}
      {selectedClasses.length === 0 && (
        <div className="mt-6 text-center py-8">
          <p className="text-white text-lg">No classes selected yet</p>
          <p className="text-white text-sm mt-2">
            Select classes from the left panel to see them in your timetable
          </p>
        </div>
      )}

      {/* Class List Modal */}
      <dialog
        id="classListModal"
        className="modal"
        onClick={(e) => {
          const dialog = e.currentTarget;
          const rect = dialog
            .querySelector(".modal-box")
            ?.getBoundingClientRect();
          if (!rect) return;

          const clickedInside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;

          if (!clickedInside) dialog.close();
        }}
      >
        <div className="modal-box bg-white p-4 sm:p-6 w-full max-w-md rounded-xl">
          <h3 className="text-center font-bold text-lg text-gray-600 mb-4">
            Select Class to Customize
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <button
              onClick={() => {
                setSelectedClassForColor("HEADER_COLOR");
                (
                  document.getElementById("classListModal") as HTMLDialogElement
                )?.close();
                (
                  document.getElementById("colorModal") as HTMLDialogElement
                )?.show();
              }}
              className="w-full p-3 rounded-lg border-2 transition-all hover:shadow-md text-left mb-3"
              style={{
                borderColor: headerColor || DEFAULT_COLOR,
                backgroundColor: (headerColor || DEFAULT_COLOR) + "20",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: headerColor || DEFAULT_COLOR }}
                />
                <div className="font-semibold">Header</div>
              </div>
            </button>
          </div>

          {selectedClasses.length === 0 ? (
            <>
              <p className="text-center text-gray-500 py-4">
                No classes selected yet
              </p>
            </>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* Get unique classes by class_code */}
              {Array.from(
                new Map(
                  selectedClasses.map((cls) => [cls.class_code, cls])
                ).values()
              ).map((cls) => (
                <button
                  key={cls.class_code}
                  onClick={() => {
                    setSelectedClassForColor(cls.class_code);
                    (
                      document.getElementById(
                        "classListModal"
                      ) as HTMLDialogElement
                    )?.close();
                    (
                      document.getElementById("colorModal") as HTMLDialogElement
                    )?.show();
                  }}
                  className="w-full p-3 rounded-lg border-2 transition-all hover:shadow-md text-left"
                  style={{
                    borderColor: getClassColor(cls.class_code),
                    backgroundColor: `${getClassColor(cls.class_code)}20`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getClassColor(cls.class_code) }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {cls.subject_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {cls.class_code.replace(/\*/g, "").trim()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="modal-action flex justify-center mt-4">
            <button
              className="btn btn-sm btn-outline"
              onClick={() =>
                (
                  document.getElementById("classListModal") as HTMLDialogElement
                )?.close()
              }
            >
              Close
            </button>
          </div>
        </div>
      </dialog>

      {/* Color Picker Modal */}

      <dialog
        id="colorModal"
        className="modal"
        onClick={(e) => {
          const dialog = e.currentTarget;
          const rect = dialog
            .querySelector(".modal-box")
            ?.getBoundingClientRect();
          if (!rect) return;

          const clickedInside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;

          if (!clickedInside) {
            (
              document.getElementById("colorModal") as HTMLDialogElement
            )?.close();
          }
        }}
      >
        <div className="modal-box bg-white p-4 sm:p-6 w-full max-w-md rounded-xl">
          <h3 className="text-center font-bold text-lg text-gray-600">
            Select Color
          </h3>

          {selectedClassForColor && (
            <p className="text-center text-sm text-gray-500 mt-2">
              for{" "}
              {
                selectedClasses.find(
                  (c) => c.class_code === selectedClassForColor
                )?.subject_name
              }
            </p>
          )}

          <div className="mt-4">
            <SwatchesPicker
              width={pickerWidth}
              className="rounded-xl mx-auto"
              color={
                selectedClassForColor
                  ? getClassColor(selectedClassForColor)
                  : DEFAULT_COLOR
              }
              onChange={(colorResult: any) => {
                if (selectedClassForColor === "HEADER_COLOR") {
                  setHeaderColor(colorResult.hex);
                  toast.success("Color updated!", { duration: 1500 });
                } else if (selectedClassForColor) {
                  updateClassColor(selectedClassForColor, colorResult.hex);
                  toast.success("Color updated!", { duration: 1500 });
                }

                (
                  document.getElementById("colorModal") as HTMLDialogElement
                )?.close();
                setSelectedClassForColor(null);
              }}
            />

            <div className="modal-action flex justify-center mt-4">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  (
                    document.getElementById("colorModal") as HTMLDialogElement
                  )?.close();
                  setSelectedClassForColor(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Timetable;
