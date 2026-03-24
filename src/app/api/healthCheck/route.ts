import { NextResponse } from "next/server";
import axios from "axios";

export const revalidate = 60; // Cache this route in Next.js App Router for 60 seconds

export async function GET() {
  try {
    // Ping the iCress homepage with a short 3-second timeout
    const res = await axios.get(
      "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
      {
        timeout: 3000,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (res.status === 200) {
      return NextResponse.json({ status: "up" });
    } else {
      return NextResponse.json({ status: "down" }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({ status: "down" }, { status: 503 });
  }
}
