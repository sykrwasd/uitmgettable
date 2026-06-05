"use client";
import { FaGithub } from "react-icons/fa";

interface Props {
  mode: string;
  setMode: (value: string) => void;
  dark: boolean;
  toggleDark: () => void;
}

export default function Header({ mode, setMode, dark, toggleDark }: Props) {
  return (
    <div className="mb-10">

      {/* Top bar */}
      <div className="flex justify-end items-center gap-2 mb-6">
        <a
          href="https://github.com/sykrwasd/uitmgettable"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 border border-black/10 dark:border-white/10 shadow-sm text-xs font-medium text-gray-600 dark:text-gray-300 hover:scale-105 transition-transform"
        >
          <FaGithub className="w-3.5 h-3.5" />
          GitHub
        </a>
        <button
          onClick={toggleDark}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 dark:bg-white/10 border border-black/10 dark:border-white/10 shadow-sm hover:scale-105 transition-transform text-base"
          title="Toggle theme"
        >
          {dark ? "Light" : "Dark"}
        </button>
      </div>

      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
          Open Source UiTM Tool
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
          UiTM Get<span className="text-blue-500">Timetable</span>
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
          Build, view and export your UiTM class timetable — fast and free.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-full">
            Trusted by 20k+ students
          </span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-full">
            10k+ timetables generated
          </span>
        </div>

        {/* Warning */}
        <div className="max-w-2xl mx-auto mt-2">
          <p className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 rounded-lg px-4 py-2.5">
            Always cross-check with UiTM&apos;s official timetable to avoid confusion.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center items-center gap-4 pt-2">
          <span className={`text-sm font-semibold transition-colors ${
            mode === "manual" ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
          }`}>
            Custom Timetable
          </span>

          <button
            onClick={() => setMode(mode === "manual" ? "auto" : "manual")}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
              mode === "auto" ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
              mode === "auto" ? "translate-x-7" : "translate-x-0"
            }`} />
          </button>

          <span className={`text-sm font-semibold transition-colors ${
            mode === "auto" ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
          }`}>
            Smart Fetch
          </span>
        </div>
      </div>

    </div>
  );
}
