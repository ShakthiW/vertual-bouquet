import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bouquet } from "@/components/bouquet/Bouquet";
import { LocalTime } from "@/components/LocalTime";
import { getByManageToken } from "@/lib/db/bouquets";
import { DeleteBouquet } from "./DeleteBouquet";

export const metadata: Metadata = {
  title: "Your bouquet",
  robots: { index: false, follow: false },
  // The token is the secret: never leak it to other sites.
  referrer: "no-referrer",
};

export default async function Page({ params }: PageProps<"/m/[token]">) {
  const { token } = await params;
  const b = await getByManageToken(token);
  if (!b) notFound();

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-8 px-5 py-10 sm:flex-row sm:items-center sm:gap-12">
      <Bouquet data={b} className="mx-auto h-[46svh] w-auto shrink-0 sm:h-[60svh]" />
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm text-ink-soft">Your bouquet for</p>
          <h1 className="font-display text-4xl tracking-tight">{b.card.to}</h1>
        </div>

        <dl className="grid gap-3 text-[0.95rem]">
          <div>
            <dt className="text-sm text-ink-soft">Sent</dt>
            <dd>
              <LocalTime iso={b.createdAt} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Opened</dt>
            <dd>
              {b.openedAt ? (
                <>
                  🌷 <LocalTime iso={b.openedAt} />
                </>
              ) : (
                "Not opened yet"
              )}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/b/${b.id}`}
            className="inline-flex min-h-11 items-center rounded-full border border-hairline bg-surface px-5 font-medium"
          >
            View the bouquet
          </Link>
          <DeleteBouquet token={token} to={b.card.to} />
        </div>
        <p className="text-xs text-ink-soft">Keep this page&apos;s link private: anyone with it can delete the bouquet.</p>
      </div>
    </main>
  );
}
