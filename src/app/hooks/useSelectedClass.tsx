import { useState, useEffect } from "react";
import { parseDayTime } from "@/lib/parseTime";
import toast from 'react-hot-toast';

type Group = {
  no: string;
  day_time: string;
  class_code: string;
  mode: string;
  attempt: string;
  venue: string;
  subject_code: string;
  faculty: string;
  subject_name: string;
  lecturer?: string;
};

type SelectedClass = Group & {
  day: string;
  timeSlot: string;
};


export function useSelectedClass(fetchGroup: any[]) {
  const STORAGE_KEY = 'uitm-timetable-manual';
  
  // Always initialize with empty array to prevent hydration mismatch
  const [selectedClasses, setSelectedClasses] = useState<SelectedClass[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [result, setResult] = useState({ result: "", message: "" });

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log("saved2",parsed)
          if (parsed.length > 0) {
            setSelectedClasses(parsed);
            toast.success(
              `📚 Restored ${parsed.length} class${parsed.length > 1 ? 'es' : ''} from previous session`,
              { duration: 3000 }
            );
          }
        }
      } catch (error) {
        console.error('Failed to load timetable from localStorage:', error);
      }
      setIsLoaded(true);
    }
  }, []); // Run once on mount

  // Auto-save to localStorage whenever selectedClasses changes (but only after initial load)
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedClasses));
      } catch (error) {
        console.error('Failed to save timetable to localStorage:', error);
      }
    }
  }, [selectedClasses, isLoaded]);

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
        toast.error(
          `⚠️ Conflict! "${c.class_code.replace(/\*/g, "").trim()}" overlaps with "${conflict.class_code.replace(/\*/g, "").trim()}" on ${parsed.day} at ${parsed.timeSlot}`,
          { duration: 5000 }
        );
      } else {
        newClasses.push({ ...c, ...parsed });
      }
    });

    if (!hasConflict && newClasses.length) {
      setSelectedClasses((prev) => [...prev, ...newClasses]);
      toast.success(
        `✅ Added ${classItem.class_code.replace(/\*/g, "").trim()}`,
        { duration: 2000 }
      );
    }
  };

  const removeClass = (classCode: string) => {
    setSelectedClasses((prev) => prev.filter((cls) => cls.class_code !== classCode));
    toast.success(
      `🗑️ Removed ${classCode.replace(/\*/g, "").trim()}`,
      { duration: 2000 }
    );
  };

  const clearAll = () => {
    setSelectedClasses([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    toast.success('🧹 Timetable cleared', { duration: 2000 });
  };

   //console.log(selectedClasses)

  return { selectedClasses, addClass, removeClass, clearAll, result, setResult };
}
