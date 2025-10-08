"use client";

import { useEffect, useState } from "react";
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
import Header from "@/components/Header";
import TimetableFetch from "@/components/TimetableFetch";
import { useTimetable } from "./hooks/useTimetable";
import RegisteredList from "@/components/RegisteredList";
import FetchTimetable from "@/components/FetchTimetable";

export default function TimetableSwitcher() {
  const [mode, setMode] = useState<string>("manual");

  const [subjectName, setSubjectName] = useState("");
  const [matricNumber,setMatricNumber] = useState("")
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [searchGroup, setSearchGroup] = useState("");
  const [selangor, setSelangor] = useState(false);

  const { fetchCampus, loadingCampus } = useCampus();
  const { fetchFaculty } = useFaculty();
  const { fetchSubjects, loadingSubjects } = useSubjects(campus, faculty);
  const { fetchGroup, loadingGroup } = useGroups(campus,faculty,subjectName);
  const { selectedClasses, addClass, removeClass, result } = useSelectedClass(fetchGroup);
  const { fetchTimetable ,loadingTimetable,fetchData } = useTimetable()

  const handleCampusChange = (selected: string) => {
    const { campus, selangor } = parseCampus(selected);
    setCampus(campus);
    setSelangor(selangor);
  };

  const handleFetch = () => {
      fetchData(matricNumber)
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-600/60 relative overflow-hidden">
      {result.result === "error" && (
        <OrderErrorPopup message={result.message} />
      )}
      

      <div className="relative min-h-screen p-4">
        {/* Header */}
        <Header mode={mode} setMode={setMode}></Header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column - switchable */}
          <div className="lg:col-span-1 space-y-6">
           {mode === "manual" ? (
  <div className="relative bg-white/50 backdrop-blur-sm rounded-lg p-6 space-y-4">
    {/* Overlay */}
     <div className="absolute inset-0 bg-red-600/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10 p-4">
      <p className="text-white font-bold text-lg text-center">
        Temporarily Closed 🚧
      </p>
      <p className="text-white text-sm text-center mt-2">
        Manual timetable is unreliable due to source format changes. Use the new feature instead.
      </p>
    </div>

    {/* Original content still exists, but unclickable */}
    <div className="opacity-50 pointer-events-none">
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
) : (
  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
    <TimetableFetch matricNumber={matricNumber} setMatricNumber={setMatricNumber} onFetch={handleFetch}></TimetableFetch>
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

                <RegisteredList
                fetchTimetable={fetchTimetable}
                loadingTimetable={loadingTimetable}
                ></RegisteredList>
              </div>
            )}
          </div>

          {/* Right Column - always timetable */}
          <div className="lg:col-span-2">

            {mode === "manual" ? (

              <Timetable
                selectedClasses={selectedClasses}
                onRemoveClass={removeClass}
              />
            ) : (

              <FetchTimetable
                selectedClasses={fetchTimetable}
                onRemoveClass={() => {}}
              ></FetchTimetable>

            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
