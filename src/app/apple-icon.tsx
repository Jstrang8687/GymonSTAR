import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const s = size.width;
  const circle = Math.round(s * 0.34);
  const barHeight = Math.round(s * 0.13);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
        }}
      >
        <div style={{ width: circle, height: circle, borderRadius: "50%", background: "#fbbf24" }} />
        <div style={{ width: Math.round(s * 0.44), height: barHeight, background: "#fbbf24" }} />
        <div style={{ width: circle, height: circle, borderRadius: "50%", background: "#fbbf24" }} />
      </div>
    ),
    { ...size }
  );
}
