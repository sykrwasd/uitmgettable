 "use client";
import { useState } from "react";

export default function OrderErrorPopup({ message = "Something went wrong!" }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-xs">
      <div className="bg-red-200/50 rounded-2xl shadow-lg p-6 max-w-sm w-full text-center  outline-3 outline-red-400 ">
        <h2 className="text-2xl font-bold text-red-600 mb-3">❌ Error</h2>
        <p className="text-gray-700">{message}</p>
        
        <button
          onClick={() => setIsOpen(false)}
          className="mt-5 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
