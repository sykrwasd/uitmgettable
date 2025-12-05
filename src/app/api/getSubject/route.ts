import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
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

  console.log("received campus", campus);
  console.log("receivde faclty", faculty);
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, withCredentials: true }));

  // After the first GET:
  await client.get("https://simsweb4.uitm.edu.my/estudent/class_timetable/");

  // Read cookies from jar
  const cookies = await jar.getCookies(
    "https://simsweb4.uitm.edu.my/estudent/class_timetable/"
  );

  let id1, id2, id3;

  for (const c of cookies) {
    if (c.key === "KEY1") id1 = c.value;
    if (c.key === "KEY2") id2 = c.value;
    if (c.key === "KEY3") id3 = c.value;
  }

  console.log({ id1, id2, id3 });

  // Build dynamic URL
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

    search_campus: processedCampus,
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

  //console.log("Fetched subjects:", rows.length);

  const fixed = rows.map((item, index, arr) => ({
    ...item,
    href: arr[(index + arr.length) % arr.length].href,
    // example : index = 2
    // (2-1+3)%3
    // 4%3
    // 1
    // so -> index 2 ke index 1
  }));
  return rows;
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
