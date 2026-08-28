import { ImageResponse } from "next/og";

const SIZE = 192;

// Separate from icon.tsx/apple-icon.tsx (which drive the <head> favicon/
// apple-touch-icon tags) -- the web manifest needs stable, explicitly-sized
// URLs for Android's install-quality bar, so this is a plain route handler
// rather than the special icon-file convention.
export async function GET() {
  const circle = Math.round(SIZE * 0.34);
  const barHeight = Math.round(SIZE * 0.13);
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
        <div style={{ width: Math.round(SIZE * 0.44), height: barHeight, background: "#fbbf24" }} />
        <div style={{ width: circle, height: circle, borderRadius: "50%", background: "#fbbf24" }} />
      </div>
    ),
    { width: SIZE, height: SIZE }
  );
}
