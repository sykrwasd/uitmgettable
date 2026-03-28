export function createUitmPayload(campus: string, faculty: string = "", course: string = "") {
  return new URLSearchParams({
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
    lIIlIlllIlIIllllIlIIllIlIIIIlllIlIllI: "lIIlIlllIlIIllllIlIIllIllIIIIlllIlIllI",
    lIIlIlllIlIIIlIlllIlIIllIlIIIIlllIlIllI: "lIllIlllIlIIIlIlllIlIIllIlIIIIlllIlIllI",
    lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI: "lIIlIlllIlIIllIlIlIIlIIllIlIIIIlIlIllllI",
    llIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI: "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
    lllIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI: "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
    llllIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI: "lIIlIlllIlIIllIlIIIlIIllIlIIIIlllIlIllI",
    llllIIlIlllIlIIlllllIIIlIIllIlIIIIlllIlIllIl: "llllIIlIlllIlIIlllllIIIlIIllIlIIIIlllIlIllI",
    search_campus: campus,
    search_faculty: faculty,
    search_course: course,
    lIIIlllIIllll: "lIIIlllIIllll",
  });
}

export const UITM_TIMETABLE_URL = "https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm";

export const UITM_TIMETABLE_HEADERS = {
  "User-Agent": "Mozilla/5.0",
  "Content-Type": "application/x-www-form-urlencoded",
  "X-Requested-With": "XMLHttpRequest",
  Referer: "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
};
