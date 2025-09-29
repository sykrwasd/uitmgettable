"use client";

import { useEffect, useState } from "react";

type Campus = {
  id: string;
  text: string;
};

type Group = {
  day_time: string;
  venue: string;
  class_code: string;
};

type Subject = {
  subject: string;
  path: string;
};

export default function Home() {
  const [selectCampus, setSelectCampus] = useState(false);
  const [fetchCampus, setFetchCampus] = useState<Campus[]>([]);
  const [loadingCampus, setLoadingCampus] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [campus, setCampus] = useState(" ");
  const [fetchSubjects, setFetchSubjects] = useState<Subject[]>([]);
  const [fetchGroup, setFetchGroup] = useState<Group[]>([]);
  const [group, setGroup] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  const filteredGroup = fetchGroup.filter(
    (row) => row.class_code === selectedGroup
  );

  useEffect(() => {
    getCampus();
  }, []);

  async function getCampus() {
    try {
      setLoadingCampus(true);
      const res = await fetch("/api/getCam");
      const data = await res.json();
      setFetchCampus(data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoadingCampus(false);
    }
  }

  async function getSubject(campus: string) {
    campus = campus.split("-")[0];
    try {
      setLoadingSubjects(true);
      const res = await fetch("/api/getSubject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campus),
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setFetchSubjects(data);
      } else {
        console.error("Expected array but got:", data);
        setFetchSubjects([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubjects(false);
    }
  }

  async function getGroup(url: string) {
    //alert(url)
    console.log(url);
    try {
      //setLoadingSubjects(true)
      const res = await fetch("/api/getGroup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(url),
      });

      const data = await res.json();
      console.log(data);
      if (Array.isArray(data)) {
        setFetchGroup(data);
      } else {
        console.error("Expected array but got:", data);
        setFetchSubjects([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      //setLoadingSubjects(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-600/60 relative overflow-hidden">
      {/* Animated background elements */}{" "}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>{" "}
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg">
          {/* Header section */}
          <div className="text-center mb-8 space-y-4">
            <h1 className="text-4xl font-bold text-gray-600 bg-clip-text">
              UitmGetTimetable
            </h1>
            <p className="text-gray-600 font-bold text-lg">
              Smart scheduling made simple
            </p>
          </div>

          {!selectCampus && (
            <>
              {/* Campus dropdown */}
              {loadingCampus ? (
                <p className="text-gray-700 mb-4">Loading campuses...</p>
              ) : (
                <select
                  className="w-full p-3 mb-4 rounded-lg bg-black/40 text-white border border-black/20"
                  onChange={(e) => getSubject(e.target.value)}
                >
                  <option value="">Select Campus</option>
                  {fetchCampus.map((row, idx) => (
                    <option key={idx} value={row.text} className="text-black">
                      {row.text}
                    </option>
                  ))}
                </select>
              )}

              {/* Subject dropdown */}
              {loadingSubjects ? (
                <p className="text-gray-700">Loading subjects...</p>
              ) : fetchSubjects.length > 0 ? (
                <select
                  className="w-full p-3 rounded-lg bg-black/40 text-white border border-black/20"
                  onChange={(e) => getGroup(e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {fetchSubjects.map((row, idx) => (
                    <option
                      key={row.path}
                      value={row.path}
                      className="text-black"
                    >
                      {row.subject}
                    </option>
                  ))}
                </select>
              ) : null}
            </>
          )}
          <select
            className="w-full p-3 rounded-lg bg-black/40 text-white border border-black/20"
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">Select Group</option>
            {[...new Set(fetchGroup.map((row) => row.class_code))].map(
              (code, idx) => (
                <option key={idx} value={code} className="text-black">
                  {code}
                </option>
              )
            )}
          </select>

          {selectedGroup && (
            <div className="mt-4 space-y-2">
              {fetchGroup
                .filter((row) => row.class_code === selectedGroup)
                .map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white/70 text-gray-800 shadow"
                  >
                    <p>
                      <b>Class Code:</b> {row.class_code}
                    </p>
                    <p>
                      <b>Day & Time:</b> {row.day_time}
                    </p>
                    <p>
                      <b>Venue:</b> {row.venue}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {selectedGroup && (
  <div className="mt-6">
    <h2 className="text-xl font-bold text-gray-700 mb-4">
      Timetable for {selectedGroup}
    </h2>

    <table className="w-full border-collapse border border-gray-400 text-sm text-center">
      <thead>
        <tr className="bg-gray-200 text-gray-700">
          <th className="border border-gray-400 p-2">Time</th>
          {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map(
            (day) => (
              <th key={day} className="border border-gray-400 p-2">
                {day}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody>
        {["08:00 AM-10:00 AM", "10:00 AM-12:00 PM", "14:00 PM-16:00 PM"].map(
          (time) => (
            <tr key={time}>
              <td className="border border-gray-400 p-2 font-medium">{time}</td>
              {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map(
                (day) => {
                  const row = fetchGroup.find((item) => {
                    const match = item.day_time.match(/(.*)\((.*)\)/);
                    const itemDay = match ? match[1].trim() : "";
                    const itemTime = match ? match[2].trim() : "";
                    return (
                      item.class_code === selectedGroup &&
                      itemDay === day &&
                      itemTime === time
                    );
                  });

                  return (
                    <td
                      key={day + time}
                      className="border border-gray-400 p-2 text-gray-800"
                    >
                      {row ? (
                        <div>
                          <div className="font-bold">{row.class_code}</div>
                          <div className="text-xs">{row.venue}</div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  );
                }
              )}
            </tr>
          )
        )}
      </tbody>
    </table>
  </div>
)}

        </div>
      </div>
      <footer className="fixed bottom-0 left-0 w-full bg-gray-200/50 text-white text-center py-4">
        UMAR SYAKIR
      </footer>
    </div>
  );
}
