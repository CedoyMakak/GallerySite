"use client";

import Image from "next/image";
import { Painting } from "@/types/painting";
import { StarRating } from "@/components/star-rating";

type StoriesStripProps = {
  stories: Painting[];
  averageRating: number | null;
  reviewCount: number;
  isFavorite: (id: string) => boolean;
  onOpen: (painting: Painting) => void;
  onScrollToReviews: () => void;
};

export function StoriesStrip({
  stories,
  averageRating,
  reviewCount,
  isFavorite,
  onOpen,
  onScrollToReviews,
}: StoriesStripProps) {
  if (stories.length === 0) return null;

  return (
    <section className="mb-20 md:mb-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow text-[10px]">Недавние работы</p>
        <div className="flex items-center gap-4">
          {averageRating !== null ? (
            <button
              type="button"
              onClick={onScrollToReviews}
              className="flex items-center gap-2 transition hover:opacity-80"
              aria-label="Перейти к отзывам"
            >
              <StarRating value={averageRating} size={12} />
              <span className="text-[10px] tracking-[0.15em] text-ink">
                {averageRating}
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted">
                ({reviewCount})
              </span>
            </button>
          ) : null}
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted">Свайпни →</span>
        </div>
      </div>

      <div className="-mx-2 flex gap-5 overflow-x-auto px-2 pb-3">
        {stories.map((painting) => (
          <button
            key={`story-${painting.id}`}
            onClick={() => onOpen(painting)}
            className="group shrink-0 text-center"
            aria-label={`Открыть «${painting.title}»`}
          >
            <div
              className={`relative h-16 w-16 overflow-hidden rounded-full p-[2px] transition ${
                isFavorite(painting.id)
                  ? "border-2 border-gold"
                  : "border border-line group-hover:border-gold"
              }`}
            >
              <div className="h-full w-full overflow-hidden rounded-full bg-cream-dark">
                <Image
                  src={painting.imageUrl}
                  alt={painting.title}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              {averageRating !== null ? (
                <span className="absolute -bottom-0.5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-line bg-paper px-1.5 py-0.5 shadow-sm">
                  <StarRating value={averageRating} size={8} />
                </span>
              ) : null}
            </div>
            <p className="mt-3 max-w-[72px] truncate font-display text-xs text-muted">
              {painting.title}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
