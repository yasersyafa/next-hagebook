import { ImageResponse } from "next/og";

export const alt = "hagebook · a HAGE Games handbook";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #000 0%, #1a0010 50%, #ff005a 200%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#ff005a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            h
          </div>
          <span style={{ fontSize: 28, fontWeight: 600 }}>
            <span style={{ color: "#ff005a" }}>hage</span>book
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h1
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: 0,
              maxWidth: 900,
            }}
          >
            Read. Build. Ship.
          </h1>
          <p style={{ fontSize: 28, color: "#a1a1aa", margin: 0, maxWidth: 800 }}>
            Short, opinionated lessons for indie game and web devs.
          </p>
        </div>
        <div style={{ fontSize: 20, color: "#71717a" }}>
          a HAGE Games handbook · hagegames.com
        </div>
      </div>
    ),
    size,
  );
}
