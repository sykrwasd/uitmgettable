import axios from "axios";
import * as cheerio from "cheerio";

async function fetchSubjects(campus: string, faculty: string) {
  let processedCampus = campus;

  if (campus === "LANGUAGE COURSES") {
    processedCampus = "APB";
  } else if (campus === "CITU COURSES") {
    processedCampus = "CITU";
  } else if (campus === "CO") {
    processedCampus = "HEP";
  } else if (campus === "selangor") {
    processedCampus = "B";
  }

  const url =
    "https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm";

  const payload = new URLSearchParams({
    search_campus: `${processedCampus}`, // APB,CITU,HEP,B
    search_faculty: `${faculty}`,
    search_course: "",
    captcha_no_type: "",
    token1: "lIIlllIlIIlIllIIIIIlIlllllIlIll",
    token2: "lIIlllIlIllIlIIlIllIIIIlllIlIll",
    token3: "lIIlllIlIIlIllIIIIlllIlIlI",
    llIlllIlIIllIlIIIIlllIlIll: "lIIlllIlIllIlIIlIllIIIIlllIlIll",
    llIlllIlIIlllllIIIlllIlIll: "lIIllIlIlllIlIIlIllIIIIlllIlIll",
    lIIlllIlIIlIllIIIIlllIlIll: "lIIlllIlIIlIllIIIIlIllIlllIlIll",
  });

  const res = await axios.post(url, payload.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Content-Type": "application/x-www-form-urlencoded",
      Referer:
        "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
    },
  });

  const $ = cheerio.load(res.data);

  const rows: any[] = [];
  $("table tr").each((_, tr) => {
    const cells = $(tr).find("td");
    if (cells.length === 3) {
      const href = $(cells[2]).find("a").attr("href"); // grab href
      rows.push({
        no: $(cells[0]).text().trim(),
        course: $(cells[1]).text().trim(),
        href: href || null,
      });
    }
  });

  console.log("Fetched subjects:", rows.length);
  return rows;
}

export async function POST(req: Request) {
  try {
    const { campus: originalCampus, faculty } = await req.json();
    console.log("POST - Received campus:", originalCampus);
    console.log("POST - Received faculty:", faculty);

    const rows = await fetchSubjects(originalCampus, faculty);
    console.log(rows)

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in POST /api/getSubject:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch subjects" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campus = searchParams.get("campus") || "";
    const faculty = searchParams.get("faculty") || "";

    console.log("GET - Received campus:", campus);
    console.log("GET - Received faculty:", faculty);

    if (!campus) {
      return new Response(JSON.stringify({ error: "Campus parameter is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rows = await fetchSubjects(campus, faculty);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in GET /api/getSubject:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch subjects" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
