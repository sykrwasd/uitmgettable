import axios from "axios";
const client = axios.create({ withCredentials: true });

const res1 = await client.get("https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm");
const cookies = res1.headers['set-cookie'];

// Extract tokens from res1.data (using regex or cheerio)
const payload = {
  search_campus: "A4",
  search_course: "MAT183",
  captcha_no_type: "",
  token1, token2, token3, llIlllIlIIllIlIIIIlllIlIll
};

const res2 = await client.post(
  "https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm",
  new URLSearchParams(payload),
  { headers: { Cookie: cookies.join("; ") } }
);
