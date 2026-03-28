import axios from "axios";
import * as cheerio from "cheerio";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export async function POST(req: Request) {
  try {
    const { subjectName, campus: originalCampus, faculty } =
      await req.json();

    console.log("📥 Subject:", subjectName);
    console.log("🏫 Faculty:", faculty);
    console.log("📍 Campus:", originalCampus);

    const cleanSubject = subjectName
      .replace(/\./g, "")
      .trim()
      .toUpperCase();

    // --- Normalize campus ---
    let campus = originalCampus;
    if (campus === "LANGUAGE COURSES") campus = "APB";
    else if (campus === "CITU COURSES") campus = "CITU";
    else if (campus === "CO") campus = "HEP";
    else if (campus === "selangor") campus = "B";

    // --- 1. Create session client ---
    const jar = new CookieJar();
    const client = wrapper(
      axios.create({
        jar,
        withCredentials: true,
      })
    );

    // --- 2. Initial request (GET cookies) ---
    const basePage =
      "https://simsweb4.uitm.edu.my/estudent/class_timetable/";
    await client.get(basePage);

    // --- 3. Extract KEY cookies ---
    const cookies = await jar.getCookies(basePage);

    let id1 = "",
      id2 = "",
      id3 = "";

    for (const c of cookies) {
      if (c.key === "KEY1") id1 = c.value;
      if (c.key === "KEY2") id2 = c.value;
      if (c.key === "KEY3") id3 = c.value;
    }

    console.log("🍪 Cookies:", { id1, id2, id3 });

    // --- 4. Build URL with session ---
    const url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm?id1=${id1}&id2=${id2}&id3=${id3}`;

    // --- 5. Build payload ---
    const payload = new URLSearchParams({
      captcha_no_type: "llIlllIlIIllIlIIIIlllIlIll",
      captcha1: "lIIlllIlIllIllIIIIIlIlllllIlIll",
      captcha2: "lIIlllIlIllIlIIlIllIIIIlllIllll",
      captcha3: "lIIlllIlIllIlIIlIllIIIIlllIllll",
      token1: "lIIlllIlIllIllIIIIIlIlllllIlIll",
      token2: "lIIlllIlIllIlIIlIllIIIIlllIllll",
      token3: "lIIlllIlIllIlIIlIllIIIIlllIllll",
      llIlllIlIIllIlIIIIlllIlIll:
        "lIIlllIlIllIlIIlIllIlIIIlllIlIll",
      llIlllIlIIlllllIIIlllIlIll:
        "lIIllIlIlllIlIIlIllIIIIllllIlIll",
      lIIlllIlIIlIllIIIIlllIlIll:
        "lIIlllIlIIIlllIIIIlIllIlllIlIll",
      lIIlIlllIlIIllIlIIIIlllIlIllI:
        "lIIlIlllIlIIllIlIIIIlllIlIlllI",
      lIIlIlllIlIIllIllIlIIIIlllIlIllI:
        "lIIlIlllIlIIllIllIlIIIIlllIlIllI",
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
      search_faculty: faculty || "",
      search_course: "",
      lIIIlllIIllll: "lIIIlllIIllll",
    });

    // --- 6. POST request ---
    const res = await client.post(url, payload.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        Referer:
          "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
        "X-Requested-With": "XMLHttpRequest",
      },
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

    console.log("📊 Total subjects:", rows.length);

    // --- Filter ---
    const filtered = rows.filter((row) =>
      row.course.toUpperCase().includes(cleanSubject)
    );

    console.log("🎯 Filtered:", filtered.length);

    if (filtered.length === 0) {
      return new Response(
        JSON.stringify({ message: "No matching subjects found" }),
        { status: 404 }
      );
    }

    // --- Get groups ---
    const groups = await getGroup(client, filtered, cleanSubject);

    return new Response(JSON.stringify(groups), { status: 200 });
  } catch (err) {
    console.error("❌ Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch subject" }),
      { status: 500 }
    );
  }
}

// ------------------------

async function getGroup(
  client: any,
  filtered: any[],
  subject_name: string
) {
  const results: any[] = [];

  for (const subject of filtered) {
    if (!subject.href) continue;

    await new Promise((r) => setTimeout(r, 300));

    console.log("🔗 Fetching:", subject.href);

    const res = await client.get(subject.href, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer:
          "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
      },
    });

    const $ = cheerio.load(res.data);

    $("table tr").each((_, tr) => {
      const cells = $(tr).find("td");

      if (cells.length >= 8) {
        results.push({
          no: $(cells[0]).text().trim(),
          day_time: $(cells[1]).text().trim(),
          class_code: $(cells[2]).text().trim(),
          mode: $(cells[3]).text().trim(),
          attempt: $(cells[4]).text().trim(),
          venue: $(cells[5]).text().trim(),
          subject_code: $(cells[6]).text().trim(),
          faculty: $(cells[7]).text().trim(),
          subject_name,
        });
      }
    });
  }

  console.log("✅ Total classes:", results.length);
  return results;
}