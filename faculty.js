import axios from "axios";
import * as cheerio from "cheerio";

async function scrape() {
  const url =
    "https://uitmtimetable.com/api.php?getfaculty";

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
    },
  });


  console.log(res.data)
}

scrape().catch(console.error);