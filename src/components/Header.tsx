interface Props {
  mode: string;
  setMode: (value: string) => void;
}

export default function Header({ mode, setMode }: Props) {
  return (
    <div className="text-center mb-6 sm:mb-8 md:mb-12 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Hero Section with Glass Morphism */}
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 blur-2xl sm:blur-3xl opacity-20"></div>
        <div className="relative bg-white/20 backdrop-blur-md rounded-2xl sm:rounded-3xl px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 border border-white/30 shadow-xl sm:shadow-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
            UitmGetTimetable
          </h1>

          <div className="h-0.5 sm:h-1 w-20 sm:w-28 md:w-32 mx-auto mt-2 sm:mt-2.5 md:mt-3 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-gray-700 font-medium text-sm sm:text-base md:text-lg lg:text-xl tracking-wide px-4">
        An <span className="font-bold text-blue-600">open source</span> UiTM
        timetable generator
      </p>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                ⚠️ <strong>Important:</strong> Always cross-check with UiTM
                official timetable schedule to avoid confusion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switch with Enhanced Design */}
      <div className="flex justify-center items-center gap-2.5 sm:gap-3 md:gap-4 mt-4 sm:mt-5 md:mt-6">
        <span
          className={`text-xs sm:text-sm md:text-base font-medium transition-all duration-300 ${
            mode === "manual"
              ? "text-blue-600 font-bold scale-105 sm:scale-110"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Custom Timetable
        </span>

        <label className="relative inline-flex items-center cursor-pointer group">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={mode === "auto"}
            onChange={() => setMode(mode === "manual" ? "auto" : "manual")}
          />
          {/* Toggle Background */}
          <div className="w-12 h-6 sm:w-14 sm:h-7 md:w-16 md:h-8 bg-gradient-to-r from-gray-300 to-gray-400 peer-focus:outline-none peer-focus:ring-2 sm:peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 transition-all duration-300 shadow-md sm:shadow-lg group-hover:shadow-lg sm:group-hover:shadow-xl"></div>
          {/* Toggle Slider */}
          <div className="absolute left-0.5 top-0.5 sm:left-1 sm:top-1 w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-all duration-300 peer-checked:translate-x-6 sm:peer-checked:translate-x-7 md:peer-checked:translate-x-8 flex items-center justify-center">
            <div
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-300 ${
                mode === "auto" ? "bg-blue-600" : "bg-gray-400"
              }`}
            ></div>
          </div>
        </label>

        <span
          className={`text-xs sm:text-sm md:text-base font-medium transition-all duration-300 ${
            mode === "auto"
              ? "text-blue-600 font-bold scale-105 sm:scale-110"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Smart Fetch
        </span>
      </div>
    </div>
  );
}
