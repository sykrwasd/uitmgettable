import { NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = "https://uitmtimetable.skrin.xyz/api.php";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "campus" or "faculty"
  const campusId = searchParams.get("campusId"); // needed for faculty

  try {
    let url = "";
    let payload = "";

    if (type === "campus") {

      // Get all campuses
      url = `${BASE_URL}?getlist`;
      
    } else if (type === "faculty" && campusId) {
      // Get faculty by campus ID
      url = `${BASE_URL}?getfaculty`;
      payload = new URLSearchParams({
        campus: campusId, // <-- actual field name (check in DevTools)
      }).toString();
    } else {
      return NextResponse.json(
        { error: "Invalid type or missing campusId" },
        { status: 400 }
      );
    }

    const response =
      type === "campus"
        ? await axios.get(url)
        : await axios.post(url, payload, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });

    return NextResponse.json(response.data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
