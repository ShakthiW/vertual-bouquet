import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrangeReview } from "./ArrangeReview";

export const metadata: Metadata = {
  title: "Arrangement review",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ArrangeReview />;
}
