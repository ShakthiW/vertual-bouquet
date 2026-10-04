import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getBouquet } from "@/lib/db/bouquets";

// The chat preview: a sealed envelope addressed to the recipient. It never
// shows the bouquet itself, so the reveal stays a surprise.

export const alt = "A sealed envelope with a wax seal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fonts = join(process.cwd(), "src/assets/fonts/og");
const caveat = readFile(join(fonts, "caveat-600.ttf"));
const fraunces = readFile(join(fonts, "fraunces-italic-500.ttf"));
const geist = readFile(join(fonts, "geist-500.ttf"));

// The bundled fonts cover Latin scripts. A name they can't draw (Sinhala,
// Tamil, emoji...) would render as empty boxes, so it is left off the image;
// the chat title above it still carries the real name.
const drawable = (s: string) => /^[\p{Script=Latin}\p{N}\s.'’\-&,!?]+$/u.test(s);

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await getBouquet(id);
  const to = b && drawable(b.card.to) ? b.card.to : null;
  const from = b?.card.from ?? "";
  const initial = from && drawable(from[0]) ? from[0].toUpperCase() : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(60% 70% at 50% 45%, #fff3ec 0%, #f8e3e3 70%, #f2d6d8 100%)",
          fontFamily: "Geist",
        }}
      >
        <div style={{ position: "relative", width: 620, height: 420, display: "flex" }}>
          <svg width="620" height="420" viewBox="0 0 620 420" style={{ position: "absolute", top: 0, left: 0 }}>
            <defs>
              <linearGradient id="flap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f1ddd5" />
                <stop offset="1" stopColor="#e7cbc1" />
              </linearGradient>
              <radialGradient id="seal" cx="0.4" cy="0.35" r="0.7">
                <stop offset="0" stopColor="#b3304f" />
                <stop offset="1" stopColor="#7c1531" />
              </radialGradient>
            </defs>
            <rect x="0" y="12" width="620" height="408" rx="14" fill="#c9a49a" opacity="0.35" />
            <rect x="0" y="0" width="620" height="408" rx="14" fill="#f7e9e3" />
            <path d="M0 14 Q0 0 14 0 L606 0 Q620 0 620 14 L310 236 Z" fill="url(#flap)" />
            <path d="M0 408 L250 200 M620 408 L370 200" stroke="#e9d3ca" strokeWidth="2" />
            <circle cx="310" cy="236" r="44" fill="url(#seal)" />
            <circle cx="310" cy="236" r="34" fill="none" stroke="#9c2443" strokeWidth="2" opacity="0.6" />
          </svg>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 206,
              width: 620,
              display: "flex",
              justifyContent: "center",
              fontFamily: "Fraunces",
              fontSize: 40,
              color: "#f6d9df",
            }}
          >
            {initial}
          </div>
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              bottom: 44,
              display: "flex",
              justifyContent: "center",
              fontFamily: "Caveat",
              fontSize: 64,
              color: "#2a1219",
            }}
          >
            {to ? `For ${to.length > 22 ? `${to.slice(0, 21)}…` : to}` : "For you"}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 34,
            display: "flex",
            fontFamily: "Fraunces",
            fontSize: 26,
            color: "#6e4f57",
          }}
        >
          Virtual Bouquet
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Caveat", data: await caveat, weight: 600, style: "normal" },
        { name: "Fraunces", data: await fraunces, weight: 500, style: "normal" },
        { name: "Geist", data: await geist, weight: 500, style: "normal" },
      ],
    },
  );
}
