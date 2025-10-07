import axios from "axios";
import * as cheerio from "cheerio";

async function scrape() {
  const url =
    "https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm";
  const payload = new URLSearchParams({
    search_campus: 'B',
  search_faculty: 'AD',
  search_course: '',
    captcha_no_type: "",
    captcha1: "",
    captcha2: "",
    captcha3: "",
    token1: "lIIlllIlIIlIllIIIIIlIlllllIlIll",
    token2: "lIIlllIlIllIlIIlIllIIIIlllIllll",
    token3: "lIIlllIlIIlIllIIIIllllIlIlI",
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
      "lIIlIlllIlIIllIlIlIIlIIllIlIIIIlllIlIllI",
    llIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI:
      "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
    lllIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI:
      "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
    llllIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI:
      "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
    llllIIlIlllIlIIlllllIIIlIIllIlIIIIlllIlIllIl:
      "llllIIlIlllIlIIlllllIIIlIIllIlIIIIlllIlIllI",
  });

  const res = await axios.post(url, payload.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Content-Type": "application/x-www-form-urlencoded",
      Referer:
        "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
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
        href: href || null,
      });
    }
  });

  //console.log(rows);

  let subjectName = "JDT410";
  subjectName = subjectName.toUpperCase();
  console.log(subjectName);

  const filtered = rows.filter((row) => row.course.includes(subjectName));
  //console.log(filtered);

  getGroup(filtered);
}

async function getGroup(filtered) {
  console.log("Received filtered data:", filtered);

  if (filtered.length === 0) {
    console.log("No matching subjects found!");
    return;
  }

  for (const subject of filtered) {
    //console.log("Subject:", subject.course);
    //console.log("URL:", subject.href);

    const url = `
     https://simsweb4.uitm.edu.my/estudent/class_timetable/${subject.href}
     `;

    // later you can axios.get(subject.href) here to scrape group details
    console.log(url);

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer:
          "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
      },
    });

    const $ = cheerio.load(res.data);
    //console.log(res.data);

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
