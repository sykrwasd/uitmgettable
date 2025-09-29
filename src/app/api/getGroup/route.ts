import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const path = await req.json(); // coming from frontend
    console.log("Received path:", path);

    // TODO: replace with dynamic url using 'path' if needed
    const url =
      `https://simsweb4.uitm.edu.my/estudent/class_timetable/${path}`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
      },
    });

    const $ = cheerio.load(res.data);

    const rows: any[] = [];

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

    console.log("Scraped rows:", rows.length);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error scraping:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch subject" }), {
      status: 500,
    });
  }
}
