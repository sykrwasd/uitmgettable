import axios from "axios";
import * as cheerio from "cheerio";

async function scrape() {
  const url =
    `
   https://simsweb4.uitm.edu.my/estudent/class_timetable/index_tt.cfm?id1=58DCAC3BCCB8BE5CDEEE0047537C8A42556F9E&id2=6BB3ACA156C06ADE4DD60C93A887909A16ABEC'
    `;

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
    },
  });

  const $ = cheerio.load(res.data);
  console.log(res.data)

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

scrape().catch(console.error);