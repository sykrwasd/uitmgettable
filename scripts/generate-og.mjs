import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(import.meta.url);

const { ImageResponse } = require(join(root, "node_modules/next/dist/compiled/@vercel/og/index.node.js"));
const { createElement: h } = require("react");

// Cache Poppins TTF locally so we don't fetch every time
const cacheDir = join(root, ".next", "og-fonts");
const font400Path = join(cacheDir, "Poppins-Regular.ttf");
const font600Path = join(cacheDir, "Poppins-SemiBold.ttf");

async function ensureFont(path, url) {
  if (existsSync(path)) return readFileSync(path);
  console.log("Downloading", url);
  const { mkdirSync } = await import("fs");
  mkdirSync(cacheDir, { recursive: true });
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(path, buf);
  return buf;
}

const [font400, font600] = await Promise.all([
  ensureFont(font400Path, "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf"),
  ensureFont(font600Path, "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf"),
]);

const res = new ImageResponse(
  h("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "space-between",
      background: "linear-gradient(135deg, #0c1e3d 0%, #112952 50%, #0d3b7a 100%)",
      width: "1200px",
      height: "630px",
      padding: "72px 80px",
      fontFamily: "Poppins",
    },
  },
    // Wordmark
    h("div", { style: { display: "flex", alignItems: "center", gap: "16px" } },
      h("div", { style: { display: "flex", gap: "5px", padding: "10px", background: "rgba(29,78,216,0.25)", borderRadius: "12px" } },
        h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
          h("div", { style: { display: "flex", width: "10px", height: "18px", borderRadius: "3px", background: "#93C5FD" } }),
          h("div", { style: { display: "flex", width: "10px", height: "14px", borderRadius: "3px", background: "rgba(191,219,254,0.6)" } }),
        ),
        h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
          h("div", { style: { display: "flex", width: "10px", height: "10px", borderRadius: "3px", background: "#FFFFFF" } }),
          h("div", { style: { display: "flex", width: "10px", height: "22px", borderRadius: "3px", background: "#60A5FA" } }),
        ),
        h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
          h("div", { style: { display: "flex", width: "10px", height: "22px", borderRadius: "3px", background: "#93C5FD" } }),
          h("div", { style: { display: "flex", width: "10px", height: "10px", borderRadius: "3px", background: "rgba(96,165,250,0.6)" } }),
        ),
      ),
      h("div", { style: { display: "flex", flexDirection: "column", gap: "3px" } },
        h("div", { style: { display: "flex", fontSize: "26px", fontWeight: 600, color: "#93C5FD", letterSpacing: "-0.01em" } }, "UiTM"),
        h("div", { style: { display: "flex", fontSize: "12px", fontWeight: 600, color: "rgba(148,163,184,0.7)", letterSpacing: "0.14em" } }, "GETTABLE"),
      ),
    ),
    // Headline
    h("div", { style: { display: "flex", flexDirection: "column", gap: "18px" } },
      h("div", { style: { display: "flex", flexDirection: "column" } },
        h("div", { style: { display: "flex", fontSize: "76px", fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: "1.0" } }, "Build your UiTM"),
        h("div", { style: { display: "flex", fontSize: "76px", fontWeight: 600, color: "#60A5FA", letterSpacing: "-0.02em", lineHeight: "1.0" } }, "timetable in seconds."),
      ),
      h("div", { style: { display: "flex", fontSize: "25px", color: "rgba(148,163,184,0.85)", fontWeight: 400, lineHeight: "1.4" } },
        "Search by campus, class code, or matric number. Free, fast, customizable."
      ),
    ),
    // Bottom
    h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" } },
      h("div", { style: { display: "flex", gap: "12px" } },
        h("div", { style: { display: "flex", padding: "8px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(203,213,225,0.85)", fontSize: "15px", fontWeight: 600 } }, "20k+ students"),
        h("div", { style: { display: "flex", padding: "8px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(203,213,225,0.85)", fontSize: "15px", fontWeight: 600 } }, "10k+ timetables"),
        h("div", { style: { display: "flex", padding: "8px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(203,213,225,0.85)", fontSize: "15px", fontWeight: 600 } }, "Open Source"),
      ),
      h("div", { style: { display: "flex", fontSize: "18px", color: "rgba(100,116,139,0.8)", fontWeight: 400 } }, "uitmgettable.my"),
    ),
  ),
  {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Poppins", data: font400, weight: 400, style: "normal" },
      { name: "Poppins", data: font600, weight: 600, style: "normal" },
    ],
  }
);

const buf = await res.arrayBuffer();
writeFileSync(join(root, "public", "og-image.png"), Buffer.from(buf));
console.log("✓ public/og-image.png written");
