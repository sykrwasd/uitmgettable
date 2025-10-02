import axios from "axios";
import * as cheerio from "cheerio";

async function scrape() {
  const url =
    "https://simsweb4.uitm.edu.my/estudent/class_timetable/cfc/select.cfc?method=FAC_lII1II11I1lIIII11IIl1I111I&key=All&page=1&page_limit=30";

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
    },
  });


  console.log(res.data)
}

scrape().catch(console.error);