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

interface GroupProps {
  fetchTimetable: Group[];
  loadingTimetable: boolean;
}

export default function RegisteredList({
  loadingTimetable,
  fetchTimetable,
}: GroupProps) {
  // ✅ Remove duplicates — based on subject name
  const uniqueTimetable = Array.from(
    new Map(fetchTimetable.map((item) => [item.subject.trim(), item])).values()
  );

  return (
    <>
      {loadingTimetable ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white/90 rounded-xl border border-gray-200 p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : uniqueTimetable.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No registered classes found.</p>
      ) : (
        <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent">
          {uniqueTimetable.map((row, idx) => (
            <div
              key={idx}
              className="bg-white/90 rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md hover:bg-white"
            >
              {/* Top: Subject + Code */}
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                  {row.subject}
                </h4>
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                  {row.class_code.replace(/\*/g, "").trim()}
                </span>
              </div>

              {/* Middle: Day, Venue */}
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-medium">{row.day_time}</span>
                {" • "}
                {row.venue}
              </p>

              {/* Bottom: Subject Code + Lecturer */}
              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>
                  {row.subject_code.length > 15 ? "KOKO" : row.subject_code}
                </span>
                {row.lecturer && (
                  <span className=" text-gray-500">{row.lecturer}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
