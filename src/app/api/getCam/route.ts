import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const url ="https://simsweb4.uitm.edu.my/estudent/class_timetable/cfc/select.cfc?method=find_cam_icress_student&key=All&page=1&page_limit=30"
    // Replace with actual fields from DevTools
    const payload = new URLSearchParams({
      
    });

    const response = await axios.post(url, payload.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // Parse HTML into JSON
    //console.log(response.data);
    return NextResponse.json(response.data.results);

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}