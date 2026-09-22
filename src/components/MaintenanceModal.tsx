"use client";

import { useState } from "react";

export default function MaintenanceModal() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0f1e3d] rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col items-center gap-4 text-center border border-black/10 dark:border-white/10">

        <div className="text-4xl">🔧</div>

        <div>
          <h2 className="text-lg font-black text-gray-800 dark:text-white">Timetable data is updating</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            We&apos;re refreshing data for the new semester. Some timetables may be incomplete or missing right now.
          </p>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Check back in a few hours — it&apos;ll all be fixed soon.
        </p>

        <button
          onClick={() => setDismissed(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          Got it, continue anyway
        </button>
      </div>
    </div>
  );
}
