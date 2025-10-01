"use client";

import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { SwatchesPicker } from "react-color";
import { event } from "../../utils/gtag";

type Group = {
  no: string;
  day_time: string;
  class_code: string;
  mode: string;
  attempt: string;
  venue: string;
  subject_code: string;
  faculty: string;
  subject: string;
};

type SelectedClass = Group & {
  day: string;
  timeSlot: string;
};

interface TimetableProps {
  selectedClasses: SelectedClass[];
  onRemoveClass: (classCode: string, dayTime: string) => void;
}

const Timetable: React.FC<TimetableProps> = ({
  selectedClasses,
  onRemoveClass,
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

    event({
      action: "save_timetable",
      params: { classes_count: selectedClasses.length, method: "image" },
    });
  };

  const [color, setColor] = useState("#155dfc");
  const [pickerWidth, setPickerWidth] = useState(400);

useEffect(() => {
  setPickerWidth(Math.min(window.innerWidth * 0.9, 400));
}, []);


  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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

          <button
            onClick={() =>
              (
                document.getElementById("colorModal") as HTMLDialogElement
              )?.show()
            }
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all"
            style={{ backgroundColor: `${color}50`, borderColor: `${color}` }}
          >
            Change Color
          </button>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <div ref={timetableRef} className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className=" text-white" style={{ backgroundColor: color }}>
                <th className="border border-gray-300 p-3 text-left font-semibold">
                  Time
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="border border-gray-300 p-3 text-center font-semibold min-w-[180px]"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot) => (
                <tr key={timeSlot} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium bg-gray-100">
                    {timeSlot}
                  </td>
                  {days.map((day) => {
                    const classInSlot = selectedClasses.find(
                      (cls) => cls.day === day && cls.timeSlot === timeSlot
                    );

                    // Also check for classes that might fall within this time slot even if timeSlot doesn't match exactly
                    const classInTimeRange = !classInSlot
                      ? selectedClasses.find((cls) => {
                          if (cls.day !== day) return false;

                          // Check if the class time overlaps with current slot
                          const [slotStart, slotEnd] = timeSlot.split("-");
                          const classTimeMatch = cls.timeSlot.match(
                            /(\d{2}):(\d{2})-(\d{2}):(\d{2})/
                          );

                          if (classTimeMatch) {
                            const classStart = `${classTimeMatch[1]}:${classTimeMatch[2]}`;
                            const classEnd = `${classTimeMatch[3]}:${classTimeMatch[4]}`;

                            // Check if class time overlaps with this slot
                            return (
                              (classStart >= slotStart &&
                                classStart < slotEnd) ||
                              (classEnd > slotStart && classEnd <= slotEnd) ||
                              (classStart <= slotStart && classEnd >= slotEnd)
                            );
                          }
                          return false;
                        })
                      : null;

                    const displayClass = classInSlot || classInTimeRange;

                    return (
                      <td
                        key={`${day}-${timeSlot}`}
                        className="border border-gray-300 p-2 h-20 relative"
                      >
                        {displayClass && (
                          <div
                            className=" text-white p-2 rounded text-xs h-full cursor-pointer hover:bg-blue-600 transition-colors"
                            style={{ backgroundColor: color }}
                            onClick={() =>
                              onRemoveClass(
                                displayClass.class_code,
                                displayClass.day_time
                              )
                            }
                            title="Click to remove"
                          >
                            <div className="font-semibold">
                              {displayClass.class_code}
                            </div>
                            <div className="font-semibold">
                              {displayClass.subject}
                            </div>
                            <div className="text-xs opacity-90">
                              {displayClass.venue}
                            </div>
                            <div className="text-xs opacity-75">
                              {displayClass.subject_code.length > 3
                                ? "KOKO"
                                : displayClass.subject_code}
                            </div>

                            <div className="text-xs opacity-60">
                              {displayClass.timeSlot}
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
                <div className="font-medium text-blue-900">
                  {cls.class_code}
                </div>
                <div className="text-sm text-blue-700">{cls.day_time}</div>
                <div className="text-sm text-blue-600">{cls.venue}</div>
                <div className="text-sm text-blue-600">{cls.subject}</div>
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
          <p className="text-gray-500 text-lg">No classes selected yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Select classes from the left panel to see them in your timetable
          </p>
        </div>
      )}

      <dialog id="colorModal" className="modal">
  <div className="modal-box bg-white p-4 sm:p-6 w-full max-w-md rounded-xl">
    <h3 className="text-center font-bold text-lg text-gray-600">
      Select Color
    </h3>

    {/* Form Content */}
    <div className="mt-4">
      <SwatchesPicker
        width={pickerWidth} // responsive width
        className="rounded-xl mx-auto"
        color={color}
        onChange={(colorResult: any) => {
          setColor(colorResult.hex);
          (document.getElementById("colorModal") as HTMLDialogElement)?.close();
        }}
      />

      <div className="modal-action flex justify-center mt-4">
        <button
          className="btn btn-sm btn-outline"
          onClick={() =>
            (document.getElementById("colorModal") as HTMLDialogElement)?.close()
          }
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
