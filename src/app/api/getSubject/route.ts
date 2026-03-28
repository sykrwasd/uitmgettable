import axios from "axios";
import * as cheerio from "cheerio";
import { createUitmPayload, UITM_TIMETABLE_URL, UITM_TIMETABLE_HEADERS } from "@/lib/uitmPayload";

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

  console.log("received campus", campus);
  console.log("receivde faclty", faculty);

  const payload = createUitmPayload(processedCampus, faculty, "");

  let retries = 5;
  while (retries > 0) {
    try {
      const res = await axios.post(UITM_TIMETABLE_URL, payload.toString(), {
        headers: UITM_TIMETABLE_HEADERS,
      });


      const $ = cheerio.load(res.data);
      const rows: any[] = [];
      
      $("table tr").each((_, tr) => {
        const cells = $(tr).find("td");
        if (cells.length === 3) {
          const href = $(cells[2]).find("a").attr("href");
          rows.push({
            no: $(cells[0]).text().trim(),
            course: $(cells[1]).text().trim(),
            href: href || null,
          });
        }
      });

      if (rows.length === 0) {
        throw new Error("Empty subjects list (possible CAPTCHA/session failure). Retrying...");
      }

      return rows;
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error("Failed to fetch subjects after retries");
}

export async function POST(req: Request) {
  try {
    const { campus: originalCampus, faculty } = await req.json();
    console.log("POST - Received campus:", originalCampus);
    console.log("POST - Received faculty:", faculty);

    const rows = await fetchSubjects(originalCampus, faculty);
    //console.log(rows);

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
      return new Response(
        JSON.stringify({ error: "Campus parameter is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
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
