import axios from "axios";
import * as cheerio from "cheerio";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

const BASE = "https://simsweb4.uitm.edu.my/estudent/class_timetable/";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

// Step 1: get session cookies
await client.get(BASE);
const cookieList = await jar.getCookies(BASE);
let key1 = "", key2 = "", key3 = "";
for (const c of cookieList) {
  if (c.key === "KEY1") key1 = c.value;
  if (c.key === "KEY2") key2 = c.value;
  if (c.key === "KEY3") key3 = c.value;
}
console.log("keys:", { key1, key2, key3 });

// Step 2: get course list for campus B (Shah Alam), faculty CD
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
  "search_faculty": "CD",
  "search_course": "ISP543",
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

console.log("courses found:", courses);

// Step 3: get class info for ISP543
const match = courses.find(c => c.code.replace(/^\./, "") === "ISP543");
if (!match) { console.log("ISP543 not found"); process.exit(); }

const detail = await client.get(`${BASE}${match.href}`, {
  headers: { "User-Agent": "Mozilla/5.0", Referer: `${BASE}index.htm` },
});

const $2 = cheerio.load(detail.data);
const rows = [];
$2("#example tbody tr").each((_, tr) => {
  const cells = $2(tr).find("td");
  if (cells.length > 0) {
    rows.push({
      day_time: $2(cells[1]).text().trim(),
      group:    $2(cells[2]).text().trim(),
      mode:     $2(cells[3]).text().trim(),
      status:   $2(cells[4]).text().trim(),
      room:     $2(cells[5]).text().trim(),
      program:  $2(cells[6]).text().trim(),
    });
  }
});

console.log(JSON.stringify(rows, null, 2));