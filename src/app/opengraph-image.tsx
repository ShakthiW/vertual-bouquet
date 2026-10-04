import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The preview when someone shares the site itself (bouquet links have their own).
export const alt = "Virtual Bouquet: some feelings deserve more than a text.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const dir = join(process.cwd(), "src/assets");
const fraunces = readFile(join(dir, "fonts/og/fraunces-500.ttf"));
const frauncesItalic = readFile(join(dir, "fonts/og/fraunces-italic-500.ttf"));
const caveat = readFile(join(dir, "fonts/og/caveat-600.ttf"));
const rose = readFile(join(dir, "icon/rose.svg"));

export default async function Image() {
  const roseSrc = `data:image/svg+xml;base64,${(await rose).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 90px",
          background: "radial-gradient(70% 80% at 75% 45%, #fff3ec 0%, #f8e3e3 65%, #f2d6d8 100%)",
          color: "#2a1219",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Fraunces Italic", fontSize: 30, color: "#6e4f57" }}>
            <img src={roseSrc} width={44} height={44} alt="" style={{ borderRadius: 10 }} />
            Virtual Bouquet
          </div>
          <div style={{ display: "flex", marginTop: 26, fontFamily: "Fraunces", fontSize: 76, lineHeight: 1.04, letterSpacing: -2 }}>
            Some feelings deserve more than a text.
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 28, color: "#6e4f57", fontFamily: "Fraunces Italic" }}>
            Make a bouquet, write a card, send a link.
          </div>
        </div>
        <div style={{ display: "flex", position: "relative", marginLeft: 50, width: 340, height: 232 }}>
          <svg width="340" height="232" viewBox="0 0 340 232" style={{ position: "absolute", top: 0, left: 0 }}>
            <rect x="0" y="8" width="340" height="224" rx="10" fill="#c9a49a" opacity="0.35" />
            <rect x="0" y="0" width="340" height="224" rx="10" fill="#f7e9e3" />
            <path d="M0 10 Q0 0 10 0 L330 0 Q340 0 340 10 L170 130 Z" fill="#ead2c9" />
            <circle cx="170" cy="130" r="26" fill="#9c2443" />
          </svg>
          <div style={{ position: "absolute", left: 0, width: 340, bottom: 18, display: "flex", justifyContent: "center", fontFamily: "Caveat", fontSize: 40 }}>
            For you
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: await fraunces, weight: 500, style: "normal" },
        { name: "Fraunces Italic", data: await frauncesItalic, weight: 500, style: "normal" },
        { name: "Caveat", data: await caveat, weight: 600, style: "normal" },
      ],
    },
  );
}
