import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-200/50 text-gray-800 text-center py-4 flex flex-col sm:flex-row justify-between items-center gap-2 px-6">
      {/* Left - Report button */}
      <a
        href="https://github.com/sykrwasd/uitmgettable/issues/new"
        target="_blank"
        rel="noopener noreferrer"
        className="text-red-500 hover:underline text-sm"
      >
        Report a Problem
      </a>

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
  );
}
