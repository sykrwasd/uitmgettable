"use client";

import { useEffect, useState } from "react";
import Timetable from "@/components/timetable";
import { FaGithub } from "react-icons/fa";
import OrderErrorPopup from "@/components/orderError";
import Select from "react-select";
import { getGroup, getSubject } from "@/lib/api";
import { useCampus } from "./hooks/useCampus";
import { useFaculty } from "./hooks/useFaculty";
import { useSubjects } from "./hooks/useSubjects";
import { parseCampus } from "@/lib/utils";
import { useGroups } from "./hooks/useGroups";

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
  lecturer?: string;
};

type SelectedClass = Group & {
  day: string;
  timeSlot: string;
};

export default function Home() {
  const [selectedClasses, setSelectedClasses] = useState<SelectedClass[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [campus, setCampus] = useState("");
  const [result, setResult] = useState({
    result: "",
    message: "",
  });
  const [faculty, setFaculty] = useState("");
  const [searchGroup, setSearchGroup] = useState("");
  const { fetchCampus, loadingCampus } = useCampus();
  const { fetchFaculty } = useFaculty();
  const { fetchSubjects, loadingSubjects } = useSubjects(campus, faculty);
  const [selangor, setSelangor] = useState(false);
  const [search, setSearch] = useState(false);
  const { fetchGroup } = useGroups(
    search ? campus : "",
    search ? faculty : "",
    search ? subjectName : ""
  );

  // Time slots from 8AM to 6PM in 2-hour intervals (used for parsing)
  const timeSlots = [
    "08:00-10:00",
    "10:00-12:00",
    "12:00-14:00",
    "14:00-16:00",
    "16:00-18:00",
  ];

  // Parse day_time string to extract day and time
  const parseDayTime = (
    dayTime: string
  ): { day: string; timeSlot: string } | null => {
    console.log("Parsing day_time:", dayTime); // Debug log

    if (!dayTime || dayTime.trim() === "") {
      console.log("Empty dayTime");
      return null;
    }

    const cleanDayTime = dayTime.trim();

    // Convert day abbreviations to full names
    const dayMap: { [key: string]: string } = {
      MON: "Monday",
      MONDAY: "Monday",
      TUE: "Tuesday",
      TUESDAY: "Tuesday",
      WED: "Wednesday",
      WEDNESDAY: "Wednesday",
      THU: "Thursday",
      THURSDAY: "Thursday",
      FRI: "Friday",
      FRIDAY: "Friday",
      SAT: "Saturday",
      SATURDAY: "Saturday",
      SUN: "Sunday",
      SUNDAY: "Sunday",
    };

    // Helper function to convert 12-hour to 24-hour format
    const convertTo24Hour = (timeStr: string): string => {
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return timeStr;

      let hour = parseInt(match[1]);
      const minute = match[2];
      const ampm = match[3].toUpperCase();

      //if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;

      return `${hour.toString().padStart(2, "0")}:${minute}`;
    };

    // Strategy 1: UiTM format "FRIDAY( 08:00 AM-10:00 AM )"
    let match = cleanDayTime.match(
      /^(\w+)\(\s*(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)\s*\)$/i
    );
    if (match) {
      const dayName = match[1];
      const startTime24 = convertTo24Hour(match[2]);
      const endTime24 = convertTo24Hour(match[3]);
      const day =
        dayMap[dayName.toUpperCase()] ||
        dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
      const formatted = `${startTime24}-${endTime24}`;

      // Find matching slot
      const matchingSlot = timeSlots.find((slot) => {
        const [slotStart, slotEnd] = slot.split("-");
        return startTime24 >= slotStart && startTime24 < slotEnd;
      });

      console.log("UiTM format parsed:", {
        day,
        timeSlot: matchingSlot || formatted,
        startTime24,
        endTime24,
      });
      return { day, timeSlot: matchingSlot || formatted };
    }

    // Strategy 2: Standard format "MON 0800-1000"
    match = cleanDayTime.match(
      /^(MON|TUE|WED|THU|FRI|SAT|SUN)\s+(\d{3,4})-(\d{3,4})$/i
    );
    if (match) {
      const day = dayMap[match[1].toUpperCase()];
      const startTime = match[2].padStart(4, "0");
      const endTime = match[3].padStart(4, "0");
      const formatted = `${startTime.slice(0, 2)}:${startTime.slice(
        2
      )}-${endTime.slice(0, 2)}:${endTime.slice(2)}`;

      const matchingSlot = timeSlots.find((slot) => {
        const slotStart = slot.split("-")[0];
        const classStart = `${startTime.slice(0, 2)}:${startTime.slice(2)}`;
        return classStart >= slotStart && classStart < slot.split("-")[1];
      });

      console.log("Standard format parsed:", {
        day,
        timeSlot: matchingSlot || formatted,
      });
      return { day, timeSlot: matchingSlot || formatted };
    }

    // Strategy 3: "Monday 08:00-10:00" format
    match = cleanDayTime.match(
      /^(\w+)\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/i
    );
    if (match) {
      const day = dayMap[match[1].toUpperCase()] || match[1];
      const startHour = match[2].padStart(2, "0");
      const startMin = match[3];
      const endHour = match[4].padStart(2, "0");
      const endMin = match[5];
      const formatted = `${startHour}:${startMin}-${endHour}:${endMin}`;

      const matchingSlot = timeSlots.find((slot) => {
        const slotStart = slot.split("-")[0];
        const classStart = `${startHour}:${startMin}`;
        return classStart >= slotStart && classStart < slot.split("-")[1];
      });

      console.log("24-hour format parsed:", {
        day,
        timeSlot: matchingSlot || formatted,
      });
      return { day, timeSlot: matchingSlot || formatted };
    }

    // Strategy 4: Fallback - just extract day name
    for (const [abbrev, fullDay] of Object.entries(dayMap)) {
      if (cleanDayTime.toUpperCase().includes(abbrev)) {
        console.log("Fallback day extraction:", {
          day: fullDay,
          timeSlot: timeSlots[0],
        });
        return { day: fullDay, timeSlot: timeSlots[0] };
      }
    }

    console.log("Could not parse:", dayTime);
    return null;
  };

  // Add class to timetable

  const addClass = (classItem: Group) => {
    console.log("Received:\n" + JSON.stringify(classItem, null, 2));

    const sameClasses = fetchGroup.filter(
      (c) => c.class_code === classItem.class_code
    );

    let hasConflict = false;
    const newClasses: SelectedClass[] = [];

    sameClasses.forEach((c) => {
      const parsed = parseDayTime(c.day_time);
      if (!parsed) return;

      console.log("parsed", parsed);

      const alreadySelected = selectedClasses.some(
        (sel) => sel.class_code === c.class_code && sel.day_time === c.day_time
      );

      if (alreadySelected) {
        console.log(`Skipped duplicate: ${c.class_code} ${c.day_time}`);
        return; // skip adding
      }

      const conflict = selectedClasses.find(
        (sel) => sel.day === parsed.day && sel.timeSlot === parsed.timeSlot
      );

      console.log(conflict);

      if (conflict) {
        hasConflict = true;
        console.log("here");
        setResult({
          result: "error",
          message: `Conflict detected! "${c.class_code}" overlaps with "${conflict.class_code}" on ${parsed.day} ${parsed.timeSlot}`,
        });
      } else {
        newClasses.push({
          ...c,
          day: parsed.day,
          timeSlot: parsed.timeSlot,
        });
        console.log("newclass", newClasses);
      }
    });

    if (!hasConflict && newClasses.length > 0) {
      setSelectedClasses((prev) => [...prev, ...newClasses]);
    }

    console.log("selected class", selectedClasses);

    if (hasConflict) {
      setTimeout(
        () =>
          setResult({
            result: "",
            message: "",
          }),
        7000
      );
    }
  };

  // Remove class from timetable
  const removeClass = (classCode: string) => {
    setSelectedClasses((prev) =>
      prev.filter((cls) => cls.class_code !== classCode)
    );
  };

  function handleCampusChange(selected: string) {
    const { campus, selangor } = parseCampus(selected);
    setCampus(campus);
    setSelangor(selangor);
  }

  // async function handleGroup(subjectName: string) {
  //   const sub = subjectName.toUpperCase();

  //   try {
  //     const result = await getGroup(campus, faculty, sub);

  //     //console.log("fetchgroup", result);

  //     if (Array.isArray(result)) {
  //       setFetchGroup(result);
  //     } else {
  //       //console.error("Expected array but got:", result);
  //       setFetchGroup([]);
  //       setResult({
  //         result: "error",
  //         message: "Subject does not exist",
  //       });
  //       setTimeout(
  //         () =>
  //           setResult({
  //             result: "",
  //             message: "",
  //           }),
  //         1000
  //       );
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  // async function getTimetable() {
  //   try {
  //     setLoadingCampus(true);
  //     const res = await fetch("/api/getTimetable");
  //     const data = await res.json();
  //     const firstClass = data[0];
  //     if (firstClass) {
  //       addClass(firstClass);
  //     }

  //     console.log("fetchtimetable", data);
  //   } catch (err) {
  //     console.error("Failed to fetch data:", err);
  //   } finally {
  //     setLoadingCampus(false);
  //   }
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-600/60 relative overflow-hidden">
      {result.result === "error" && (
        <OrderErrorPopup message={result.message} />
      )}
      {/* Animated background elements */}{" "}
      <div className="relative  min-h-screen p-4">
        {/* Header section */}
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-4xl font-bold text-gray-600 bg-clip-text">
            UitmGetTimetable
          </h1>
          <p className="text-gray-600 font-bold text-lg">
            An open source UiTM timetable generator
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left column - Selection controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
              {/* Campus dropdown */}
              {loadingCampus ? (
                <p className="text-gray-700 mb-4">Loading campuses...</p>
              ) : (
                <>
                  <select
                    className="w-full p-3 rounded-lg bg-white/40 text-gray-500 border border-black/20"
                    onChange={(e) => handleCampusChange(e.target.value)}
                  >
                    <option value="">Select Campus</option>
                    {fetchCampus.map((row, idx) => (
                      <option key={idx} value={row.text} className="text-black">
                        {row.text}
                      </option>
                    ))}
                  </select>
                  {selangor && (
                    <select
                      className="w-full p-3 rounded-lg bg-white/40 text-gray-500 border border-black/20"
                      onChange={(e) => setFaculty(e.target.value)}
                    >
                      <option value="">Select Faculty</option>
                      {fetchFaculty.map((row, idx) => (
                        <option key={idx} value={row.id} className="text-black">
                          {row.text}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}

              {/* Subject dropdown */}
              {loadingSubjects && (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Select
                    options={fetchSubjects.map((row) => ({
                      value: row.course,
                      label: row.course,
                    }))}
                    onChange={(selected) =>
                      setSubjectName(selected?.value ?? "")
                    }
                    placeholder="Select Subject"
                    className="w-full "
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }), // keep it on top
                    }}
                  />
                  <button
                    onClick={() => setSearch(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-500 text-white font-medium shadow hover:bg-blue-600 transition"
                  >
                    Search
                  </button>
                </div>
              )}
            </div>

            {/* Available Classes */}
            {fetchGroup.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Available Classes
                </h3>

                <input
                  type="text"
                  placeholder="Search class"
                  value={searchGroup}
                  onChange={(e) => setSearchGroup(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/40 text-gray-500 border border-black/20 mb-3"
                />
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {fetchGroup
                    .filter((row) =>
                      row.class_code
                        .toLowerCase()
                        .includes(searchGroup.toLowerCase())
                    )
                    .map((row) => {
                      const isSelected = selectedClasses.some(
                        (cls) =>
                          cls.class_code === row.class_code &&
                          cls.day_time === row.day_time
                      );

                      return (
                        <div
                          key={`${row.class_code}-${row.day_time}`}
                          onClick={() => addClass(row)}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? "bg-green-500/20 border border-green-300/50"
                              : "bg-white/50 hover:bg-green-300/30 border border-black/20"
                          }`}
                        >
                          <div className="text-black  font-medium">
                            {row.class_code}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {row.day_time} • {row.venue}
                          </div>
                          <div className="text-gray-600 text-xs">
                            {row.subject_code.length > 15
                              ? "KOKO"
                              : row.subject_code}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Debug Info */}
            {/* {selectedClasses.length > 0 && (
              <div className="bg-yellow-100/20 backdrop-blur-sm rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-200 mb-2">Debug: Selected Classes ({selectedClasses.length})</h4>
                <div className="text-xs text-yellow-300 space-y-1">
                  {selectedClasses.map((cls, idx) => (
                    <div key={idx}>
                      {cls.class_code}: Day=&quot;{cls.day}&quot;, TimeSlot=&quot;{cls.timeSlot}&quot;, Original=&quot;{cls.day_time}&quot;
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </div>

          {/* Right column - Timetable */}
          <div className="lg:col-span-2">
            <Timetable
              selectedClasses={selectedClasses}
              onRemoveClass={removeClass}
            />
          </div>
        </div>
      </div>
      <footer className="w-full bg-gray-200/50 text-gray-800 text-center py-4 flex flex-col sm:flex-row justify-center items-center gap-2">
        <a
          href="https://github.com/sykrwasd/uitmgettable"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline flex items-center gap-1"
        >
          <FaGithub className="w-5 h-5" />
          Fork us on GitHub
        </a>
        <span className="text-sm text-gray-600">
          by Umar Syakir | DISK UiTM Tapah
        </span>
      </footer>
    </div>
  );
}
