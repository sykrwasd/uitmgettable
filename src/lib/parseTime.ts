export type ParsedDayTime = {
  day: string;
  timeSlot: string;
};

export function parseDayTime(dayTime: string): ParsedDayTime | null {
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
    // Handle AM/PM formats like "08:00 AM" or "8:00AM"
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      let h = parseInt(match[1]);
      const min = match[2];
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && h !== 12 && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return `${String(h).padStart(2, "0")}:${min}`;
    }
    // Already HH:MM
    return timeStr.trim();
  };

  const clean = dayTime.trim();

  // UiTM format: FRIDAY( 08:00 AM-10:00 AM ) or FRIDAY(08:00AM-10:00AM)
  let m = clean.match(/^(\w+)\(\s*(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)\s*\)$/i);
  if (m) {
    const day = dayMap[m[1].toUpperCase()] || m[1];
    const start = convertTo24(m[2]);
    const end = convertTo24(m[3]);
    return { day, timeSlot: `${start}-${end}` };
  }

  // Standard numeric format: MON 0800-1000 or MON 0830-1030
  m = clean.match(/^(MON|TUE|WED|THU|FRI|SAT|SUN)\s+(\d{3,4})-(\d{3,4})$/i);
  if (m) {
    const day = dayMap[m[1].toUpperCase()];
    const s = m[2].padStart(4, "0");
    const e = m[3].padStart(4, "0");
    const start = `${s.slice(0, 2)}:${s.slice(2)}`;
    const end = `${e.slice(0, 2)}:${e.slice(2)}`;
    return { day, timeSlot: `${start}-${end}` };
  }

  // "Monday 08:00-10:00" or "Monday 08:30-10:30"
  m = clean.match(/^(\w+)\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/i);
  if (m) {
    const day = dayMap[m[1].toUpperCase()] || m[1];
    const start = `${m[2].padStart(2, "0")}:${m[3]}`;
    const end = `${m[4].padStart(2, "0")}:${m[5]}`;
    return { day, timeSlot: `${start}-${end}` };
  }

  // Fallback: just return the first recognized day with unknown time
  for (const [abbr, full] of Object.entries(dayMap)) {
    if (clean.toUpperCase().startsWith(abbr)) return { day: full, timeSlot: "08:00-10:00" };
  }

  return null;
}
