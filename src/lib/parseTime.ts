// src/lib/parseDayTime.ts
export type ParsedDayTime = {
  day: string;
  timeSlot: string;
};

export function parseDayTime(dayTime: string): ParsedDayTime | null {
  const timeSlots = [
    "08:00-10:00",
    "10:00-12:00",
    "12:00-14:00",
    "14:00-16:00",
    "16:00-18:00",
  ];

  const dayMap: Record<string, string> = {
    MON: "Monday",
    MONDAY: "Monday",
    TUE: "Tuesday",
    TUESDAY: "Tuesday",
    WED: "Wednesday",
    WEDNESDAY: "Wednesday",
    THU: "Thursday",
    THURSDAY: "Thursday",
    FRI: "Friday",
    FRIDAY: "Friday",
    SAT: "Saturday",
    SATURDAY: "Saturday",
    SUN: "Sunday",
    SUNDAY: "Sunday",
  };

  const convertTo24 = (timeStr: string): string => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return timeStr;
    const [_, hour, min, ampm] = match;
    let h = parseInt(hour);
    if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
    if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${min}`;
  };

  const clean = dayTime.trim();

  // UiTM format (e.g. FRIDAY( 08:00 AM-10:00 AM ))
  let m = clean.match(/^(\w+)\(\s*(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)\s*\)$/i);
  if (m) {
    const day = dayMap[m[1].toUpperCase()] || m[1];
    const start = convertTo24(m[2]);
    const end = convertTo24(m[3]);
    const slot = timeSlots.find((s) => start >= s.split("-")[0] && start < s.split("-")[1]);
    return { day, timeSlot: slot || `${start}-${end}` };
  }

  // Standard format (MON 0800-1000)
  m = clean.match(/^(MON|TUE|WED|THU|FRI|SAT|SUN)\s+(\d{3,4})-(\d{3,4})$/i);
  if (m) {
    const day = dayMap[m[1].toUpperCase()];
    const start = `${m[2].padStart(4, "0")}`;
    const end = `${m[3].padStart(4, "0")}`;
    const formatted = `${start.slice(0, 2)}:${start.slice(2)}-${end.slice(0, 2)}:${end.slice(2)}`;
    const slot = timeSlots.find((s) => formatted >= s);
    return { day, timeSlot: slot || formatted };
  }

  // "Monday 08:00-10:00"
  m = clean.match(/^(\w+)\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/i);
  if (m) {
    const day = dayMap[m[1].toUpperCase()] || m[1];
    const formatted = `${m[2].padStart(2, "0")}:${m[3]}-${m[4].padStart(2, "0")}:${m[5]}`;
    return { day, timeSlot: formatted };
  }

  // Fallback (just the day)
  for (const [abbr, full] of Object.entries(dayMap)) {
    if (clean.toUpperCase().includes(abbr)) return { day: full, timeSlot: timeSlots[0] };
  }

  return null;
}
