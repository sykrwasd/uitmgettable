"use client";

import { useState } from "react";
import { trackEvent } from "@/utils/umami";
import { useTheme } from "./hooks/useTheme";
import { useCampus } from "./hooks/useCampus";
import { useFaculty } from "./hooks/useFaculty";
import { useSubjects } from "./hooks/useSubjects";
import { parseCampus } from "@/lib/utils";
import { useGroups } from "./hooks/useGroups";
import { useSelectedClass } from "./hooks/useSelectedClass";
import { useTimetable } from "./hooks/useTimetable";
import Footer from "@/components/Footer";
import CampusSelect from "@/components/CampusSelect";
import SubjectSelect from "@/components/SubjectSelect";
import GroupList from "@/components/GroupList";
import OrderErrorPopup from "@/components/orderError";
import Header from "@/components/Header";
import FetchTimetable from "@/components/FetchTimetable";

export default function TimetableSwitcher() {
  const [subjectName, setSubjectName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [searchGroup, setSearchGroup] = useState("");
  const [selangor, setSelangor] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  const { dark, toggle: toggleDark } = useTheme();
  const { fetchCampus, loadingCampus } = useCampus();
  const { fetchFaculty } = useFaculty();
  const { fetchSubjects, loadingSubjects } = useSubjects(campus, faculty);
  const { fetchGroup, loadingGroup } = useGroups(campus, faculty, subjectName);
  const { selectedClasses, addClass, addClassesBulk, removeClass, clearAll, result } =
    useSelectedClass(fetchGroup);

  // Smart fetch imports directly into the shared selectedClasses list
  const { loadingTimetable, fetchData } = useTimetable(addClassesBulk);

  const handleCampusChange = (selected: string) => {
    const { campus, selangor } = parseCampus(selected);
    setCampus(campus);
    setSelangor(selangor);
    setFaculty("");
    setSubjectName("");
  };

  const handleFetch = () => {
    if (!matricNumber.trim()) return;
    trackEvent("fetch_timetable", { matricNumber });
    fetchData(matricNumber);
  };

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500
      bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300
      dark:from-[#0c1e3d] dark:via-[#112952] dark:to-[#0d3b7a]">
      {result.result === "error" && (
        <OrderErrorPopup message={result.message} />
      )}

      <div className="relative min-h-screen p-4">
        <Header dark={dark} toggleDark={toggleDark} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Mobile collapse toggle */}
            <button
              onClick={() => setLeftPanelOpen((p) => !p)}
              className="lg:hidden w-full flex items-center justify-between px-4 py-2.5 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-lg border border-white/40 dark:border-white/10 text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              <span>Add Classes</span>
              <span className="text-gray-400">{leftPanelOpen ? "▲" : "▼"}</span>
            </button>

            <div className={`space-y-4 lg:block ${leftPanelOpen ? "block" : "hidden"}`}>

              {/* Smart Fetch — matric import */}
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/40 dark:border-white/10 space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Smart Fetch
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                    placeholder="Enter matric number…"
                    className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={handleFetch}
                    disabled={loadingTimetable || !matricNumber.trim()}
                    className="shrink-0 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {loadingTimetable ? "…" : "Import"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Imports your registered classes — then add more below.
                </p>
              </div>

              {/* Manual add — campus / subject */}
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/40 dark:border-white/10 space-y-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Add manually
                </p>
                <CampusSelect
                  loadingCampus={loadingCampus}
                  fetchCampus={fetchCampus}
                  handleCampusChange={handleCampusChange}
                  selangor={selangor}
                  setFaculty={setFaculty}
                  fetchFaculty={fetchFaculty}
                />
                <SubjectSelect
                  loadingSubjects={loadingSubjects}
                  fetchSubjects={fetchSubjects}
                  setSubjectName={setSubjectName}
                />
              </div>

              {/* Available Classes */}
              {campus && (
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/30 dark:border-white/10">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Available Classes
                  </h3>
                  <GroupList
                    loadingGroup={loadingGroup}
                    fetchGroup={fetchGroup}
                    searchGroup={searchGroup}
                    setSearchGroup={setSearchGroup}
                    selectedClasses={selectedClasses}
                    addClass={addClass}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column — one unified timetable */}
          <div className="lg:col-span-2">
            <FetchTimetable
              selectedClasses={selectedClasses}
              onRemoveClass={removeClass}
              onClearAll={clearAll}
              editable={true}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
