import "server-only";

import sharp from "sharp";

/**
 * Link previews as JPEG. Satori renders PNG, which is several hundred KB for
 * painterly backgrounds; WhatsApp silently drops preview images much over
 * ~300KB. The same image as a JPEG is a fraction of that.
 */
export async function asJpeg(image: Response, quality = 82): Promise<Response> {
  const png = Buffer.from(await image.arrayBuffer());
  const jpeg = await sharp(png).jpeg({ quality, mozjpeg: true }).toBuffer();
  const headers = new Headers({ "content-type": "image/jpeg" });
  const cache = image.headers.get("cache-control");
  if (cache) headers.set("cache-control", cache);
  return new Response(new Uint8Array(jpeg), { headers });
}
