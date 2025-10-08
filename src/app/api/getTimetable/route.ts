import axios from "axios";

type JadualClass = {
  masa: string;
  courseid: string;
  bilik: string;
  lecturer: string;
  groups:string
};

type DayData = {
  hari: string;
  jadual: JadualClass[];
};

export async  function POST(req: Request) {

  const {matricNumber} =  await req.json()
  console.log("received",matricNumber)
  try {
    const url = `https://cdn.uitm.edu.my/jadual/baru/${matricNumber}.json`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://mystudent.uitm.edu.my/",
      },
    });

    const rawData: Record<string, DayData> = res.data;

    const seen = new Set<string>();
    const reformattedData = Object.values(rawData)
      .filter((day) => day && day.jadual && day.jadual.length > 0)
      .flatMap((day) =>
        day.jadual.map((cls) => {
          const item = {
            no: " ",
          day_time: `${day.hari.toUpperCase()}( ${cls.masa.replace(/\s*-\s*/g, "-")} )`,

            class_code: cls.groups,
            mode: " ",
            attempt: "",
            venue: cls.bilik,
            subject_code: " ",
            faculty: " ",
            subject: cls.courseid,
            lecturer: cls.lecturer,
          };
          const key = `${item.day_time}-${item.class_code}`;
          if (seen.has(key)) return null; // skip duplicates
          seen.add(key);
          return item;
        })
      )
      .filter(Boolean); // remove nulls

      console.log(JSON.stringify(reformattedData, null, 2));
    return new Response(JSON.stringify(reformattedData), {
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching timetable:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch subject" }), {
      status: 500,
    });
  }
}
