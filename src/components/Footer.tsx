import { FaGithub, FaHistory } from "react-icons/fa";

export default function Footer() {
  return (
    <>
      <footer className="w-full bg-gray-200/50 text-gray-800 text-center py-4 flex flex-col sm:flex-row justify-between items-center gap-2 px-6">
        <div className="flex items-center gap-4">
          {/* Report button */}
          <a
            href="https://github.com/sykrwasd/uitmgettable/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:underline text-sm"
          >
            Report a Problem
          </a>

          {/* Logs button */}
          <button
            onClick={() =>
              (
                document.getElementById("changelog_modal") as HTMLDialogElement
              )?.showModal()
            }
            className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-1 hover:underline"
          >
            <FaHistory className="w-3 h-3" />
            Logs
          </button>
        </div>

        {/* Center - GitHub */}
        <a
          href="https://github.com/sykrwasd/uitmgettable"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline flex items-center gap-1"
        >
          <FaGithub className="w-5 h-5" />
          Fork us on GitHub
        </a>

        {/* Right - Credits */}
        <span className="text-sm text-gray-600">
          by Umar Syakir | DISK UiTM Tapah
        </span>
      </footer>

      {/* Changelog Modal */}
      <dialog id="changelog_modal" className="modal">
        <div className="modal-box bg-white text-left max-w-lg">
          <h3 className="font-bold text-2xl mb-4 text-gray-800 flex items-center gap-2">
            <FaHistory /> Changelog
          </h3>

          <div className="space-y-6">
            {/* Version 1.1 */}
            <div className="relative border-l-2 border-blue-500 pl-4 ml-2">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
              <h4 className="font-bold text-lg text-gray-800">Ver 1.2</h4>
              <p className="text-sm text-gray-500 mb-2">Dec 3, 2025</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>
  <span className="font-semibold text-blue-600">New:</span>{" "}
  <span className="animate-gradient bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
    Colourful Classes
  </span>
</li>

                <li>
                  <span className="font-semibold text-blue-600">New:</span>{" "}
                  Auto-save timetable (LocalStorage)
                </li>
                <li>
                  <span className="font-semibold text-blue-600">New:</span>{" "}
                  Toast notifications for actions
                </li>
                <li>
                  <span className="font-semibold text-blue-600">New:</span>{" "}
                  Skeleton loading animations
                </li>
              
              </ul>
            </div>

            {/* Version 1.0.5 */}
            <div className="relative border-l-2 border-gray-300 pl-4 ml-2">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-300 "></div>
              <h4 className="font-bold text-lg text-gray-800">Ver 1.1</h4>
              <p className="text-sm text-gray-500 mb-2">Oct 8, 2025</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>
                  Auto-fetch from iStudent Portal
                </li>
                <li>Added "Smart Fetch" mode</li>
              </ul>
            </div>

            {/* Version 1.0 */}
            <div className="relative border-l-2 border-gray-300 pl-4 ml-2">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-300"></div>
              <h4 className="font-bold text-lg text-gray-800">Ver 1.0</h4>
              <p className="text-sm text-gray-500 mb-2">Sep 29, 2025</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Initial Release</li>
                <li>Manual Timetable Creation</li>
                <li>Export as Image (PNG)</li>
              </ul>
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
              <button className="btn bg-blue-600 hover:bg-blue-700 text-white border-none">
                Close
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
