import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Drawn as plain flexbox shapes (not a text/emoji glyph) so it renders
// reliably without depending on a remote font-glyph fetch at build/request
// time -- that fetch silently failed for special characters and left a
// "missing glyph" box instead of the icon.
export default function Icon() {
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
