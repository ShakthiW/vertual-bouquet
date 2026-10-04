import type { Metadata } from "next";
import { Studio } from "@/components/studio/Studio";
import { StudioProvider } from "@/components/studio/StudioProvider";

export const metadata: Metadata = {
  title: "Make a bouquet",
  description: "Pick flowers, arrange them, wrap them and write a card. Free, no account.",
};

export default async function Page({ searchParams }: PageProps<"/create">) {
  const { to } = await searchParams;
  return (
    <StudioProvider initialTo={typeof to === "string" ? to : ""}>
      <Studio />
    </StudioProvider>
  );
}
