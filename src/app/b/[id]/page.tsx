import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipientView } from "@/components/recipient/RecipientView";
import { getBouquet } from "@/lib/db/bouquets";

export async function generateMetadata({ params }: PageProps<"/b/[id]">): Promise<Metadata> {
  const { id } = await params;
  const b = await getBouquet(id);
  if (!b) return { title: "Bouquet not found", robots: { index: false, follow: false } };
  const title = `${b.card.from} sent you a bouquet 🌷`;
  return {
    // Absolute: the chat preview should read as a message, not a site name.
    title: { absolute: title },
    description: `For ${b.card.to}. Tap to open.`,
    robots: { index: false, follow: false },
    openGraph: { title, description: `For ${b.card.to}. Tap to open.`, type: "website", siteName: "Virtual Bouquet" },
    twitter: { card: "summary_large_image", title, description: `For ${b.card.to}. Tap to open.` },
  };
}

export default async function Page({ params }: PageProps<"/b/[id]">) {
  const { id } = await params;
  const bouquet = await getBouquet(id);
  if (!bouquet) notFound();
  // Only what the page shows goes to the browser.
  const { style, flowers, wrap, card } = bouquet;
  return <RecipientView id={id} bouquet={{ style, flowers, wrap, card }} />;
}
