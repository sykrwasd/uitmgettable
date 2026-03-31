"use client";

import { useState } from "react";
import { trackEvent } from "@/utils/umami";
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

  const { fetchCampus, loadingCampus } = useCampus();
  const { fetchFaculty } = useFaculty();
  const { fetchSubjects, loadingSubjects } = useSubjects(campus, faculty);
  const { fetchGroup, loadingGroup } = useGroups(campus, faculty, subjectName);
  const { selectedClasses, addClass, removeClass, clearAll, result } =
    useSelectedClass(fetchGroup);
  const { fetchTimetable, loadingTimetable, fetchData } = useTimetable();

  const handleCampusChange = (selected: string) => {
    const { campus, selangor } = parseCampus(selected);
    setCampus(campus);
    setSelangor(selangor);
  };

  const handleFetch = () => {
    if (!matricNumber.trim()) return;
    trackEvent("fetch_timetable", { matricNumber });
    fetchData(matricNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-600/60 relative overflow-hidden">
      {result.result === "error" && (
        <OrderErrorPopup message={result.message} />
      )}

      <div className="relative min-h-screen p-4">
        <Header mode={mode} setMode={(m) => {
          trackEvent("change_mode", { mode: m });
          setMode(m);
        }} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column — switches based on mode */}
          <div className="lg:col-span-1 space-y-6">
            {mode === "manual" ? (
              <>
                {/* Manual: campus + subject selectors */}
                <div className="relative bg-white/50 backdrop-blur-sm rounded-lg p-6 space-y-4">
                  <div className="flex flex-col gap-5">
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
                </div>

                {/* Available Classes */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
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
              </>
            ) : (
              <>
                {/* Smart Fetch: registered classes list */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
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
              />
            ) : (
              <FetchTimetable
                selectedClasses={fetchTimetable}
                onRemoveClass={() => {}}
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
