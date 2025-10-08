import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { subjectName, campus: originalCampus, faculty } = await req.json();

    console.log("📥 Received subject:", subjectName);
    console.log("🏫 Faculty:", faculty);
    console.log("📍 Campus:", originalCampus);

    // --- Clean & Normalize Inputs ---
    const cleanSubject = subjectName.replace(/\*/g, "").trim().toUpperCase();

    let campus = originalCampus;
    if (campus === "LANGUAGE COURSES") campus = "APB";
    else if (campus === "CITU COURSES") campus = "CITU";
    else if (campus === "CO") campus = "HEP";
    else if (campus === "selangor") campus = "B";

    // --- Payload ---
    const url =
      "https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm";

   const payload = new URLSearchParams({
       search_campus: campus,
       search_course: "",
       search_faculty: faculty,
       captcha_no_type: "",
       captcha1: "",
       captcha2: "",
       captcha3: "",
       token1: "lIIlllIlIllIllIIIIIlIlllllIlIll",
       token2: "lIIlllIlIllIlIIlIllIIIIlllIllll",
       token3: "lIIlllIlIllIlIIlIllIIIIlllIllll",
       llIlllIlIIllIlIIIIlllIlIll: "lIIlllIlIllIlIIlIllIlIIIlllIlIll",
       llIlllIlIIlllllIIIlllIlIll: "lIIllIlIlllIlIIlIllIIIIllllIlIll",
       lIIlllIlIIlIllIIIIlllIlIll: "lIIlllIlIIlIllIIIIlIllIlllIlIll",
       lIIlIlllIlIIllIlIIIIlllIlIllI: "lIIlIlllIlIIllIlIIIIlllIlIlllI",
       lIIlIlllIlIIllIllIlIIIIlllIlIllI: "lIIlIlllIlIIllIllIlIIIIlllIlIllI",
       lIIlIlllIlIIllIlIIIIlllIlIlllIlIllI: "lIIlIlllIlIIllIlIIIIlllIlIlllIlIllI",
       lIIlIllIlIllllIlIIllIlIIIIlllIlIllI: "lIIlIllIlIllllIlIIllIlIIIIlllIlIllI",
       lIIlIlllIlIIllllIlIIllIlIIIIlllIlIllI:
         "lIIlIlllIlIIllllIlIIllIllIIIIlllIlIllI",
       lIIlIlllIlIIIlIlllIlIIllIlIIIIlllIlIllI:
         "lIllIlllIlIIIlIlllIlIIllIlIIIIlllIlIllI",
       lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI:
         "lIIlIlllIlIIllIlIlIIlIIllIlIIIIlIlIllllI",
       llIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI:
         "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
       lllIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI:
         "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
       llllIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI:
         "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
       llllIIlIlllIlIIlllllIIIlIIllIlIIIIlllIlIllIl:
         "llllIIlIlllIlIIlllllIIIlIIllIlIIIIlllIlIllI",
     });
   
     // Request headers
     const res = await axios.post(url, payload.toString(), {
       headers: {
         "Accept": "*/*",
         "Accept-Encoding": "gzip, deflate, br, zstd",
         "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
         "Cache-Control": "no-cache",
         "Connection": "keep-alive",
         "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
         "Origin": "https://simsweb4.uitm.edu.my",
         "Pragma": "no-cache",
         "Referer":
           "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
         "Sec-Fetch-Dest": "empty",
         "Sec-Fetch-Mode": "cors",
         "Sec-Fetch-Site": "same-origin",
         "User-Agent":
           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
         "X-Requested-With": "XMLHttpRequest",
       },
       withCredentials: true,
     });

    const $ = cheerio.load(res.data);
    const rows: any[] = [];
    const baseUrl =
      "https://simsweb4.uitm.edu.my/estudent/class_timetable/";

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
    const groups = await getGroup(filtered);
    console.log("GROUPS",groups)
    return new Response(JSON.stringify(groups), { status: 200 });
  } catch (err) {
    console.error("❌ Error scraping:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch subject" }),
      { status: 500 }
    );
  }
}


async function getGroup(filtered: any[]) {
  const results: any[] = [];

  for (const subject of filtered) {
    if (!subject.href) continue;

    console.log("🔍 Fetching:", subject.href);

    const res = await axios.get(subject.href, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer:
          "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
      },
    });

    const $ = cheerio.load(res.data);
    const rows: any[] = [];

     $("table tr").each((_, tr) => {
      const cells = $(tr).find("td");
      if (cells.length > 0) {
        rows.push({
          no: $(cells[0]).text().trim(),
          day_time: $(cells[1]).text().trim(),
          class_code: $(cells[2]).text().trim(),
          mode: $(cells[3]).text().trim(),
          attempt: $(cells[4]).text().trim(),
          venue: $(cells[5]).text().trim(),
          subject_code: $(cells[6]).text().trim(),
          faculty: $(cells[7]).text().trim(),
        });
      }
    });

    //console.log("RESUKLT",rows)
    return rows;
  }

}
