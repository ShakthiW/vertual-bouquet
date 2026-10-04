"use client";

import { useState } from "react";
import { Bouquet } from "@/components/bouquet/Bouquet";
import { FlowerIcon } from "@/components/bouquet/Flower";
import { SAMPLES } from "@/lib/bouquet/samples";
import { FLOWERS } from "@/lib/flowers/catalog";

export function Playground() {
  const [animated, setAnimated] = useState(true);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl tracking-tight">Bouquet playground</h1>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={animated} onChange={(e) => setAnimated(e.target.checked)} />
          Idle motion
        </label>
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-3" aria-label="Sample bouquets">
        {Object.entries(SAMPLES).map(([name, data]) => (
          <figure
            key={name}
            className={`rounded-2xl p-4 ${name === "ink" ? "bg-white" : name === "garden" ? "bg-[#f3f1e8]" : "bg-[#fbeef0]"}`}
          >
            <Bouquet data={data} animated={animated} className="mx-auto w-full max-w-sm" />
            <figcaption className="mt-2 text-center text-sm capitalize text-ink-soft">{name}</figcaption>
          </figure>
        ))}
      </section>

      <section className="mt-14" aria-labelledby="catalog">
        <h2 id="catalog" className="font-display text-2xl tracking-tight">
          Catalog
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {FLOWERS.map((f) => (
            <li key={f.id}>
              <div className="flex flex-wrap gap-1">
                {Object.keys(f.colors).map((c) => (
                  <FlowerIcon key={c} type={f.id} color={c} className="size-16" title={`${f.colors[c].label} ${f.name}`} />
                ))}
              </div>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: f.variants }, (_, v) => (
                  <FlowerIcon key={v} type={f.id} color={Object.keys(f.colors)[0]} variant={v} className="size-10" />
                ))}
              </div>
              <p className="mt-2 font-medium">{f.name}</p>
              <p className="text-sm text-ink-soft">{f.meanings.join(" · ")}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
