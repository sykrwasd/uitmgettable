import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const url = "https://simsweb4.uitm.edu.my/estudent/class_timetable/cfc/select.cfc?method=CAM_lII1II11I1lIIII11IIl1I111II&key=All&page=1&page_limit=30";

    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
          },
        });
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        // Wait 500ms before retrying
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Parse HTML into JSON
    if (!response) throw new Error("Failed to fetch after retries");
    return NextResponse.json(response.data.results);

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}