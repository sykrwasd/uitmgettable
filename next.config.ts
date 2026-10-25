import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.7.105.119"],
};

export default nextConfig;

initOpenNextCloudflareForDev();
