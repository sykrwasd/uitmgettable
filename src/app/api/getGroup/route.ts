import axios from "axios";
import * as cheerio from "cheerio";
import { createUitmPayload, UITM_TIMETABLE_URL, UITM_TIMETABLE_HEADERS } from "@/lib/uitmPayload";

export async function POST(req: Request) {
  try {
    const { subjectName, campus: originalCampus, faculty } = await req.json();

    console.log("📥 Received subject:", subjectName);
    console.log("🏫 Faculty:", faculty);
    console.log("📍 Campus:", originalCampus);

    // --- Clean & Normalize Inputs ---
    const cleanSubject = subjectName.replace(/\./g, "").trim().toUpperCase();

    console.log("clean subject", cleanSubject);

    let campus = originalCampus;
    if (campus === "LANGUAGE COURSES") campus = "APB";
    else if (campus === "CITU COURSES") campus = "CITU";
    else if (campus === "CO") campus = "HEP";
    else if (campus === "selangor") campus = "B";

    const payload = createUitmPayload(campus, faculty, "");

    let res;
    let retries = 3;
    while (retries > 0) {
      try {
        res = await axios.post(UITM_TIMETABLE_URL, payload.toString(), {
          headers: UITM_TIMETABLE_HEADERS,
        });
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (!res) throw new Error("Failed to fetch group after retries");

    const $ = cheerio.load(res.data);
    const rows: any[] = [];
    const baseUrl = "https://simsweb4.uitm.edu.my/estudent/class_timetable/";

    $("table tr").each((_, tr) => {
      const cells = $(tr).find("td");
      if (cells.length === 3) {
        const href = $(cells[2]).find("a").attr("href");
        rows.push({
          no: $(cells[0]).text().trim(),
          course: $(cells[1]).text().trim(),
          href: href ? baseUrl + href : null,
        });
      }
    });

    //console.log(rows)

    // --- Filter Subject ---
    const filtered = rows.filter((row) =>
      row.course.toUpperCase().includes(cleanSubject)
    );

    if (filtered.length === 0) {
      return new Response(
        JSON.stringify({ message: "No matching subjects found" }),
        { status: 404 }
      );
    }

    // --- Fetch group details ---
    const groups = await getGroup(filtered, cleanSubject);
    
    //console.log("GROUPS", groups);
    return new Response(JSON.stringify(groups), { status: 200 });
  } catch (err) {
    console.error("❌ Error scraping:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch subject" }), {
      status: 500,
    });
  }
}

async function getGroup(filtered: any[], subject_name: string) {
  const results: any[] = [];
  console.log("subject_name", subject_name)

  for (const subject of filtered) {
    if (!subject.href) continue;

    // Small delay to prevent UITM server from closing the socket (ECONNRESET)
    await new Promise((resolve) => setTimeout(resolve, 300));

    let res;
    let retries = 3;
    while (retries > 0) {
      try {
        res = await axios.get(subject.href, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Referer:
              "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
          },
        });
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (!res) throw new Error("Failed to fetch group details after retries");

    const $ = cheerio.load(res.data);

    $("table tr").each((_, tr) => {
      const cells = $(tr).find("td");
      if (cells.length > 0) {
        results.push({
          no: $(cells[0]).text().trim(),
          day_time: $(cells[1]).text().trim(),
          class_code: $(cells[2]).text().trim(),
          mode: $(cells[3]).text().trim(),
          attempt: $(cells[4]).text().trim(),
          venue: $(cells[5]).text().trim(),
          subject_code: $(cells[6]).text().trim(),
          faculty: $(cells[7]).text().trim(),
          subject_name: subject_name,
        });
      }
    });
  }

  console.log("RESULT", results.length, "rows total");
  return results;
}
