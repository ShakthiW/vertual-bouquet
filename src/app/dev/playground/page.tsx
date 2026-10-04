import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Playground } from "./Playground";

export const metadata: Metadata = {
  title: "Playground",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Playground />;
}
