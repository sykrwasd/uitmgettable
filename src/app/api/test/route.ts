import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const response = await axios.post(
      "https://simsweb4.uitm.edu.my/estudent/class_timetable/index_result.cfm",
      new URLSearchParams({
        search_campus: "A4",   // example
        search_faculty: "CS",  // example
        search_course: ""
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    // response.data is HTML text
    return NextResponse.json({ html: response.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
