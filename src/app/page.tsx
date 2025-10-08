"use client";

import { useState } from "react";
import { useCampus } from "./hooks/useCampus";
import { useFaculty } from "./hooks/useFaculty";
import { useSubjects } from "./hooks/useSubjects";
import { parseCampus } from "@/lib/utils";
import { useGroups } from "./hooks/useGroups";
import { useSelectedClass } from "./hooks/useSelectedClass";
import Footer from "@/components/Footer";
import CampusSelect from "@/components/CampusSelect";
import SubjectSelect from "@/components/SubjectSelect";
import Timetable from "@/components/timetable";
import GroupList from "@/components/GroupList";
import OrderErrorPopup from "@/components/orderError";

export default function TimetableSwitcher() {
  const [mode, setMode] = useState<"manual" | "auto">("manual");

  const [subjectName, setSubjectName] = useState("");
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [searchGroup, setSearchGroup] = useState("");
  const [selangor, setSelangor] = useState(false);

  const { fetchCampus, loadingCampus } = useCampus();
  const { fetchFaculty } = useFaculty();
  const { fetchSubjects, loadingSubjects } = useSubjects(campus, faculty);
  const { fetchGroup, loading: loadingGroup } = useGroups(
    campus,
    faculty,
    subjectName
  );
  const { selectedClasses, addClass, removeClass, result } =
    useSelectedClass(fetchGroup);

  const handleCampusChange = (selected: string) => {
    const { campus, selangor } = parseCampus(selected);
    setCampus(campus);
    setSelangor(selangor);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-600/60 relative overflow-hidden">
      {result.result === "error" && (
        <OrderErrorPopup message={result.message} />
      )}

      <div className="relative min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
<div className="text-center mb-8 space-y-4">
          <h1 className="text-4xl font-bold text-gray-600 bg-clip-text">
            UitmGetTimetable
          </h1>
          <p className="text-gray-600 font-bold text-lg">
            An open source UiTM timetable generator
          </p>
        </div>

          {/* Mode Switch */}
          <div className="flex justify-center items-center gap-3 mt-2">
            <span className={mode === "manual" ? "font-semibold" : ""}>
              Custom Timetable
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={mode === "auto"}
                onChange={() => setMode(mode === "manual" ? "auto" : "manual")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all"></div>
              <div
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-all peer-checked:translate-x-5`}
              ></div>
            </label>
            <span className={mode === "auto" ? "font-semibold" : ""}>
              Smart Fetch
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column - switchable */}
          <div className="lg:col-span-1 space-y-6">
            {mode === "manual" ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
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
              <div className="backdrop-blur-sm rounded-lg p-6 text-center border bg-yellow-200/50 border-yellow-300/70">
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  🚧 Smart Fetch (Under Construction)
                </h3>
                <p className="text-gray-600 text-base">
                  This feature is currently being developed. Soon, you’ll be
                  able to automatically fetch your registered classes directly
                  from UiTM’s system!
                </p>
                <div className="mt-4 inline-block bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg font-semibold">
                  Coming Soon 🚀
                </div>
              </div>
            )}

            {/* Available Classes List (only for manual) */}
            {mode === "manual" ? (
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
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Registered Classes
                </h3>
              </div>
            )}
          </div>

          {/* Right Column - always timetable */}
          <div className="lg:col-span-2">
            <Timetable
              selectedClasses={selectedClasses}
              onRemoveClass={removeClass}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
