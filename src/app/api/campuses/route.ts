import { getCampuses } from "@/lib/uitm-scraper";

export async function GET() {
  try {
    const campuses = await getCampuses();
    return Response.json(campuses);
  } catch (err) {
    console.error("getCampuses error:", err);
    return Response.json({ error: "Failed to fetch campuses" }, { status: 500 });
  }
}
