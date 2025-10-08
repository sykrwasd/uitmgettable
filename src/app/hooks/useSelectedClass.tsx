import { useState } from "react";
import { parseDayTime } from "@/lib/parseTime";

type Group = {
  no: string;
  day_time: string;
  class_code: string;
  mode: string;
  attempt: string;
  venue: string;
  subject_code: string;
  faculty: string;
  subject: string;
  lecturer?: string;
};

type SelectedClass = Group & {
  day: string;
  timeSlot: string;
};


export function useSelectedClass(fetchGroup: any[]) {
  const [selectedClasses, setSelectedClasses] = useState<SelectedClass[]>([]);
  const [result, setResult] = useState({ result: "", message: "" });

  const addClass = (classItem: any) => {
    const sameClasses = fetchGroup.filter((c) => c.class_code === classItem.class_code);
    const newClasses: any[] = [];
    let hasConflict = false;

    sameClasses.forEach((c) => {
      const parsed = parseDayTime(c.day_time);
      if (!parsed) return;

      const conflict = selectedClasses.find(
        (sel) => sel.day === parsed.day && sel.timeSlot === parsed.timeSlot
      );

      if (conflict) {
        hasConflict = true;
        setResult({
          result: "error",
          message: `Conflict! "${c.class_code}" overlaps with "${conflict.class_code}" on ${parsed.day} ${parsed.timeSlot}`,
        });
      } else {
        newClasses.push({ ...c, ...parsed });
      }
    });

    if (!hasConflict && newClasses.length) {
      setSelectedClasses((prev) => [...prev, ...newClasses]);
    }

    if (hasConflict) {
      setTimeout(() => setResult({ result: "", message: "" }), 7000);
    }
  };

  const removeClass = (classCode: string) => {
    setSelectedClasses((prev) => prev.filter((cls) => cls.class_code !== classCode));
  };

   //console.log(selectedClasses)

  return { selectedClasses, addClass, removeClass, result, setResult };
}
