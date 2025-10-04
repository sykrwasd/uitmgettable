import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { subjectName, campus: originalCampus, faculty } = await req.json(); // coming from frontend

    console.log("Received subjectnasme:", subjectName);
    console.log("Received faculty:", faculty);
    console.log("Received campus:", originalCampus);

    let campus = originalCampus;

    if (campus === "LANGUAGE COURSES") {
      campus = "APB";
    } else if (campus === "CITU COURSES") {
      campus = "CITU";
    } else if (campus === "CO") {
      campus = "HEP";
    } else if (campus === "selangor") {
      campus = "B";
    }

    console.log(campus);

    const subURL = await getURL(subjectName, campus, faculty);

    const url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/${subURL}`;

    console.log("URL", url);

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer:
          "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
      },
    });

    console.log("Resposne", res);

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
          subject: subjectName,
        });
      }
    });

    console.log("Scraped rows:", rows.length);
    console.log(JSON.stringify(rows, null, 2));

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

async function getURL(subjectName: string, campus: string, faculty: string) {
  console.log("Received subjectnasme:", subjectName);
  console.log("Received faculty:", faculty);
  console.log("Received campus:", campus);

  const url =
    "https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm";
  const payload = new URLSearchParams({
    search_campus: `${campus}`, // APB,A,HEP
    search_faculty: `${faculty}`,
    search_course: `${subjectName}`,
    captcha_no_type: "",
    token1: "lIIlllIlIIlIllIIIIIlIlllllIlIll",
    token2: "lIIlllIlIllIlIIlIllIIIIlllIlIll",
    token3: "lIIlllIlIIlIllIIIIlllIlIlI",
    llIlllIlIIllIlIIIIlllIlIll: "lIIlllIlIllIlIIlIllIIIIlllIlIll",
    llIlllIlIIlllllIIIlllIlIll: "lIIllIlIlllIlIIlIllIIIIlllIlIll",
    lIIlllIlIIlIllIIIIlllIlIll: "lIIlllIlIIlIllIIIIlIllIlllIlIll",
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

  const rows: any[] = [];

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

  console.log(rows);

  const subHref = rows.map((sub) => sub.href);
  console.log("hrefs", subHref[0]);
  const subURL = subHref[0];
  return subURL;
}
