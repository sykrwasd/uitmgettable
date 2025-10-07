"use client";

import { useEffect, useState } from "react";
import { useCampus } from "./hooks/useCampus";
import { useFaculty } from "./hooks/useFaculty";
import { useSubjects } from "./hooks/useSubjects";
import { parseCampus } from "@/lib/utils";
import { useGroups } from "./hooks/useGroups";
import Footer from "@/components/Footer";
import CampusSelect from "@/components/CampusSelect";
import SubjectSelect from "@/components/SubjectSelect";
import Timetable from "@/components/timetable";
import GroupList from "@/components/GroupList";
import OrderErrorPopup from "@/components/orderError";
import { useSelectedClass } from "./hooks/useSelectedClass";


export default function Home() {
  const [subjectName, setSubjectName] = useState("");
  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [searchGroup, setSearchGroup] = useState("");
  const { fetchCampus, loadingCampus } = useCampus();
  const { fetchFaculty } = useFaculty();
  const { fetchSubjects, loadingSubjects } = useSubjects(campus, faculty);
  const [selangor, setSelangor] = useState(false);
  const { fetchGroup, loading: loadingGroup } = useGroups(
    campus,
    faculty,
    subjectName
  );
  const { selectedClasses, addClass, removeClass, result } =
    useSelectedClass(fetchGroup);

  function handleCampusChange(selected: string) {
    const { campus, selangor } = parseCampus(selected);
    setCampus(campus);
    setSelangor(selangor);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-600/60 relative overflow-hidden">
      {result.result === "error" && (
        <OrderErrorPopup message={result.message} />
      )}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <div className="lg:col-span-1 space-y-6">
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
              ></SubjectSelect>
            </div>

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
              ></GroupList>
            </div>
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

      <Footer></Footer>
    </div>
  );
}
