import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";

async function scrape() {
  // --- 1. Get cookies (cookie.js algorithm) ---
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, withCredentials: true }));

  await client.get("https://simsweb4.uitm.edu.my/estudent/class_timetable/");

  const cookieList = await jar.getCookies(
    "https://simsweb4.uitm.edu.my/estudent/class_timetable/",
  );

  let id1 = "",
    id2 = "",
    id3 = "";
  for (const c of cookieList) {
    if (c.key === "KEY1") id1 = c.value;
    if (c.key === "KEY2") id2 = c.value;
    if (c.key === "KEY3") id3 = c.value;
  }

  console.log("Cookies:", { id1, id2, id3 });

  // --- 2. Build URL with cookie IDs ---
  const url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm?id1=${id1}&id2=${id2}&id3=${id3}`;

  // Updated payload
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
    search_campus: "K",
    search_course: "MGT400",
    lIIIlllIIllll: "lIIIlllIIllll",
  });

  // Request headers
  const res = await client.post(url, payload.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      Referer:
        "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
    },
  });

  const $ = cheerio.load(res.data);
  const rows = [];

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

  //console.log("Subjects found:", rows.length);

  const subjectName = "MGT400";
  const filtered = rows.filter((row) =>
    row.course.toUpperCase().includes(subjectName.toUpperCase()),
  );

  //console.log("Filtered:", filtered);

  console.log(rows);

  await getGroup(filtered);
}

async function getGroup(filtered) {
  if (filtered.length === 0) {
    console.log("No matching subjects found!");
    return;
  }

  for (const subject of filtered) {
    const url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/${subject.href}`;
    console.log("Fetching:", url);

    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        Referer:
          "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
      },
    });

    const $ = cheerio.load(res.data);
    const rows = [];

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

    console.log(JSON.stringify(rows, null, 2));
  }
}

scrape().catch(console.error);
