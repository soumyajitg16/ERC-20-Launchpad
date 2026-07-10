import { ImageResponse } from "next/og";
import { siteDescription, siteName } from "../utils/seo";

export const alt = `${siteName} social preview`;
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 48%, #ecfeff 100%)",
          color: "#18181b",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%"
        }}
      >
        <div
          style={{
            border: "1px solid #d4d4d8",
            borderRadius: 28,
            boxShadow: "0 30px 80px rgba(79, 70, 229, 0.18)",
            display: "flex",
            flexDirection: "column",
            gap: 28,
            padding: 56,
            width: "100%"
          }}
        >
          <div style={{ color: "#4f46e5", fontSize: 28, fontWeight: 700 }}>
            ERC20 Token Launchpad
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02 }}>
            {siteName}
          </div>
          <div style={{ color: "#3f3f46", fontSize: 34, lineHeight: 1.3, maxWidth: 920 }}>
            {siteDescription}
          </div>
          <div style={{ color: "#0f766e", fontSize: 28, fontWeight: 700 }}>
            Polygon Amoy • EIP-1167 clones • Wallet connected
          </div>
        </div>
      </div>
    ),
    size
  );
}
