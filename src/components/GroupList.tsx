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

interface GroupProps {
  loadingGroup: boolean;
  fetchGroup: Group[];
  selectedClasses: SelectedClass[];
  searchGroup: string;
  setSearchGroup: (value: string) => void;
  addClass: (value: Group) => void;
}

export default function GroupList({
  loadingGroup,
  fetchGroup,
  searchGroup,
  setSearchGroup,
  selectedClasses,
  addClass,
}: GroupProps) {
  return (
    <>
      {loadingGroup ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : fetchGroup.length === 0 ? (
        <p className="text-gray-500">No classes available</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search class code..."
            value={searchGroup}
            onChange={(e) => setSearchGroup(e.target.value)}
            className="w-full mb-4 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 bg-white text-black"
          />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {fetchGroup.length > 0 &&
              fetchGroup
                .filter((row,idx) =>
                  row.class_code
                    .toLowerCase()
                    .includes(searchGroup.toLowerCase())
                )
                .map((row,idx) => {
                  const isSelected = selectedClasses.some(
                    (cls) =>
                      cls.class_code === row.class_code &&
                      cls.day_time === row.day_time
                  );

                  return (
                    <div
                      key={idx}
                      onClick={() => addClass(row)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "bg-green-500/20 border border-green-300/50"
                          : "bg-white/50 hover:bg-green-300/30 border border-black/20"
                      }`}
                    >
                      <div className="text-black font-medium">
                        {row.class_code.replace(/\*/g, "").trim()}
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
        </>
      )}
    </>
  );
}
