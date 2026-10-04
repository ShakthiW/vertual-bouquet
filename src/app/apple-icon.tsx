import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Home-screen icon: the same rose as icon.svg, as a PNG (iOS doesn't use SVG icons).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "src/assets/icon/rose.svg"));
  const src = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f8e3e3" }}>
        <img src={src} width={180} height={180} alt="" />
      </div>
    ),
    size,
  );
}
