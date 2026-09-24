// Live scraper for UiTM SIMSweb — dynamic token extraction with in-memory cache
import { CookieJar } from "tough-cookie";

const BASE = "https://simsweb4.uitm.edu.my/estudent/class_timetable/";

// ---- In-memory cache with TTL ----
const cache = new Map<string, { value: string; expiresAt: number }>();

function cacheGet(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function cacheSet(key: string, value: string, ttlSeconds: number) {
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

// ---- Cookie jar cache (serialized, keyed by identifier) ----
const jarCache = new Map<string, { json: string; expiresAt: number }>();

async function getJar(identifier = "default"): Promise<CookieJar> {
  const entry = jarCache.get(identifier);
  if (entry && Date.now() < entry.expiresAt) {
    return CookieJar.fromJSON(entry.json) as CookieJar;
  }
  return new CookieJar();
}

async function saveJar(jar: CookieJar, identifier = "default") {
  jarCache.set(identifier, {
    json: JSON.stringify(jar.toJSON()),
    expiresAt: Date.now() + 600_000,
  });
}

// ---- Fetch helper with cookie jar ----
async function fetchIcress(
  path: string,
  jar: CookieJar,
  options: { method?: string; body?: string; headers?: Record<string, string> } = {}
) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const cookies = await jar.getCookies(url);
  const cookieHeader = cookies.map((c) => c.cookieString()).join("; ");

  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Referer: `${BASE}index.cfm`,
    ...options.headers,
  };
  if (cookieHeader) headers["Cookie"] = cookieHeader;

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  if (!res.ok) throw new Error(`SIMSweb ${res.status}: ${path}`);

  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookies) {
    try { await jar.setCookie(c, url); } catch { /* ignore malformed cookies */ }
  }

  return { text: await res.text(), finalUrl: res.url };
}

