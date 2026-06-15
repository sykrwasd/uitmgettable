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
import Footer from "@/components/Footer";
import CampusSelect from "@/components/CampusSelect";
import SubjectSelect from "@/components/SubjectSelect";
import GroupList from "@/components/GroupList";
import ClassCodeSearch from "@/components/ClassCodeSearch";
import OrderErrorPopup from "@/components/orderError";
import Header from "@/components/Header";
import { useTimetable } from "./hooks/useTimetable";
import RegisteredList from "@/components/RegisteredList";
import FetchTimetable from "@/components/FetchTimetable";

export default function TimetableSwitcher() {
  const [mode, setMode] = useState<string>("manual");

  const [subjectName, setSubjectName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [searchGroup, setSearchGroup] = useState("");
  const [selangor, setSelangor] = useState(false);
  const [searchMode, setSearchMode] = useState<"campus" | "classcode">("campus");

  const { dark, toggle: toggleDark } = useTheme();
  const { fetchCampus, loadingCampus } = useCampus();
  const { fetchFaculty } = useFaculty();
  const { fetchSubjects, loadingSubjects } = useSubjects(campus, faculty);
  const { fetchGroup, loadingGroup } = useGroups(campus, faculty, subjectName);
  const { selectedClasses, addClass, addClassesBulk, removeClass, clearAll, result } =
    useSelectedClass(fetchGroup);
  const { fetchTimetable, loadingTimetable, fetchData } = useTimetable();

  const handleCampusChange = (selected: string) => {
    const { campus, selangor } = parseCampus(selected);
    setCampus(campus);
    setSelangor(selangor);
    setFaculty(""); // reset faculty on campus change
    setSubjectName(""); // reset subject too
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
        <Header
          mode={mode}
          setMode={(m) => {
            trackEvent("change_mode", { mode: m });
            setMode(m);
          }}
          dark={dark}
          toggleDark={toggleDark}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column — switches based on mode */}
          <div className="lg:col-span-1 space-y-6">
            {mode === "manual" ? (
              <div className="relative space-y-4">
                {/* Search mode toggle */}
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/40 dark:border-white/10">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setSearchMode("campus")}
                      className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition ${
                        searchMode === "campus"
                          ? "bg-blue-600 text-white"
                          : "bg-white/60 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-white/80"
                      }`}
                    >
                      By Campus
                    </button>
                    <button
                      onClick={() => setSearchMode("classcode")}
                      className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition ${
                        searchMode === "classcode"
                          ? "bg-blue-600 text-white"
                          : "bg-white/60 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-white/80"
                      }`}
                    >
                      By Class Code
                    </button>
                  </div>

                  {searchMode === "campus" ? (
                    <div className="flex flex-col gap-4">
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
                  ) : (
                    <ClassCodeSearch
                      fetchCampus={fetchCampus}
                      loadingCampus={loadingCampus}
                      onAddClasses={addClassesBulk}
                    />
                  )}
                </div>

                {/* Available Classes — only shown in campus mode */}
                {searchMode === "campus" && (
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
            ) : (
              <>
                {/* Smart Fetch: registered classes list */}
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/30 dark:border-white/10">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Registered Classes
                  </h3>
                  <RegisteredList
                    fetchTimetable={fetchTimetable}
                    loadingTimetable={loadingTimetable}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right Column — FetchTimetable for both modes */}
          <div className="lg:col-span-2">
            {mode === "manual" ? (
              <FetchTimetable
                selectedClasses={selectedClasses}
                onRemoveClass={removeClass}
                onClearAll={clearAll}
                editable={true}
              />
            ) : (
              <FetchTimetable
                selectedClasses={fetchTimetable}
                onRemoveClass={() => {}}
                editable={true}
                matricNumber={matricNumber}
                onMatricChange={setMatricNumber}
                onImport={handleFetch}
                loadingImport={loadingTimetable}
              />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
