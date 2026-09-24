import { getGroups } from "@/lib/uitm-scraper";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return Response.json({ error: "path is required" }, { status: 400 });
  }

  try {
    const groups = await getGroups(path);
    return Response.json(groups);
  } catch (err) {
    console.error("getGroups error:", err);
    return Response.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}
