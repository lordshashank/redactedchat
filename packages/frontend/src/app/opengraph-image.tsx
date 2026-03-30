import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GhostBalance - The only social network where your balance speaks but your identity stays hidden.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function PixelGhost({ cellSize = 5, color = "#fff" }: { cellSize?: number; color?: string }) {
  const rows = [
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,0,0,1,1,1,1,0,0,1,1,0],
    [0,1,1,0,0,1,1,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,1,1,1,0,0,1,1,1,0,1,1],
    [1,0,0,0,1,1,0,0,1,1,0,0,0,1],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows.map((row, y) => (
        <div key={y} style={{ display: "flex" }}>
          {row.map((cell, x) => (
            <div
              key={x}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? color : "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#1A1A1A",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
          border: "3px solid #FF3B30",
        }}
      >
        {/* Full layout - centered */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "48px 64px",
          }}
        >
          {/* Top row - brand */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <PixelGhost cellSize={5} color="#FF3B30" />
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#FF3B30",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  display: "flex",
                }}
              >
                GhostBalance
              </div>
            </div>
            <div
              style={{
                fontSize: 14,
                fontFamily: "monospace",
                color: "#666",
                letterSpacing: "2px",
                display: "flex",
              }}
            >
              ghostbalance.chat
            </div>
          </div>

          {/* Center - main headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            <div
              style={{
                fontSize: 88,
                fontWeight: 900,
                color: "#FFFFFF",
                lineHeight: 0.95,
                letterSpacing: "-4px",
                display: "flex",
              }}
            >
              YOUR BALANCE
            </div>
            <div
              style={{
                fontSize: 88,
                fontWeight: 900,
                color: "#FF3B30",
                lineHeight: 0.95,
                letterSpacing: "-4px",
                display: "flex",
              }}
            >
              SPEAKS.
            </div>
            <div style={{ height: 20, display: "flex" }} />
            <div
              style={{
                fontSize: 88,
                fontWeight: 900,
                color: "#444",
                lineHeight: 0.95,
                letterSpacing: "-4px",
                display: "flex",
              }}
            >
              YOUR IDENTITY
            </div>
            <div
              style={{
                fontSize: 88,
                fontWeight: 900,
                color: "#2D2D2D",
                lineHeight: 0.95,
                letterSpacing: "-4px",
                display: "flex",
              }}
            >
              DOESN&apos;T.
            </div>
          </div>

          {/* Bottom row - tags */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {["ZK Proofs", "Ethereum", "Privacy"].map((tag) => (
              <div
                key={tag}
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "#BBBBBB",
                  border: "2px solid #FFFFFF",
                  padding: "6px 14px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Large ghost watermark - bottom right */}
        <div
          style={{
            position: "absolute",
            right: -20,
            bottom: -30,
            opacity: 0.04,
            display: "flex",
          }}
        >
          <PixelGhost cellSize={28} color="#FFFFFF" />
        </div>
      </div>
    ),
    { ...size }
  );
}
