"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Palette } from "lucide-react";
import { getPaintings } from "@/lib/local-storage";
import { Painting } from "@/types/painting";
import { BuyModal } from "@/components/buy-modal";

export function GalleryPage() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);

  useEffect(() => {
    setPaintings(getPaintings());
  }, []);

  const availableCount = useMemo(() => paintings.filter((p) => !p.sold).length, [paintings]);

  return (
    <>
      <header className="border-b border-stone-300 bg-[#f1ebe0]/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <Palette className="text-stone-700" size={20} />
            <span className="text-xl font-semibold tracking-wide text-stone-900">Cartina Gallery</span>
          </div>
          <a href="/admin" className="text-sm text-stone-600 transition hover:text-stone-900">
            Admin
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Private Collection</p>
          <h1 className="mt-2 text-4xl font-semibold text-stone-900 md:text-5xl">Paintings by One Artist</h1>
          <p className="mt-3 max-w-2xl text-sm text-stone-600 md:text-base">
            A curated collection in stone, cream, and charcoal tones. Every piece is sold only by the gallery owner.
          </p>
          <p className="mt-4 text-sm text-stone-500">{availableCount} paintings currently available</p>
        </section>

        <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {paintings.map((painting) => (
            <article
              key={painting.id}
              className="group overflow-hidden rounded-2xl border border-stone-300 bg-[#f7f3ec] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-stone-200">
                <Image
                  src={painting.imageUrl}
                  alt={painting.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={`object-cover transition duration-500 group-hover:scale-105 ${painting.sold ? "grayscale" : ""}`}
                />
                {painting.sold ? (
                  <span className="absolute right-3 top-3 rounded-full bg-[#2e2c2a] px-3 py-1 text-xs uppercase tracking-wider text-stone-100">
                    Sold
                  </span>
                ) : null}
              </div>

              <div className="space-y-2 p-4">
                <h2 className="text-xl font-medium text-stone-900">{painting.title}</h2>
                <p className="text-sm text-stone-500">{painting.dimensions}</p>
                <p className="text-sm text-stone-600">{painting.technique}</p>
                <p className="pt-1 text-lg font-semibold text-stone-900">{painting.price.toLocaleString()} RUB</p>
                <button
                  onClick={() => setSelectedPainting(painting)}
                  disabled={painting.sold}
                  className="mt-2 w-full rounded-xl border border-[#2e2c2a] px-4 py-2 text-sm font-medium text-[#2e2c2a] transition hover:bg-[#2e2c2a] hover:text-stone-100 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400 disabled:hover:bg-transparent"
                >
                  {painting.sold ? "Already Sold" : "Buy"}
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      <BuyModal painting={selectedPainting} onClose={() => setSelectedPainting(null)} />
    </>
  );
}
