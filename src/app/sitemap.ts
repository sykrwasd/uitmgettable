import type { MetadataRoute } from "next";

const BASE = "https://uitmgetable.my";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/guide`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/campuses`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/api-docs`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
