import axios from "axios";
import * as cheerio from "cheerio";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE = "https://simsweb4.uitm.edu.my/estudent/class_timetable/";
const OUTPUT_DIR = "./public/timetable";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const CAMPUSES = [
  // Shah Alam (B) — all faculties
  { text: 'SHAH ALAM - ARSHAD AYUB GRADUATE BUSINESS SCHOOL', id: 'B_AA' },
  { text: 'SHAH ALAM - FACULTY OF ACCOUNTANCY', id: 'B_AC' },
  { text: 'SHAH ALAM - FACULTY OF ART AND DESIGN', id: 'B_AD' },
  { text: 'SHAH ALAM - FACULTY OF ADMINISTRATIVE SCIENCE AND POLICY STUDIES', id: 'B_AM' },
  { text: 'SHAH ALAM - FACULTY OF ARCHITECTURE, PLANNING AND SURVEYING', id: 'B_AP' },
  { text: 'SHAH ALAM - FACULTY OF APPLIED SCIENCES', id: 'B_AS' },
  { text: 'SHAH ALAM - FACULTY OF BUSINESS AND MANAGEMENT', id: 'B_BA' },
  { text: 'SHAH ALAM - FACULTY OF BUILT ENVIRONMENT', id: 'B_BE' },
  { text: 'SHAH ALAM - FACULTY OF BUSINESS MANAGEMENT', id: 'B_BM' },
  { text: 'SHAH ALAM - COLLEGE OF CREATIVE ARTS', id: 'B_CA' },
  { text: 'SHAH ALAM - COLLEGE OF COMPUTING, INFORMATICS AND MATHEMATICS', id: 'B_CD' },
  { text: 'SHAH ALAM - COLLEGE OF ENGINEERING', id: 'B_CE' },
  { text: 'SHAH ALAM - COLLEGE OF BUILT ENVIRONMENT', id: 'B_CF' },
  { text: 'SHAH ALAM - INSTI OF CONTINUING EDUCATION & PROFESSIONAL STUDIES', id: 'B_CP' },
  { text: 'SHAH ALAM - FACULTY OF COMPUTER AND MATHEMATICAL SCIENCES', id: 'B_CS' },
  { text: 'SHAH ALAM - FACULTY OF DENTISTRY', id: 'B_DS' },
  { text: 'SHAH ALAM - FACULTY OF CIVIL ENGINEERING', id: 'B_EC' },
  { text: 'SHAH ALAM - FACULTY OF EDUCATION', id: 'B_ED' },
  { text: 'SHAH ALAM - FACULTY OF ELECTRICAL ENGINEERING', id: 'B_EE' },
  { text: 'SHAH ALAM - FACULTY OF CHEMICAL ENGINEERING', id: 'B_EH' },
  { text: 'SHAH ALAM - FACULTY OF MECHANICAL ENGINEERING', id: 'B_EM' },
  { text: 'SHAH ALAM - FACULTY OF FILM, THEATRE AND ANIMATION', id: 'B_FF' },
  { text: 'SHAH ALAM - FACULTY OF HOTEL AND TOURISM MANAGEMENT', id: 'B_HM' },
  { text: 'SHAH ALAM - FACULTY OF HEALTH SCIENCES', id: 'B_HS' },
  { text: 'SHAH ALAM - ACADEMY OF CONTEMPORARY ISLAMIC STUDIES', id: 'B_IC' },
  { text: 'SHAH ALAM - FACULTY OF INFORMATION MANAGEMENT', id: 'B_IM' },
  { text: 'SHAH ALAM - INTERNATIONAL', id: 'B_IN' },
  { text: 'SHAH ALAM - ACADEMY OF LANGUAGE STUDIES', id: 'B_LG' },
  { text: 'SHAH ALAM - MALAYSIA INSTITUTE OF TRANSPORT', id: 'B_LT' },
  { text: 'SHAH ALAM - FACULTY OF LAW', id: 'B_LW' },
  { text: 'SHAH ALAM - FACULTY OF COMMUNICATION AND MEDIA STUDIES', id: 'B_MC' },
  { text: 'SHAH ALAM - FACULTY OF MEDICINE', id: 'B_MD' },
  { text: 'SHAH ALAM - FACULTY OF MUSIC', id: 'B_MU' },
  { text: 'SHAH ALAM - FACULTY OF PHARMACY', id: 'B_PH' },
  { text: 'SHAH ALAM - FACULTY OF INFORMATION SCIENCE', id: 'B_SI' },
  { text: 'SHAH ALAM - FACULTY OF SPORTS SCIENCE AND RECREATION', id: 'B_SR' },
  // Other campuses
  { text: 'SELANGOR - LANGUAGE', id: 'APB' },
  { text: 'SELANGOR - CITU', id: 'CITU' },
  { text: 'SELANGOR - CO-CURRICULUM', id: 'HEP' },
  { text: 'SERI ISKANDAR', id: 'A' },
  { text: 'TAPAH', id: 'A4' },
  { text: 'DENGKIL', id: 'B10' },
  { text: 'JENGKA', id: 'C' },
  { text: 'RAUB', id: 'C3' },
  { text: 'MACHANG', id: 'D' },
  { text: 'KOTA BHARU', id: 'D2' },
  { text: 'SEGAMAT', id: 'J' },
  { text: 'PASIR GUDANG', id: 'J4' },
  { text: 'SUNGAI PETANI', id: 'K' },
  { text: 'ALOR GAJAH', id: 'M' },
  { text: 'BANDARAYA MELAKA', id: 'M1' },
  { text: 'JASIN', id: 'M3' },
  { text: 'KUALA PILAH', id: 'N' },
  { text: 'KUALA PILAH 2', id: 'N3' },
  { text: 'SEREMBAN 3', id: 'N4' },
  { text: 'REMBAU', id: 'N5' },
  { text: 'BUKIT MERTAJAM', id: 'P' },
  { text: 'BERTAM', id: 'P2' },
  { text: 'PERMATANG PAUH', id: 'P4' },
  { text: 'SAMARAHAN', id: 'Q' },
  { text: 'SAMARAHAN 2', id: 'Q5' },
  { text: 'MUKAH', id: 'Q6' },
  { text: 'ARAU', id: 'R' },
  { text: 'KOTA KINABALU', id: 'S' },
  { text: 'TAWAU', id: 'S2' },
  { text: 'DUNGUN', id: 'T' },
  { text: 'BUKIT BESI', id: 'T4' },
  { text: 'KUALA TERENGGANU', id: 'T5' },
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

async function getCourseList(client, campusId, key1, key2, key3) {
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
    "search_campus": campusId,
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

async function scrapeCampus(campus) {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, withCredentials: true }));

  const { key1, key2, key3 } = await getSessionKeys(client, jar);
  const courses = await getCourseList(client, campus.id, key1, key2, key3);

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

