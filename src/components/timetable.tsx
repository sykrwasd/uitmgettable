"use client";

import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

type Group = {
  no: string;
  day_time: string;
  class_code: string;
  mode: string;
  attempt: string;
  venue: string;
  subject_code: string;
  faculty: string;
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
};



  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-700 text-center">
        Your Timetable
      </h2>
      <button
        onClick={saveAsImage}
        className="mb-4 px-4 py-2 bg-blue-500 mt-3 text-white rounded hover:bg-blue-400 transition"
      >
        Save as image
      </button>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <div ref={timetableRef} className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
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
                            className="bg-blue-500 text-white p-2 rounded text-xs h-full cursor-pointer hover:bg-blue-600 transition-colors"
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
                            <div className="text-xs opacity-90">
                              {displayClass.venue}
                            </div>
                            <div className="text-xs opacity-75">
                              {displayClass.subject_code}
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
    </div>
  );
};

export default Timetable;
