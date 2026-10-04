import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { asJpeg } from "@/lib/og";
import { SITE } from "@/lib/site";

// The preview when someone shares the site itself. The background is a
// Gemini-painted paper-cut arrangement (src/assets/brand, see scripts/brand);
// all text is real type set here, never baked into the image.

export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

const assets = join(process.cwd(), "src/assets");
const background = readFile(join(assets, "brand/share-bg.jpg"));
const logo = readFile(join(assets, "brand/logo-512.png"));
const fraunces = readFile(join(assets, "fonts/og/fraunces-500.ttf"));
const frauncesItalic = readFile(join(assets, "fonts/og/fraunces-italic-500.ttf"));

const dataUri = (buf: Buffer, type: string) => `data:${type};base64,${buf.toString("base64")}`;

export default async function Image() {
  return asJpeg(
    new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", color: "#2a1219" }}>
        <img
          src={dataUri(await background, "image/jpeg")}
          width={1200}
          height={630}
          alt=""
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 88px", width: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img src={dataUri(await logo, "image/png")} width={72} height={72} alt="" style={{ borderRadius: 18 }} />
            <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 58, letterSpacing: -1.5 }}>{SITE.name}</div>
          </div>
          <div
            style={{ display: "flex", marginTop: 38, fontFamily: "Fraunces", fontSize: 70, lineHeight: 1.04, letterSpacing: -2 }}
          >
            {SITE.tagline}
          </div>
          <div style={{ display: "flex", marginTop: 26, fontFamily: "Fraunces Italic", fontSize: 30, color: "#6e4f57" }}>
            Make a bouquet, write a card, send a link.
          </div>
        </div>
      </div>,
      {
        ...size,
        fonts: [
          { name: "Fraunces", data: await fraunces, weight: 500, style: "normal" },
          { name: "Fraunces Italic", data: await frauncesItalic, weight: 500, style: "normal" },
        ],
      },
    ),
  );
}
