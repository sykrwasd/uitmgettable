import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import axios from "axios";

class CookieManager {
  private static instance: CookieManager;
  private jar: CookieJar;
  private lastUpdated: number = 0;
  private ids: { id1: string; id2: string; id3: string } | null = null;
  private refreshPromise: Promise<void> | null = null;

  // Refresh interval: 45 minutes (safety buffer before 1 hour expiry)
  private readonly REFRESH_INTERVAL = 45 * 60 * 1000;

  private constructor() {
    this.jar = new CookieJar();
  }

  public static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager();
    }
    return CookieManager.instance;
  }

  /**
   * Returns the current valid cookie jar and IDs.
   * If cookies are expired or missing, it triggers a refresh.
   */
  public async getCookies() {
    if (this.shouldRefresh()) {
      if (!this.refreshPromise) {
        console.log("🍪 Cookies expired or missing. Refreshing...");
        this.refreshPromise = this.refreshCookies()
          .catch((err) => {
            console.error("❌ Failed to refresh cookies:", err);
            // Reset promise so we can try again next time
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
    }

    return {
      jar: this.jar,
      ids: this.ids,
    };
  }

  private shouldRefresh(): boolean {
    if (!this.ids) return true;
    const now = Date.now();
    return now - this.lastUpdated > this.REFRESH_INTERVAL;
  }

  private async refreshCookies() {
    const freshJar = new CookieJar();
    const client = wrapper(axios.create({ jar: freshJar, withCredentials: true }));

    // 1. Initial request to set session cookies
    await client.get("https://simsweb4.uitm.edu.my/estudent/class_timetable/");

    // 2. Retrieve cookies from the jar
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

    // 3. Update state atomically
    this.jar = freshJar;
    this.ids = { id1, id2, id3 };
    this.lastUpdated = Date.now();
    console.log("✅ Cookies refreshed successfully:", this.ids);
  }
}

export const cookieManager = CookieManager.getInstance();
