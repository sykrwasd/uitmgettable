import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import axios from "axios";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const REDIS_IDS_KEY = "uitm:cookie:ids";
const REDIS_JAR_KEY = "uitm:cookie:jar";
const TTL_SECONDS = 45 * 60; // 45 minutes

class CookieManager {
  private static instance: CookieManager;
  private refreshPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager();
    }
    return CookieManager.instance;
  }

  /**
   * Returns valid cookie jar and IDs.
   * Checks Redis first; fetches fresh from UITM on cache miss.
   */
  public async getCookies() {
    // Check Redis cache first
    const [cachedIds, cachedJarJson] = await Promise.all([
      redis.get<{ id1: string; id2: string; id3: string }>(REDIS_IDS_KEY),
      redis.get<string>(REDIS_JAR_KEY),
    ]);

    if (cachedIds && cachedJarJson) {
      console.log("✅ Using cached cookies from Redis");
      const jar = await CookieJar.deserializeSync(cachedJarJson);
      return { jar, ids: cachedIds };
    }

    // Cache miss — refresh (deduplicate concurrent refreshes within same invocation)
    if (!this.refreshPromise) {
      console.log("🍪 Cache miss. Fetching fresh cookies from UITM...");
      this.refreshPromise = this.refreshCookies()
        .catch((err) => {
          console.error("❌ Failed to refresh cookies:", err);
          this.refreshPromise = null;
          throw err;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    } else {
      console.log("⏳ Waiting for existing cookie refresh...");
    }

    await this.refreshPromise;

    // Read back from Redis after refresh
    const [ids, jarJson] = await Promise.all([
      redis.get<{ id1: string; id2: string; id3: string }>(REDIS_IDS_KEY),
      redis.get<string>(REDIS_JAR_KEY),
    ]);

    if (!ids || !jarJson) throw new Error("Failed to load cookies from Redis after refresh");

    const jar = await CookieJar.deserializeSync(jarJson);
    return { jar, ids };
  }

  private async refreshCookies() {
    const freshJar = new CookieJar();
    const client = wrapper(axios.create({ jar: freshJar, withCredentials: true }));

    // 1. Hit the page to receive session cookies
    await client.get("https://simsweb4.uitm.edu.my/estudent/class_timetable/");

    // 2. Extract KEY1, KEY2, KEY3
    const cookies = await freshJar.getCookies(
      "https://simsweb4.uitm.edu.my/estudent/class_timetable/"
    );

    let id1 = "", id2 = "", id3 = "";
    for (const c of cookies) {
      if (c.key === "KEY1") id1 = c.value;
      if (c.key === "KEY2") id2 = c.value;
      if (c.key === "KEY3") id3 = c.value;
    }

    if (!id1 || !id2 || !id3) {
      throw new Error("Failed to extract required cookie keys (KEY1, KEY2, KEY3)");
    }

    const ids = { id1, id2, id3 };

    // 3. Serialize the jar for storage
    const jarJson = JSON.stringify(freshJar.serializeSync());

    // 4. Store both in Redis with 45-min TTL
    await Promise.all([
      redis.set(REDIS_IDS_KEY, ids, { ex: TTL_SECONDS }),
      redis.set(REDIS_JAR_KEY, jarJson, { ex: TTL_SECONDS }),
    ]);

    console.log("✅ Cookies refreshed and stored in Redis:", ids);
  }
}

export const cookieManager = CookieManager.getInstance();
