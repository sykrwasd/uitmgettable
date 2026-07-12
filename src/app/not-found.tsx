import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 text-center
      bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300
      dark:from-[#0c1e3d] dark:via-[#112952] dark:to-[#0d3b7a]">

      {/* Logo mark top-left */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 52 52" fill="none">
            <rect width="52" height="52" rx="12" fill="rgba(29,78,216,0.15)"/>
            <rect x="8" y="10" width="9" height="14" rx="2.5" fill="#93C5FD"/>
            <rect x="8" y="27" width="9" height="15" rx="2.5" fill="#BFDBFE"/>
            <rect x="21.5" y="10" width="9" height="8" rx="2.5" fill="#1D4ED8"/>
            <rect x="21.5" y="21.5" width="9" height="20.5" rx="2.5" fill="#3B82F6"/>
            <rect x="35" y="10" width="9" height="20" rx="2.5" fill="#60A5FA"/>
            <rect x="35" y="33" width="9" height="9" rx="2.5" fill="#93C5FD"/>
          </svg>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">UiTMGetTable</span>
        </Link>
      </div>

      <div className="max-w-md w-full space-y-6">
        {/* 404 number */}
        <div className="text-8xl font-black leading-none text-blue-500 dark:text-blue-400 select-none">
          404
        </div>

        {/* Gif */}
        <img
          src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2l6dWpxcTcydTdrMHZ2ZnJlN3ZycGMyZXBsdmVmNzkxcjFwd3VxaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f99OlzSrutL3qCi5je/giphy.gif"
          alt="lost"
          className="w-56 h-56 object-cover rounded-2xl mx-auto shadow-xl"
        />

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">
            Wrong timetable slot.
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            This page doesn&apos;t exist 
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200 shadow-md"
        >
          ← Back to timetable
        </Link>
      </div>
    </div>
  );
}
