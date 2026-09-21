import axios from "axios";
import * as cheerio from "cheerio";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { writeFileSync, mkdirSync } from "fs";

const BASE = "https://simsweb4.uitm.edu.my/estudent/class_timetable/";
const OUTPUT_DIR = "./public/timetable";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const FACULTIES = [
  { text: 'ARSHAD AYUB GRADUATE BUSINESS SCHOOL', id: 'AA' },
  { text: 'FACULTY OF ACCOUNTANCY', id: 'AC' },
  { text: 'FACULTY OF ART AND DESIGN', id: 'AD' },
  { text: 'FACULTY OF ADMINISTRATIVE SCIENCE AND POLICY STUDIES', id: 'AM' },
  { text: 'FACULTY OF ARCHITECTURE, PLANNING AND SURVEYING', id: 'AP' },
  { text: 'FACULTY OF APPLIED SCIENCES', id: 'AS' },
  { text: 'FACULTY OF BUSINESS AND MANAGEMENT', id: 'BA' },
  { text: 'FACULTY OF BUILT ENVIRONMENT', id: 'BE' },
  { text: 'FACULTY OF BUSINESS MANAGEMENT', id: 'BM' },
  { text: 'COLLEGE OF CREATIVE ARTS', id: 'CA' },
  { text: 'COLLEGE OF COMPUTING, INFORMATICS AND MATHEMATICS', id: 'CD' },
  { text: 'COLLEGE OF ENGINEERING', id: 'CE' },
  { text: 'COLLEGE OF BUILT ENVIRONMENT', id: 'CF' },
  { text: 'INSTI OF CONTINUING EDUCATION & PROFESSIONAL STUDIES', id: 'CP' },
  { text: 'FACULTY OF COMPUTER AND MATHEMATICAL SCIENCES', id: 'CS' },
  { text: 'FACULTY OF DENTISTRY', id: 'DS' },
  { text: 'FACULTY OF CIVIL ENGINEERING', id: 'EC' },
  { text: 'FACULTY OF EDUCATION', id: 'ED' },
  { text: 'FACULTY OF ELECTRICAL ENGINEERING', id: 'EE' },
  { text: 'FACULTY OF CHEMICAL ENGINEERING', id: 'EH' },
  { text: 'FACULTY OF MECHANICAL ENGINEERING', id: 'EM' },
  { text: 'FACULTY OF FILM, THEATRE AND ANIMATION', id: 'FF' },
  { text: 'FACULTY OF HOTEL AND TOURISM MANAGEMENT', id: 'HM' },
  { text: 'FACULTY OF HEALTH SCIENCES', id: 'HS' },
  { text: 'ACADEMY OF CONTEMPORARY ISLAMIC STUDIES', id: 'IC' },
  { text: 'FACULTY OF INFORMATION MANAGEMENT', id: 'IM' },
  { text: 'INTERNATIONAL', id: 'IN' },
  { text: 'ACADEMY OF LANGUAGE STUDIES', id: 'LG' },
  { text: 'MALAYSIA INSTITUTE OF TRANSPORT', id: 'LT' },
  { text: 'FACULTY OF LAW', id: 'LW' },
  { text: 'FACULTY OF COMMUNICATION AND MEDIA STUDIES', id: 'MC' },
  { text: 'FACULTY OF MEDICINE', id: 'MD' },
  { text: 'FACULTY OF MUSIC', id: 'MU' },
  { text: 'FACULTY OF PHARMACY', id: 'PH' },
  { text: 'FACULTY OF INFORMATION SCIENCE', id: 'SI' },
  { text: 'FACULTY OF SPORTS SCIENCE AND RECREATION', id: 'SR' },
];

async function getSessionKeys(client, jar) {
  await client.get(BASE);
  const cookieList = await jar.getCookies(BASE);
  let key1 = "", key2 = "", key3 = "";
  for (const c of cookieList) {
    if (c.key === "KEY1") key1 = c.value;
    if (c.key === "KEY2") key2 = c.value;
    if (c.key === "KEY3") key3 = c.value;
  }
  return { key1, key2, key3 };
}

