import axios from "axios";
import * as cheerio from "cheerio";

async function scrape() {
  const url = "https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm"
const payload = new URLSearchParams({
  search_campus: 'A4',
  search_course: 'mat183',
  captcha_no_type: '',
  captcha1: '',
  captcha2: '',
  captcha3: '',
  token1: 'lIIlllIlIIlIllIIIIIlIlllllIlIll',
  token2: 'lIIlllIlIllIlIIlIllIIIIlllIllll',
  token3: 'lIIlllIlIIlIllIIIIllllIlIlI',
  llIlllIlIIllIlIIIIlllIlIll: 'lIIlllIlIllIlIIlIllIlIIIlllIlIll',
  llIlllIlIIlllllIIIlllIlIll: 'lIIllIlIlllIlIIlIllIIIIllllIlIll',
  lIIlllIlIIlIllIIIIlllIlIll: 'lIIlllIlIIlIllIIIIlIllIlllIlIll',
  lIIlIlllIlIIllIlIIIIlllIlIllI: 'lIIlIlllIlIIllIlIIIIlllIlIlllI',
  lIIlIlllIlIIllIllIlIIIIlllIlIllI: 'lIIlIlllIlIIllIllIlIIIIlllIlIllI',
  lIIlIlllIlIIllIlIIIIlllIlIlllIlIllI: 'lIIlIlllIlIIllIlIIIIlllIlIlllIlIllI',
  lIIlIllIlIllllIlIIllIlIIIIlllIlIllI: 'lIIlIllIlIllllIlIIllIlIIIIlllIlIllI',
  lIIlIlllIlIIllllIlIIllIlIIIIlllIlIllI: 'lIIlIlllIlIIllllIlIIllIllIIIIlllIlIllI',
  lIIlIlllIlIIIlIlllIlIIllIlIIIIlllIlIllI: 'lIllIlllIlIIIlIlllIlIIllIlIIIIlllIlIllI',
  lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI: 'lIIlIlllIlIIllIlIlIIlIIllIlIIIIlllIlIllI',
  llIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI: 'lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI',
  lllIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI: 'lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI',
  llllIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI: 'lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI',
  llllIIlIlllIlIIlllllIIIlIIllIlIIIIlllIlIllIl: 'llllIIlIlllIlIIlllllIIIlIIllIlIIIIlllIlIllI',
});




    

  const res = await axios.post(url, payload.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Content-Type": "application/x-www-form-urlencoded",
      Referer:"https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
    },
  });

  //console.log(res.data)

  const $ = cheerio.load(res.data);

  const rows = [];

$("table tr").each((_, tr) => {
  const cells = $(tr).find("td");
  if (cells.length === 3) {
    const href = $(cells[2]).find("a").attr("href"); // grab href
    rows.push({
      no: $(cells[0]).text().trim(),
      course: $(cells[1]).text().trim(),
      href: href || null
    });
  }
});

console.log(rows);
//console.log(res.data)

  //console.log(res.data)
}

scrape().catch(console.error);
