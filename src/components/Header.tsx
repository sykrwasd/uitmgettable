
interface Props {
    mode:string
    setMode: (value:string) => void
}

export default function Header({mode,setMode}:Props) {
  return (
    <>
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
    </>
  );
}
