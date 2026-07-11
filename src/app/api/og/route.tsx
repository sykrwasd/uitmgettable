import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createElement as h } from "react";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  return new ImageResponse(
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
          h("div", { style: { display: "flex", fontSize: "26px", fontWeight: 800, color: "#93C5FD", letterSpacing: "-0.01em" } }, "UiTM"),
          h("div", { style: { display: "flex", fontSize: "12px", fontWeight: 500, color: "rgba(148,163,184,0.7)", letterSpacing: "0.14em" } }, "GETTABLE"),
        ),
      ),

      // Headline
      h("div", { style: { display: "flex", flexDirection: "column", gap: "18px" } },
        h("div", { style: { display: "flex", flexDirection: "column" } },
          h("div", { style: { display: "flex", fontSize: "76px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: "1.0" } }, "Build your UiTM"),
          h("div", { style: { display: "flex", fontSize: "76px", fontWeight: 900, color: "#60A5FA", letterSpacing: "-0.03em", lineHeight: "1.0" } }, "timetable in seconds."),
        ),
        h("div", { style: { display: "flex", fontSize: "25px", color: "rgba(148,163,184,0.85)", fontWeight: 400, lineHeight: "1.4" } },
          "Search by campus, class code, or matric number. Free, fast, and customizable."
        ),
      ),

      // Bottom
      h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" } },
        h("div", { style: { display: "flex", gap: "12px" } },
          h("div", { style: { display: "flex", padding: "8px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(203,213,225,0.85)", fontSize: "15px", fontWeight: 500 } }, "20k+ students"),
          h("div", { style: { display: "flex", padding: "8px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(203,213,225,0.85)", fontSize: "15px", fontWeight: 500 } }, "10k+ timetables"),
          h("div", { style: { display: "flex", padding: "8px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(203,213,225,0.85)", fontSize: "15px", fontWeight: 500 } }, "Open Source"),
        ),
        h("div", { style: { display: "flex", fontSize: "18px", color: "rgba(100,116,139,0.8)", fontWeight: 500 } }, "uitmgettable.my"),
      ),
    ),
    { width: 1200, height: 630 }
  );
}
