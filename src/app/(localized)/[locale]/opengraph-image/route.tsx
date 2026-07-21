import { ImageResponse } from "next/og";
import { isLocale } from "@/data/site";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: rawLocale } = await params;
  const korean = isLocale(rawLocale) && rawLocale === "ko";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "64px 72px",
          background: "#f3f4ef",
          color: "#202521",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", width: "100%", alignItems: "stretch", gap: 56 }}>
          <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700 }}>
              <div style={{ width: 30, height: 30, border: "8px solid #b84a30", transform: "rotate(45deg)" }} />
              <span>MoaTools</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              <div style={{ color: "#b84a30", fontSize: 24, fontWeight: 700, letterSpacing: 2 }}>
                {korean ? "TOOLS FOR KOREA, BUILT TO LAST" : "FAST, DEPENDABLE ONLINE TOOLS"}
              </div>
              <div style={{ maxWidth: 730, fontSize: 72, fontWeight: 760, lineHeight: 1.04, letterSpacing: -4 }}>
                {korean ? "Everyday answers, right away." : "The answer you need, now."}
              </div>
              <div style={{ color: "#626a64", fontSize: 27 }}>
                {korean ? "30 tools in Korean and English · 3 free games" : "30 utilities and 3 free browser games"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", width: 315, flexDirection: "column", justifyContent: "space-between", background: "#b84a30", padding: 34 }}>
            {["%", "{ }", "PDF", "2048"].map((label, index) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  height: 96,
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(255,250,246,0.55)",
                  background: index === 2 ? "#f3d9cf" : "transparent",
                  color: index === 2 ? "#b84a30" : "#fffaf6",
                  fontSize: 34,
                  fontWeight: 800,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    },
  );
}
