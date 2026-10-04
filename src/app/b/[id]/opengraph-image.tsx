import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { bouquetSvg } from "@/components/bouquet/staticSvg";
import { getBouquet } from "@/lib/db/bouquets";
import { asJpeg } from "@/lib/og";
import { SITE } from "@/lib/site";

// The chat preview for a shared bouquet: the actual bouquet they made, drawn
// from the same art as the app, with who it's for and who it's from. The card
// message stays hidden, so there is still something to open.

export const alt = "A bouquet of flowers, made for you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

const assets = join(process.cwd(), "src/assets");
const paper = readFile(join(assets, "brand/paper-bg.jpg"));
const logo = readFile(join(assets, "brand/logo-512.png"));
const caveat = readFile(join(assets, "fonts/og/caveat-600.ttf"));
const fraunces = readFile(join(assets, "fonts/og/fraunces-500.ttf"));
const frauncesItalic = readFile(join(assets, "fonts/og/fraunces-italic-500.ttf"));

const dataUri = (buf: Buffer | string, type: string) =>
  `data:${type};base64,${(typeof buf === "string" ? Buffer.from(buf) : buf).toString("base64")}`;

// The bundled fonts cover Latin scripts. A name they can't draw (Sinhala,
// Tamil, emoji...) would render as empty boxes, so it is left off the image;
// the chat title above the image still carries the real name.
const drawable = (s: string) => /^[\p{Script=Latin}\p{N}\s.'’\-&,!?]+$/u.test(s);
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const nameSize = (line: string) => (line.length <= 10 ? 120 : line.length <= 14 ? 96 : 80);

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await getBouquet(id);
  const to = b && drawable(b.card.to) ? clip(b.card.to, 16) : null;
  const from = b && drawable(b.card.from) ? clip(b.card.from, 22) : null;
  // Bouquet at 500 x 600, matching the 1000 x 1200 frame.
  const art = b ? dataUri(bouquetSvg(b, { width: 500, height: 600 }), "image/svg+xml") : null;

  return asJpeg(
    new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", color: "#2a1219" }}>
        <img
          src={dataUri(await paper, "image/jpeg")}
          width={1200}
          height={630}
          alt=""
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 640, padding: "0 0 0 92px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 34 }}>
            <img src={dataUri(await logo, "image/png")} width={40} height={40} alt="" style={{ borderRadius: 10 }} />
            <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 30, color: "#6e4f57" }}>{SITE.name}</div>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              // Step the handwriting down for longer names so it stays on one line.
              fontSize: nameSize(to ? `For ${to}` : "For you"),
              lineHeight: 1,
              letterSpacing: -1,
            }}
          >
            {to ? `For ${to}` : "For you"}
          </div>
          {from && (
            <div style={{ display: "flex", marginTop: 18, fontFamily: "Fraunces Italic", fontSize: 38, color: "#6e4f57" }}>
              with love from {from}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 56 }}>
            <div
              style={{
                display: "flex",
                width: 30,
                height: 30,
                borderRadius: 30,
                background: "#8d1d3f",
                boxShadow: "0 2px 4px rgba(60,10,25,0.35)",
              }}
            />
            <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 28, color: "#2a1219" }}>
              Sealed with a card. Tap to open.
            </div>
          </div>
        </div>

        {art && <img src={art} width={500} height={600} alt="" style={{ position: "absolute", right: 70, top: 22 }} />}
      </div>,
      {
        ...size,
        fonts: [
          { name: "Caveat", data: await caveat, weight: 600, style: "normal" },
          { name: "Fraunces", data: await fraunces, weight: 500, style: "normal" },
          { name: "Fraunces Italic", data: await frauncesItalic, weight: 500, style: "normal" },
        ],
      },
    ),
  );
}