async function getCourseList(client, faculty, key1, key2, key3) {
  const payload = {
    "captcha_no_type": "llIlllIlIIllIlIIIIlllIlIll",
    "captcha1": "lIIlllIlIllIllIIIIIlIlllllIlIll",
    "captcha2": "lIIlllIlIllIlIIlIllIIIIlllIllll",
    "captcha3": "lIIlllIlIllIlIIlIllIIIIlllIllll",
    "token1": "lIIlllIlIllIllIIIIIlIlllllIlIll",
    "token2": "lIIlllIlIllIlIIlIllIIIIlllIllll",
    "token3": "lIIlllIlIllIlIIlIllIIIIlllIllll",
    "llIlllIlIIllIlIIIIlllIlIll": "lIIlllIlIllIlIIlIllIlIIIlllIlIll",
    "llIlllIlIIlllllIIIlllIlIll": "lIIllIlIlllIlIIlIllIIIIllllIlIll",
    "lIIlllIlIIlIllIIIIlllIlIll": "lIIlllIlIIIlllIIIIlIllIlllIlIll",
    "lIIlIlllIlIIllIlIIIIlllIlIllI": "lIIlIlllIlIIllIlIIIIlllIlIlllI",
    "lIIlIlllIlIIllIllIlIIIIlllIlIllI": "lIIlIlllIlIIllIllIlIIIIlllIlIllI",
    "lIIlIlllIlIIllIlIIIIlllIlIlllIlIllI": "lIIlIlllIlIIllIlIIIIlllIlIlllIlIllI",
    "lIIlIllIlIllllIlIIllIlIIIIlllIlIllI": "lIIlIllIlIllllIlIIllIlIIIIlllIlIllI",
    "lIIlIlllIlIIllllIlIIllIlIIIIlllIlIllI": "lIIlIlllIlIIllllIlIIllIllIIIIlllIlIllI",
    "lIIlIlllIlIIIlIlllIlIIllIlIIIIlllIlIllI": "lIllIlllIlIIIlIlllIlIIllIlIIIIlllIlIllI",
    "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI": "lIIlIlllIlIIllIlIlIIlIIllIlIIIIlIlIllllI",
    "llIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI": "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
    "lllIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI": "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
    "llllIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI": "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
    "llllIIlIlllIlIIlllllIIIlIIllIlIIIIlllIlIllIl": "llllIIlIlllIlIIlllllIIIlIIllIlIIIIlllIlIllI",
    "search_campus": "B",
    "search_faculty": faculty,
    "search_course": "",
    "lIIIlllIIllll": "lIIIlllIIllll"
  };

  const url = `${BASE}INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm?id1=${key1}&id2=${key2}&id3=${key3}`;
  const res = await client.post(url, new URLSearchParams(payload).toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0",
      Referer: `${BASE}index.htm`,
    },
  });

  const $ = cheerio.load(res.data);
  const courses = [];
  $("tr.gradeU").each((i, row) => {
    const code = $(row).find("td:nth-child(2)").text().trim();
    const href = $(row).find("a").attr("href");
    if (code && href) courses.push({ code, href });
  });
  return courses;
}

async function getClassInfo(client, href) {
  const url = `${BASE}${href}`;
  const res = await client.get(url, {
    headers: { "User-Agent": "Mozilla/5.0", Referer: `${BASE}index.htm` },
  });

  const $ = cheerio.load(res.data);
  const rows = [];
  $("#example tbody tr").each((_, tr) => {
    const cells = $(tr).find("td");
    if (cells.length > 0) {
      rows.push({
        day_time: $(cells[1]).text().trim(),
        group: $(cells[2]).text().trim(),
        mode: $(cells[3]).text().trim(),
        status: $(cells[4]).text().trim(),
        room: $(cells[5]).text().trim(),
        program: $(cells[6]).text().trim(),
        faculty: $(cells[7]).text().trim(),
      });
    }
  });
  return rows;
}

async function scrapeFaculty(faculty) {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, withCredentials: true }));

  const { key1, key2, key3 } = await getSessionKeys(client, jar);
  const courses = await getCourseList(client, faculty.id, key1, key2, key3);

  const result = {};
  for (let i = 0; i < courses.length; i++) {
    const { code, href } = courses[i];
    try {
      const classes = await getClassInfo(client, href);
      result[code] = classes;
      process.stdout.write(`\r  [${i + 1}/${courses.length}] ${code}          `);
    } catch (err) {
      result[code] = [];
    }
    await delay(400);
  }

  return { courses: courses.length, result };
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`🚀 Scraping Shah Alam — ${FACULTIES.length} faculties...\n`);

  for (const faculty of FACULTIES) {
    console.log(`\n📍 B_${faculty.id} (${faculty.text})`);
    try {
      const { courses, result } = await scrapeFaculty(faculty);
      const outputPath = `${OUTPUT_DIR}/B_${faculty.id}.json`;
      writeFileSync(outputPath, JSON.stringify(result, null, 2));
      console.log(`\n  ✅ Done — ${courses} courses → ${outputPath}`);
    } catch (err) {
      console.log(`\n  ❌ Failed — ${err.message}`);
    }
    await delay(1000);
  }

  console.log("\n✅ Shah Alam scrape complete!");
}

main().catch(console.error);
