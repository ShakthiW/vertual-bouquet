import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE } from "@/lib/site";

// Self-hosted (SIL Open Font License) so builds never depend on reaching
// Google Fonts, and the OG image renderer can reuse the same files.
const geistSans = localFont({
  src: "../assets/fonts/geist-normal.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const fraunces = localFont({
  src: [
    { path: "../assets/fonts/fraunces-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../assets/fonts/fraunces-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

const caveat = localFont({
  src: "../assets/fonts/caveat-normal.woff2",
  variable: "--font-caveat",
  weight: "400 700",
  display: "swap",
});

const dancing = localFont({
  src: "../assets/fonts/dancing-normal.woff2",
  variable: "--font-dancing",
  weight: "400 700",
  display: "swap",
});

/** The public address of the site, so link previews get absolute image URLs. */
function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE.name}: ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  applicationName: SITE.name,
  description: SITE.description,
  openGraph: { siteName: SITE.name, type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#fbf5f4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} ${caveat.variable} ${dancing.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
