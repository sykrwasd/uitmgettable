import { getTimetable } from "@/lib/api";
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
  subject_name: string;
  lecturer?: string;
};

type SelectedClass = Group & {
  day: string;
  timeSlot: string;
};

export function useTimetable() {
  const [fetchTimetable, setFetchTimetable] = useState<SelectedClass[]>([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  async function fetchData(matricNumber: string) {
    if (!matricNumber) return;

    setLoadingTimetable(true);
    try {
      const data: Group[] = await getTimetable(matricNumber);

      const formatted = data
        .map((item) => {
          const parsed = parseDayTime(item.day_time);
          return parsed ? { ...item, ...parsed } : null;
        })
        .filter(Boolean) as SelectedClass[];

      setFetchTimetable(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTimetable(false);
    }
  }

  return { fetchTimetable, loadingTimetable, fetchData };
}
