"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas-pro";
import { trackEvent } from "@/utils/umami";

interface SaveImageDeviceProps {
  timetableRef: React.RefObject<HTMLDivElement | null>;
  selectedCount: number;
}

export default function SaveImageDevice({
  timetableRef,
  selectedCount,
}: SaveImageDeviceProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [device, setDevice] = useState<"phone" | "tablet" | "laptop" | "image">(
    "phone"
  );

  const openModal = () => dialogRef.current?.showModal();
  const closeModal = () => dialogRef.current?.close();

  const saveAsImage = async () => {
    if (!timetableRef.current) return;

    try {
      toast.loading("Generating timetable image...", { id: "export" });

      const clone = timetableRef.current.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px";

      let width = 1080;

      if (device === "tablet") {
        width = 1200;
      } else if (device === "laptop") {
        width = 1920;
      } else if (device === "image") {
        // Use the original timetable's size
        const rect = timetableRef.current.getBoundingClientRect();
        width = rect.width + 100;
      }
      clone.style.width = `${width}px`;
      clone.style.height = `auto`;
      clone.style.transformOrigin = "top left";
      
      // Make it dynamic for smaller devices by squishing forced widths
      if (device === "phone" || device === "tablet") {
        const ths = clone.querySelectorAll("th");
        ths.forEach(th => th.classList.remove("min-w-[160px]"));
      }

      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, { scale: 3, windowWidth: width });
      const imgData = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = imgData;
      link.download = `timetable-${device}.png`;
      link.click();

      document.body.removeChild(clone);
      toast.success("📥 Timetable saved successfully!", {
        id: "export",
        duration: 2000,
      });

      trackEvent("save_timetable", { 
        method: "image", 
        device,
        classes_count: selectedCount
      });

      closeModal();
    } catch (error) {
      toast.error("Failed to export timetable", { id: "export" });
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="px-5 py-2 bg-blue-600/50 text-white font-semibold rounded-lg shadow hover:bg-blue-500 transition"
      >
        Export Timetable
      </button>

      <dialog ref={dialogRef} className="modal">
        <form method="dialog" className="modal-box bg-white">
          <h2 className="text-lg font-bold mb-4">Select Device</h2>
          <div className="flex gap-4 mb-4">
            {["phone", "tablet", "laptop", "image"].map((d) => (
              <button
                key={d}
                type="button"
                className={`px-4 py-2 border rounded ${
                  device === d ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() =>
                  setDevice(d as "phone" | "tablet" | "laptop" | "image")
                }
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 ">
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary bg-red-500 p-2 rounded text-white hover:bg-red-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveAsImage}
              className="btn-primary bg-blue-500 p-2 rounded text-white hover:bg-blue-700"
            >
              Download
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
