import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const url ="https://uitmtimetable.skrin.xyz/api.php?getfaculty"
    // Replace with actual fields from DevTools
    const payload = new URLSearchParams({
      field1: "value1",
      field2: "value2",
    });

    const response = await axios.post(url, payload.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // Parse HTML into JSON
    console.log(response.data);
    return NextResponse.json(response.data );

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
