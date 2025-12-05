import axios from "axios";
import * as cheerio from "cheerio";

async function scrape() {
  const url =
    "https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm";

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
    search_campus: "A4",
    search_course: "",
    lIIIlllIIllll: "lIIIlllIIllll",
  });

  // Request headers
  const res = await axios.post(url, payload.toString(), {
    headers: {
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Origin: "https://simsweb4.uitm.edu.my",
      Pragma: "no-cache",
      Referer:
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

  const subjectName = "mat133";
  const filtered = rows.filter((row) =>
    row.course.toUpperCase().includes(subjectName.toUpperCase())
  );

  //console.log("Filtered:", filtered);

  console.log(rows)

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

    //console.log(JSON.stringify(rows, null, 2));
  }
}

scrape().catch(console.error);
