import axios from "axios";
import * as cheerio from "cheerio";

async function scrape() {
  const url = "https://simsweb4.uitm.edu.my/estudent/class_timetable/index_result111.cfm"
  const payload = new URLSearchParams({
  search_campus: 'HEP', // APB,CITU,HEP
  search_faculty: '',
  search_course: '',
  captcha_no_type: '',
  captcha1: '123456',
  captcha2: '123456',
  captcha3: '123456',
  token1: 'ey7JhbGciOiJbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDA1ODY3NjcsImV4cCI6MTc2NjUwNjc2NywicGVnYXdhaV9iZXJ0YW5nZ3VuZ2phd2FiIjoiRmFpZGFoIE1vaGFtbWFkIiwidXNlciI6ImlzdHVkZW50IiwidXJsIjpbIi9jb252aWQxOS9zYXJpbmdhbmhhcmlhbi9ieS9ub3Bla2VyamEiLCIvY29udmlkMTkvc2VtYWsvc3RhdHVzL3Zha3NpbiIsIi9zaW1zL3N0YWZmIiwiL2hlYS9kb2t1bWVuL3Byb2ZpbGUiXX0.SICKMG-1QLovNxWu5Ab9ZxcskOW32DGvFKUww21Q3rw',
  token2: 'I6MTc2NjUwNjc2NywicGVnYXdhaV9iZXJ0YW5nZ3VuZ2phd2FiIjoiRmFpZGFoIE1vaGFtbWFkIiwidXNlciI6ImlzdHVkZW50IiwidXJsIjpbI19jb252aWQxOS9zYXJpbmdhbmhhcmlhbi9ieS9ub3Bla2VyamE1LCIvY29udmlkMTkvc2VtYWsvc3RhdHVzL3Zha3NpbiIsIi9zaW1zL3N0YWZmIiwiL2hlYS9kb2t1bWVuL3Byb2ZpbGUiXX0.SICKMG-1QLovNxWu5Ab9ZxcskOW32DGvFKUww21Q3rw',
  token3: 'Byb2ZpbGiJIUzI1NjIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDA1ODY3NjcsImV4cCI6MTc2NjUwNjc2NywicGVnYXdhaV9iZXJ0YW5nZ3VuZ2phd2FiIjoiRmFpZGFoIE1vaGFtbWFkIiwidXNlciI6ImlzdHVkZW50IiwidXJsIjpbIi9jb252aWQxOS9zYXJpbmdh b3Bla2VyamEiLCIvY29udmlkMTkvc2VtYWsvc3RhdHVzL3Zha3NpbiIsIi9zaWizL3N0YWZmIiwiL2hlYS9kb2t1bWVuL3Byb2ZpbGUiXX0.SICKMG-1QLovNxWu5Ab9ZxcskOW32DGvFKUww21Q3rw'
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
