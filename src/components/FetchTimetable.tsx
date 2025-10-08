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

const FetchTimetable: React.FC<TimetableProps> = ({
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
  const [hideWeekend, setHideWeekend] = useState(false);
  const [invert, setInvert] = useState(false);

  useEffect(() => {
    setPickerWidth(Math.min(window.innerWidth * 0.9, 400));
  }, []);

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
        <tr className="text-white" style={{ backgroundColor: color }}>
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
                      className="text-white p-2 rounded text-xs h-full cursor-pointer hover:bg-blue-600 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        onRemoveClass(classInSlot.class_code, classInSlot.day_time)
                      }
                      title="Click to remove"
                    >
                      <div className="font-semibold text-sm">{classInSlot.subject}</div>
                      <div className="text-xs opacity-90">{classInSlot.venue}</div>
                      <div className="text-xs opacity-75">
                        {classInSlot.subject_code.length > 15
                          ? "KOKO"
                          : classInSlot.subject_code}
                      </div>
                      <div className="text-xs opacity-60">{classInSlot.timeSlot}</div>
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
                (
                  document.getElementById("colorModal") as HTMLDialogElement
                )?.close();
              }}
            />

            <div className="modal-action flex justify-center mt-4">
              <button
                className="btn btn-sm btn-outline"
                onClick={() =>
                  (
                    document.getElementById("colorModal") as HTMLDialogElement
                  )?.close()
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

export default FetchTimetable;
