import { FaHeart } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-white/60 dark:bg-white/5 backdrop-blur-sm border-t border-black/10 dark:border-white/10 text-gray-800 dark:text-gray-300 text-center py-4 flex flex-col sm:flex-row justify-between items-center gap-2 px-6">
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/sykrwasd/uitmgettable/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-500 hover:underline text-sm"
        >
          Report a Problem
        </a>
      </div>

      {/* Center - KrackedDevs */}
      <a
        href="https://krackeddevs.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-gray-900 px-4 py-1.5 rounded-full opacity-80 hover:opacity-100 transition-opacity"
      >
        <span className="text-xs text-gray-400 font-medium">Backed by</span>
        <Image
          src="/kdlogodev-light.svg"
          alt="KrackedDevs"
          width={140}
          height={35}
          className="h-8 w-auto"
        />
      </a>

      <div className="w-24" />
    </footer>
  );
}
