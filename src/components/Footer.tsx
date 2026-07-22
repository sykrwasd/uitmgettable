"use client";

import { useState } from "react";
import { FaHeart, FaTimes } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  const [showDonate, setShowDonate] = useState(false);

  return (
    <>
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

        {/* Right - Donate */}
        <button
          onClick={() => setShowDonate(true)}
          className="text-pink-500 hover:text-pink-600 flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <FaHeart className="w-3.5 h-3.5" />
          Support Dev
        </button>
      </footer>

      {/* Donate modal */}
      {showDonate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDonate(false)}
        >
          <div
            className="relative bg-white dark:bg-[#112952] rounded-2xl shadow-2xl p-6 max-w-xs w-full flex flex-col items-center gap-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDonate(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-0.5">Support the dev</p>
              <h2 className="text-lg font-black text-gray-800 dark:text-white">Scan to donate</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">DuitNow QR · Any amount helps</p>
            </div>

            <Image
              src="/donate-qr.jpg"
              alt="Maybank DuitNow QR — Umar Syakir"
              width={220}
              height={220}
              className="rounded-xl"
            />

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Open your banking app and scan the QR above
            </p>
          </div>
        </div>
      )}
    </>
  );
}
