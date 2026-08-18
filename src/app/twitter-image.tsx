import { ImageResponse } from "next/og";

export const alt = "ROOM Guest Houses — Отдых в горах Азербайджана";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(160deg, #0d0b09 0%, #3a2c1a 55%, #261A0B 100%)",
          color: "#b8ad9a",
          fontFamily: "Montserrat, sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "#b8ad9a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#261A0B",
              fontSize: "40px",
              fontWeight: 700,
            }}
          >
            R
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "64px", fontWeight: 700, lineHeight: 1.1 }}>
              ROOM
            </div>
            <div style={{ fontSize: "40px", fontWeight: 500, lineHeight: 1.1 }}>
              Guest Houses
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: "30px",
            color: "#ffffff",
            opacity: 0.9,
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          Уютные гостевые дома в сердце природы Исмаиллы
        </div>
      </div>
    ),
    { ...size }
  );
}