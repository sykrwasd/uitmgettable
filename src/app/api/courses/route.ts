import { getCourses } from "@/lib/uitm-scraper";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campus = searchParams.get("campus");
  const faculty = searchParams.get("faculty");

  if (!campus) {
    return Response.json({ error: "campus is required" }, { status: 400 });
  }

  try {
    const courses = await getCourses(campus, faculty);
    return Response.json(courses);
  } catch (err) {
    console.error("getCourses error:", err);
    return Response.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
