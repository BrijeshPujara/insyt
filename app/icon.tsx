import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #006874 0%, #004f5a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Inner highlight */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)",
            borderRadius: 8,
          }}
        />
        {/* "I." wordmark */}
        <span
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: "-0.5px",
            lineHeight: 1,
            fontFamily: "sans-serif",
          }}
        >
          I.
        </span>
      </div>
    ),
    { ...size }
  );
}
