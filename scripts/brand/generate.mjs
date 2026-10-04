// Brand image generation with Gemini. Usage:
//   node --env-file=.env.local scripts/brand/generate.mjs <set>
// Writes candidates to design/brand/candidates/ (git-ignored); the chosen ones
// are copied into src/assets/brand/ by hand after review.
import fs from "node:fs/promises";

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image";
const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("GEMINI_API_KEY is not set");

const PALETTE = "deep rose #B8325E, wine #8D1D3F, blush #F3CDD3, soft blush #F8E3E3, sage green #7C9572, cream #FFFDF9";
const NO = "No text, no letters, no words, no watermark, no signature, no border, no frame.";

const SETS = {
  logo: {
    aspectRatio: "1:1",
    prompts: {
      "logo-a-posy": `A minimal flat vector app icon. A small hand-tied posy: one open rose, one round ranunculus and a sprig of eucalyptus, stems gathered and tied with a short ribbon bow. Seen from the front, centered, generous padding. Bold, simple, solid shapes that stay readable at 16 pixels: no thin lines, no tiny details. Palette: ${PALETTE}. Solid soft blush #F8E3E3 background filling the whole square. Flat colour, no gradients, no shadows, no 3D, no photorealism. ${NO}`,
      "logo-b-rose": `A minimal flat vector app icon of a single rose bloom seen from slightly above, built from a few bold overlapping petal shapes spiralling inward, with two small leaves. Centered with generous padding. Bold and geometric enough to read at 16 pixels. Palette: ${PALETTE}. Solid soft blush #F8E3E3 background filling the whole square. Flat colour, no gradients, no shadows, no 3D. ${NO}`,
      "logo-c-cone": `A minimal flat vector app icon: a tiny wrapped bouquet in a paper cone, three round blooms peeking out of the top (rose, peony, ranunculus), the cone tied with a bow. Simple, chunky, friendly shapes readable at 16 pixels. Centered, generous padding. Palette: ${PALETTE}. Solid soft blush #F8E3E3 background filling the whole square. Flat colour, no gradients, no shadows. ${NO}`,
      "logo-d-envelope": `A minimal flat vector app icon: a small cream envelope with a single rose tucked into the flap, a round wine-red wax seal at the centre. Bold simple shapes readable at 16 pixels. Centered, generous padding. Palette: ${PALETTE}. Solid soft blush #F8E3E3 background filling the whole square. Flat colour, no gradients, no shadows. ${NO}`,
    },
  },
  share: {
    aspectRatio: "16:9",
    prompts: {
      "share-a-gouache": `A flat gouache and paper-cut style illustration for a website share card. A loose, airy arrangement of roses, peonies, ranunculus and eucalyptus gathered on the RIGHT third of the frame, with a few petals drifting toward the centre. The LEFT two thirds are calm, empty, softly textured blush paper (#F8E3E3) for text to be placed later. Romantic, delicate, editorial, lots of breathing room. Palette: ${PALETTE}. Subtle paper grain. ${NO}`,
      "share-b-watercolour": `A soft watercolour illustration for a website share card. Loose roses, peonies and eucalyptus in rose, wine, blush and sage, clustered along the RIGHT edge and bottom-right corner, a few petals floating across. The LEFT and centre are clean, empty blush paper (#F8E3E3) with a faint paper texture, reserved for typography. Airy, romantic, minimal. Palette: ${PALETTE}. ${NO}`,
      "share-c-scatter": `A flat, modern paper-cut illustration: scattered single flowers and petals (rose, ranunculus, daisy, eucalyptus leaves) framing the TOP-RIGHT and BOTTOM-RIGHT edges of a soft blush (#F8E3E3) paper background, leaving a wide calm empty area on the left and centre for text. Gentle, romantic, editorial. Palette: ${PALETTE}. Subtle paper grain. ${NO}`,
    },
  },
  paper: {
    aspectRatio: "16:9",
    prompts: {
      "paper-a": `A plain soft blush paper background (#F8E3E3 to #FBF0EE), very subtle fibre texture, a gentle warm light glow slightly right of centre, and just a few tiny scattered rose and blush petals near the outer edges. The centre is completely empty and calm. Minimal, quiet, romantic. ${NO}`,
      "paper-b": `A flat gouache and paper-cut style background, matching a romantic stationery set: plain soft blush paper (#F8E3E3) with very subtle paper grain and a faint warm glow right of centre. A few small flat paper-cut petals and two or three tiny eucalyptus leaves only along the outer edges and corners, in rose #B8325E, blush #F3CDD3, wine #8D1D3F and sage #7C9572. The whole centre is empty and calm. Flat colour, no photographic petals, no 3D. ${NO}`,
    },
  },
};

async function generate(name, prompt, aspectRatio) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio, imageSize: "2K" } },
    }),
  });
  if (!res.ok) throw new Error(`${name}: ${res.status} ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`${name}: no image returned (${JSON.stringify(json).slice(0, 200)})`);
  const ext = part.inlineData.mimeType.includes("jpeg") ? "jpg" : "png";
  const file = `design/brand/candidates/${name}.${ext}`;
  await fs.writeFile(file, Buffer.from(part.inlineData.data, "base64"));
  return file;
}

const set = SETS[process.argv[2]];
if (!set) throw new Error(`Pick a set: ${Object.keys(SETS).join(", ")}`);
const only = process.argv[3];
const jobs = Object.entries(set.prompts).filter(([name]) => !only || name === only);
const results = await Promise.allSettled(jobs.map(([name, prompt]) => generate(name, prompt, set.aspectRatio)));
for (const r of results) console.log(r.status === "fulfilled" ? `ok    ${r.value}` : `fail  ${r.reason.message}`);
