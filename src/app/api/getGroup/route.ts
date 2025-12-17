import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";
import { cookieManager } from "@/lib/cookieManager";

export async function POST(req: Request) {
  try {
    const { subjectName, campus: originalCampus, faculty } = await req.json();

    console.log("📥 Received subject:", subjectName);
    console.log("🏫 Faculty:", faculty);
    console.log("📍 Campus:", originalCampus);

    // --- Clean & Normalize Inputs ---
    const cleanSubject = subjectName.replace(/\./g, "").trim().toUpperCase();

    console.log("clean subject", cleanSubject);
    
    // --- Use Cookie Manager ---
    const { jar, ids } = await cookieManager.getCookies();
    if (!ids) throw new Error("Failed to get cookies");
    const { id1, id2, id3 } = ids;

    const client = wrapper(axios.create({ jar, withCredentials: true }));

    let campus = originalCampus;
    if (campus === "LANGUAGE COURSES") campus = "APB";
    else if (campus === "CITU COURSES") campus = "CITU";
    else if (campus === "CO") campus = "HEP";
    else if (campus === "selangor") campus = "B";

    // await client.get("https://simsweb4.uitm.edu.my/estudent/class_timetable/");
    // Remote fetch logic removed in favor of CookieManager

    console.log({ id1, id2, id3 });

    const url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm?id1=${id1}&id2=${id2}&id3=${id3}`;

    const payload = new URLSearchParams({
      captcha_no_type: "llIlllIlIIllIlIIIIlllIlIll",
      captcha1: "lIIlllIlIllIllIIIIIlIlllllIlIll",
      captcha2: "lIIlllIlIllIlIIlIllIIIIlllIllll",
      captcha3: "lIIlllIlIllIlIIlIllIIIIlllIllll",

      token1: "lIIlllIlIllIllIIIIIlIlllllIlIll",
      token2: "lIIlllIlIllIlIIlIllIIIIlllIllll",
      token3: "lIIlllIlIllIlIIlIllIIIIlllIllll",

      llIlllIlIIllIlIIIIlllIlIll: "lIIlllIlIllIlIIlIllIlIIIlllIlIll",
      llIlllIlIIlllllIIIlllIlIll: "lIIllIlIlllIlIIlIllIIIIllllIlIll",
      lIIlllIlIIlIllIIIIlllIlIll: "lIIlllIlIIIlllIIIIlIllIlllIlIll",

      lIIlIlllIlIIllIlIIIIlllIlIllI: "lIIlIlllIlIIllIlIIIIlllIlIlllI",
      lIIlIlllIlIIllIllIlIIIIlllIlIllI: "lIIlIlllIlIIllIllIlIIIIlllIlIllI",
      lIIlIlllIlIIllIlIIIIlllIlIlllIlIllI:
        "lIIlIlllIlIIllIlIIIIlllIlIlllIlIllI",
      lIIlIllIlIllllIlIIllIlIIIIlllIlIllI:
        "lIIlIllIlIllllIlIIllIlIIIIlllIlIllI",

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

      search_campus: campus,
      search_faculty: faculty,
      search_course: "",
      lIIIlllIIllll: "lIIIlllIIllll",
    });

    const res = await client.post(url, payload.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        Referer:
          "https://simsweb4.uitm.edu.my/estudent/class_timetable/indexIllIl.cfm",
      },
    });

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
    const groups = await getGroup(filtered,cleanSubject);
    
    //console.log("GROUPS", groups);
    return new Response(JSON.stringify(groups), { status: 200 });
  } catch (err) {
    console.error("❌ Error scraping:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch subject" }), {
      status: 500,
    });
  }
}

async function getGroup(filtered: any[], subject_name : string) {
  const results: any[] = [];
  console.log("subject_name", subject_name)

  for (const subject of filtered) {
    if (!subject.href) continue;

    //console.log("🔍 Fetching:", subject.href);

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
          subject_name : subject_name,
        });
      }
    });

    console.log("RESUKLT",rows)
    return rows;
  }
}
