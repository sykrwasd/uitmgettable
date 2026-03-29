import axios from "axios";

type JadualClass = {
  masa: string;
  courseid: string;
  bilik: string;
  lecturer: string;
  groups: string;
};

type DayData = {
  hari: string;
  jadual: JadualClass[];
};

// 🔧 Convert "10:00 AM-12:00 PM" → "10:00-12:00"
function formatTimeSlot(masa: string) {
  const [start, end] = masa.split("-").map((t) => t.trim());

  const to24 = (time: string) => {
    const [hourMin, modifier] = time.split(" ");
    let [hours, minutes] = hourMin.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };

  return `${to24(start)}-${to24(end)}`;
}

export async function POST(req: Request) {
  const { matricNumber } = await req.json();

  try {
    const url = `https://cdn.uitm.link/jadual/baru/${matricNumber}.json`;

    let res;
    let retries = 3;

    while (retries > 0) {
      try {
        res = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Referer: "https://mystudent.uitm.edu.my/",
          },
        });
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (!res) throw new Error("Failed to fetch timetable after retries");

    const rawData: Record<string, DayData> = res.data;

    const seen = new Set<string>();
    let counter = 0;

    const reformattedData = Object.values(rawData)
      .filter((day) => day?.jadual?.length > 0)
      .flatMap((day) =>
        day.jadual.map((cls) => {
          const dayTimeFormatted = `${day.hari.toUpperCase()}( ${cls.masa.replace(/\s*-\s*/g, "-")} )`;

          const item = {
            no: `${++counter}.`,
            day: day.hari,
            day_time: dayTimeFormatted,
            timeSlot: formatTimeSlot(cls.masa),

            class_code: cls.groups,
            subject_code: cls.courseid,
            subject_name: "", // ❗ not available from this source

            venue: cls.bilik,
            lecturer: cls.lecturer,

            faculty: "", // ❗ not available
            mode: "", // ❗ not available
            attempt: "", // ❗ not available
          };

          // 🚫 remove duplicates
          const key = `${item.day_time}-${item.class_code}`;
          if (seen.has(key)) return null;
          seen.add(key);

          return item;
        })
      )
      .filter(Boolean);


    return new Response(JSON.stringify(reformattedData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Error fetching timetable:", err);

    return new Response(
      JSON.stringify({ error: "Failed to fetch timetable" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}