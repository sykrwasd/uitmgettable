import { trackEvent } from "@/utils/umami";

type Campus = {
  id: string;
  text: string;
};

type Faculty = {
  text: string;
  id: string;
};

interface CampusProps {
  loadingCampus: boolean;
  fetchCampus: Campus[];
  fetchFaculty: Faculty[];
  selangor:boolean;
  handleCampusChange: (value: string) => void;
  setFaculty: (value:string) => void
}

export default function CampusSelect({
  loadingCampus,
  fetchCampus,
  handleCampusChange,
  selangor,
  setFaculty,
  fetchFaculty
}: CampusProps) {
  return (
    <>
      {/* Campus dropdown */}
      {loadingCampus ? (
                <p className="text-gray-700 mb-4">Loading campuses...</p>
              ) : (
                <>
                  <select
                    className="w-full p-3 rounded-lg bg-white/40 text-gray-500 border border-black/20"
                    onChange={(e) => {
                      trackEvent("select_campus", { campus: e.target.value });
                      handleCampusChange(e.target.value);
                    }}
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
                      onChange={(e) => {
                        trackEvent("select_faculty", { faculty: e.target.value });
                        setFaculty(e.target.value);
                      }}
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
    </>
  );
}