// ---- Token extraction helpers (from weekview) ----
function extractAjaxUrl(script: string): string | null {
  const patterns = [
    /url\s*:\s*['"]([^'")]+)['"]/m,
    /\$\.ajax\(\s*['"]([^'")]+)['"]/m,
    /\$\.post\(\s*['"]([^'")]+)['"]/m,
    /fetch\(\s*['"]([^'")]+)['"]/m,
  ];
  for (const re of patterns) {
    const m = script.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

type RootScraps = {
  tokens: Record<string, string>;
  indexLocation: string;
  indexResultLocation: string;
  campusSelectLocation: string;
};

async function fetchScraps(jar: CookieJar): Promise<RootScraps> {
  const cached = cacheGet("uitm:tokens:index");
  if (cached) return JSON.parse(cached) as RootScraps;

  const { text: htm, finalUrl } = await fetchIcress("index.cfm", jar);

  // Parse hidden inputs — store by name AND id so JS assignments (by id) merge cleanly
  const idToName: Record<string, string> = {};
  const tokens: Record<string, string> = {};
  for (const m of htm.matchAll(/<input[^>]+type=["']hidden["'][^>]*>/gi)) {
    const tag = m[0];
    const name = tag.match(/name=["']([^"']+)["']/)?.[1];
    const id = tag.match(/\bid=["']([^"']+)["']/)?.[1];
    const value = tag.match(/value=["']([^"']*)["']/)?.[1] ?? "";
    if (name) {
      tokens[name] = value;
      if (id) idToName[id] = name;
    }
  }

  // Parse inline scripts for submit URL and campus select URL
  let indexResultLocation = "";
  let campusSelectLocation = "";

  for (const m of htm.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)) {
    const script = m[1];

    if (script.includes("check_form_before_submit")) {
      // Extract submit URL from $.ajax({ url: '...' }) inside the submit function
      const u = extractAjaxUrl(script);
      if (u) indexResultLocation = u;

      // Extract token values set via document.getElementById('id').value = 'val'
      // Map id → name so we store under the form field name
      for (const assign of script.matchAll(
        /document\.getElementById\(['"]([^'"]+)['"]\)\.value\s*=\s*['"]([^'"]*)['"]/g
      )) {
        const id = assign[1], val = assign[2];
        const name = idToName[id] ?? id;
        tokens[name] = val;
      }
    }

    // Campus select URL — only from script containing select2 ajax for campus
    if (script.includes("find_cam_icress_student")) {
      const u = extractAjaxUrl(script);
      if (u && !campusSelectLocation) campusSelectLocation = u;
    }
  }

  const scraps: RootScraps = {
    tokens,
    indexLocation: finalUrl,
    indexResultLocation,
    campusSelectLocation,
  };

  cacheSet("uitm:tokens:index", JSON.stringify(scraps), 600);
  return scraps;
}

// ---- Public API ----

export async function getCampuses(): Promise<{ id: string; text: string }[]> {
  const jar = await getJar();
  const { campusSelectLocation } = await fetchScraps(jar);

  const location = campusSelectLocation || "AJAX_campus_icress_lIII.cfm";
  const { text } = await fetchIcress(`${location}&key=All&page=1&page_limit=100`, jar);

  let entries: { id: string; text: string }[] = [];
  try {
    const json = JSON.parse(text) as { results: { id: string; text: string }[] };
    entries = json.results;
  } catch {
    entries = text
      .split(/<br\s*\/?>/i)
      .map((l) => l.trim())
      .map((l) => l.match(/^([A-Z0-9]+)\s*-\s*(.+)$/i))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map(([, id, text]) => ({ id, text }));
  }

  await saveJar(jar);
  return entries.filter((c) => c.id !== "X");
}

export async function getCourses(
  campus: string,
  faculty?: string | null,
  courseCode = ""
): Promise<{ code: string; path: string }[]> {
  const cacheKey = `uitm:courses:${campus}:${faculty ?? ""}:${courseCode}`;
  const cached = cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  const jar = await getJar();
  const { tokens, indexLocation, indexResultLocation } = await fetchScraps(jar);

  const params = new URLSearchParams({
    ...tokens,
    search_campus: campus,
    search_course: courseCode,
  });
  if (faculty) params.set("search_faculty", faculty);

  const submitPath = indexResultLocation || "INDEX_RESULT_lII1II11I1lIIII11IIl1I111I.cfm";
  const { text } = await fetchIcress(submitPath, jar, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Referer: indexLocation,
    },
    body: params.toString(),
  });

  const courses: { code: string; path: string }[] = [];
  for (const m of text.matchAll(/<tr[^>]*class=["']gradeU["'][^>]*>[\s\S]*?<\/tr>/gi)) {
    const row = m[0];
    const code = row.match(/<td[^>]*>[\s\S]*?<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i)?.[1]
      ?.replace(/<[^>]+>/g, "").trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "") ?? "";
    const path = row.match(/href=["']([^"']+)["']/i)?.[1] ?? "";
    if (code && path) courses.push({ code, path });
  }

  if (courses.length > 0) cacheSet(cacheKey, JSON.stringify(courses), 1800);
  await saveJar(jar);
  return courses;
}

export async function getGroups(path: string): Promise<{
  group: string;
  day_time: string;
  mode: string;
  status: string;
  room: string;
  program: string;
  faculty: string;
}[]> {
  const jar = await getJar();
  const { indexLocation } = await fetchScraps(jar);
  const { text } = await fetchIcress(path, jar, { headers: { Referer: indexLocation } });

  const groups: ReturnType<typeof getGroups> extends Promise<infer T> ? T : never = [];
  for (const m of text.matchAll(/<tbody[\s\S]*?<\/tbody>/gi)) {
    for (const row of m[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
      const cells = [...row[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
        .map((c) => c[1].replace(/<[^>]+>/g, "").trim());
      if (cells.length >= 7) {
        groups.push({
          day_time: cells[1] ?? "",
          group: cells[2] ?? "",
          mode: cells[3] ?? "",
          status: cells[4] ?? "",
          room: cells[5] ?? "",
          program: cells[6] ?? "",
          faculty: cells[7] ?? "",
        });
      }
    }
  }

  await saveJar(jar);
  return groups;
}
