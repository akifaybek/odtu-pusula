import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "linear-gradient(135deg, #8B0000 0%, #B22222 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Compass outer circle */}
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Compass inner markers */}
          <circle cx="12" cy="12" r="2" fill="white" />
          {/* North arrow */}
          <path d="M12 4L14 10H10L12 4Z" fill="white" />
          {/* South arrow */}
          <path d="M12 20L10 14H14L12 20Z" fill="rgba(255,255,255,0.6)" />
          {/* East marker */}
          <line
            x1="18"
            y1="12"
            x2="14"
            y2="12"
            stroke="white"
            strokeWidth="1.5"
          />
          {/* West marker */}
          <line
            x1="6"
            y1="12"
            x2="10"
            y2="12"
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