function buildClassIndex() {
  const timetableDir = join(__dirname, "../public/timetable");
  const indexData = JSON.parse(readFileSync(join(timetableDir, "index.json"), "utf-8"));
  const campusNames = {};
  for (const c of indexData.campuses) campusNames[c.campus] = c.name;

  const files = readdirSync(timetableDir).filter(
    (f) => f.endsWith(".json") && f !== "index.json" && f !== "class_index.json"
  );

  const index = {};
  for (const file of files) {
    const fileBase = file.replace(".json", "");
    const campus = fileBase.startsWith("B_") ? "B" : fileBase;
    const faculty = fileBase.startsWith("B_") ? fileBase.slice(2) : "";
    const campusName = campusNames[campus] || campus;
    const data = JSON.parse(readFileSync(join(timetableDir, file), "utf-8"));

    for (const [subjectKey, classes] of Object.entries(data)) {
      const subject = subjectKey.startsWith(".") ? subjectKey.slice(1) : subjectKey;
      for (const cls of classes) {
        const code = cls.group?.trim();
        if (!code) continue;
        if (!index[code]) index[code] = [];
        const exists = index[code].some(
          (e) => e.campus === campus && e.faculty === faculty && e.subject === subject && e.day_time === cls.day_time
        );
        if (!exists) {
          index[code].push({ campus, faculty, campusName, campusFile: fileBase, subject, day_time: cls.day_time, room: cls.room, mode: cls.mode, status: cls.status, program: cls.program });
        }
      }
    }
  }

  writeFileSync(join(timetableDir, "class_index.json"), JSON.stringify(index, null, 2));
  console.log(`\n📇 class_index.json built — ${Object.keys(index).length} unique class codes`);
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`🚀 Starting full scrape for ${CAMPUSES.length} campuses...\n`);

  const summary = [];

  for (const campus of CAMPUSES) {
    console.log(`\n📍 Campus: ${campus.id} (${campus.text})`);
    try {
      const { courses, result } = await scrapeCampus(campus);
      const outputPath = `${OUTPUT_DIR}/${campus.id}.json`;
      writeFileSync(outputPath, JSON.stringify(result, null, 2));
      console.log(`\n  ✅ Done — ${courses} courses saved to ${outputPath}`);
      summary.push({ campus: campus.id, name: campus.text, courses, status: "ok" });
    } catch (err) {
      console.log(`\n  ❌ Failed — ${err.message}`);
      summary.push({ campus: campus.id, name: campus.text, courses: 0, status: "error", error: err.message });
    }

    await delay(1000); // wait 1s between campuses
  }

  // Save summary
  writeFileSync(`${OUTPUT_DIR}/index.json`, JSON.stringify({
    scraped_at: new Date().toISOString(),
    campuses: summary
  }, null, 2));

  console.log("\n\n=== SUMMARY ===");
  console.table(summary.map(r => ({ campus: r.campus, name: r.name, courses: r.courses, status: r.status })));
  console.log(`\n✅ All done! Files saved to ${OUTPUT_DIR}/`);

  // Build class index from all scraped files
  buildClassIndex();
}

main().catch(console.error);
