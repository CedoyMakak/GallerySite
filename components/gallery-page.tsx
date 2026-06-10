"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase-client";
import { Painting, paintingFromRow, PaintingRow } from "@/types/painting";
import {
  ArtistProfile,
  ArtistProfileRow,
  artistProfileFromRow,
  defaultArtistProfile
} from "@/types/artist-profile";
import { BuyModal } from "@/components/buy-modal";
import { FavoriteButton } from "@/components/favorite-button";
import { ReviewsSection } from "@/components/reviews-section";
import { SearchBar } from "@/components/search-bar";
import { StoriesStrip } from "@/components/stories-strip";
import { useFavorites } from "@/hooks/use-favorites";
import { averageRating } from "@/lib/review-utils";
import { Review, reviewFromRow, ReviewRow } from "@/types/review";
import {
  filterPaintings,
  PRICE_FILTER_OPTIONS,
  PriceFilter,
  SIZE_FILTER_OPTIONS,
  SizeFilter,
} from "@/lib/gallery-filters";

export function GalleryPage() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [profile, setProfile] = useState<ArtistProfile>(defaultArtistProfile);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { favoriteIds, favoriteCount, isFavorite, toggleFavorite } = useFavorites();

  const loadReviews = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as ReviewRow[];
      setReviews(rows.map(reviewFromRow));
    } catch (err) {
      console.error("loadReviews error:", JSON.stringify(err), err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("paintings")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        const rows = (data ?? []) as PaintingRow[];
        setPaintings(rows.map(paintingFromRow));

        const { data: profileData, error: profileError } = await supabase
          .from("artist_profile")
          .select("*")
          .eq("id", "main")
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (profileData) {
          setProfile(artistProfileFromRow(profileData as ArtistProfileRow));
        }
      } catch (err) {
        console.error("load error:", JSON.stringify(err), err);
        alert(err instanceof Error ? err.message : "Не удалось загрузить галерею: " + JSON.stringify(err));
      }
    };

    void load();
    void loadReviews();
  }, []);

  const availableCount = useMemo(() => paintings.filter((p) => !p.sold).length, [paintings]);
  const soldCount = paintings.length - availableCount;
  const stories = useMemo(() => paintings.slice(0, 8), [paintings]);
  const reviewsAverage = useMemo(() => averageRating(reviews), [reviews]);

  const scrollToReviews = () => {
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredPaintings = useMemo(() => {
    const list = filterPaintings(paintings, { search, price: priceFilter, size: sizeFilter });
    if (!favoritesOnly) return list;
    const favSet = new Set(favoriteIds);
    return list.filter((p) => favSet.has(p.id));
  }, [paintings, search, priceFilter, sizeFilter, favoritesOnly, favoriteIds]);

  const hasActiveFilters =
    search.trim() !== "" ||
    priceFilter !== "all" ||
    sizeFilter !== "all" ||
    favoritesOnly;

  const resetFilters = () => {
    setSearch("");
    setPriceFilter("all");
    setSizeFilter("all");
    setFavoritesOnly(false);
  };

  return (
    <>
      <header className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-6 md:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="block leading-none">
              <div className="font-display text-2xl tracking-[0.12em] text-ink">CARTINA</div>
              <div className="mt-1 text-[9px] tracking-[0.4em] uppercase text-gold">— gallery —</div>
            </Link>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setFavoritesOnly((v) => !v)}
                className={`text-[11px] tracking-[0.25em] uppercase transition ${
                  favoritesOnly ? "text-gold" : "text-muted hover:text-ink"
                }`}
              >
                Избранное{favoriteCount > 0 ? ` (${favoriteCount})` : ""}
              </button>
              <Link
                href="/admin"
                className="text-[11px] tracking-[0.25em] uppercase text-muted transition hover:text-ink"
              >
                Admin
              </Link>
            </div>
          </div>
          <SearchBar value={search} onChange={setSearch} className="mt-4 md:mt-5" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
        {/* Hero */}
        <section className="mb-20 text-center md:mb-24">
          <p className="eyebrow">Частная коллекция</p>
          <h1 className="mt-5 font-display text-4xl leading-[1.1] text-ink md:text-6xl">
            Картины, созданные
            <br />
            в тишине
          </h1>
          <hr className="gold-divider mx-auto mt-8 mb-6" />
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted md:text-base">
            Авторская коллекция работ маслом и акрилом.
            Каждая картина продаётся напрямую у автора.
          </p>
          <p className="mt-8 text-[10px] tracking-[0.3em] uppercase text-muted">
            <span className="font-medium text-ink">{availableCount}</span>{" "}
            работ в наличии
          </p>
        </section>

        {/* Artist */}
        <section className="mb-20 border-y border-line py-10 md:mb-24 md:py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-10">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gold p-1">
                <div className="h-full w-full overflow-hidden rounded-full bg-cream-dark">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.name}
                      width={72}
                      height={72}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold">Художник</p>
                <h2 className="mt-2 font-display text-2xl text-ink md:text-3xl">{profile.name}</h2>
                {profile.bio ? (
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{profile.bio}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 md:ml-auto md:gap-10 md:border-l md:border-line md:pl-10">
              <Stat value={paintings.length} label="Работ" />
              <Stat value={availableCount} label="В наличии" />
              <Stat value={soldCount} label="Продано" />
            </div>
          </div>
        </section>

        <StoriesStrip
          stories={stories}
          averageRating={reviewsAverage}
          reviewCount={reviews.length}
          isFavorite={isFavorite}
          onOpen={setSelectedPainting}
          onScrollToReviews={scrollToReviews}
        />

        {/* Catalogue header */}
        <div className="mb-10 flex items-center justify-between border-b border-line pb-4">
          <p className="eyebrow text-[10px]">Каталог</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted">
            {hasActiveFilters
              ? `${filteredPaintings.length} из ${paintings.length}`
              : `${availableCount} в наличии`}
          </p>
        </div>

        {paintings.length > 0 ? (
          <section className="mb-12 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex-1">
                <span className="mb-1.5 block text-[10px] tracking-[0.25em] uppercase text-muted">
                  Цена
                </span>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
                  className="input-luxe cursor-pointer appearance-none bg-[length:12px] bg-[right_14px_center] bg-no-repeat pr-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A7E6E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  {PRICE_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex-1">
                <span className="mb-1.5 block text-[10px] tracking-[0.25em] uppercase text-muted">
                  Размер
                </span>
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value as SizeFilter)}
                  className="input-luxe cursor-pointer appearance-none bg-[length:12px] bg-[right_14px_center] bg-no-repeat pr-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A7E6E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  {SIZE_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn-text-gold shrink-0 self-end pb-3 sm:pb-3.5 sm:pl-2"
                >
                  Сбросить
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Grid */}
        <section className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPaintings.map((painting) => (
            <article
              key={painting.id}
              className={`group ${painting.sold ? "opacity-60" : ""}`}
            >
              <div className="relative border border-line bg-paper p-2 transition duration-300 group-hover:border-gold">
                <div className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
                  <Image
                    src={painting.imageUrl}
                    alt={painting.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.02]"
                  />
                </div>
                <FavoriteButton
                  active={isFavorite(painting.id)}
                  onToggle={() => toggleFavorite(painting.id)}
                  className="absolute left-4 top-4 z-10"
                />
                {painting.sold ? (
                  <span className="badge-sold absolute right-4 top-4">Продано</span>
                ) : null}
              </div>

              <div className="px-1 pt-5">
                <h3 className="font-display text-xl leading-tight text-ink">{painting.title}</h3>
                <p className="mt-2 text-[10px] tracking-[0.2em] uppercase text-muted">
                  {painting.technique} · {painting.dimensions}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
                  <span className="font-display text-lg text-ink">
                    {painting.price.toLocaleString("ru-RU")} ₽
                  </span>
                  <button
                    onClick={() => setSelectedPainting(painting)}
                    disabled={painting.sold}
                    className={
                      painting.sold
                        ? "cursor-not-allowed text-[10px] tracking-[0.25em] uppercase text-muted"
                        : "btn-text-gold"
                    }
                  >
                    {painting.sold ? "— архив —" : "Купить →"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {paintings.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted">Коллекция готовится</p>
            <p className="mt-4 font-display text-2xl text-ink">Скоро здесь появятся работы</p>
          </div>
        ) : filteredPaintings.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted">
              {favoritesOnly ? "Избранное пусто" : "Ничего не найдено"}
            </p>
            <p className="mt-4 font-display text-2xl text-ink">
              {favoritesOnly
                ? "Нажмите ♥ на картине, чтобы сохранить её здесь"
                : "Попробуйте изменить фильтры"}
            </p>
            {hasActiveFilters ? (
              <button type="button" onClick={resetFilters} className="btn-outline-gold mt-8">
                {favoritesOnly ? "Показать весь каталог" : "Сбросить фильтры"}
              </button>
            ) : null}
          </div>
        ) : null}

        <ReviewsSection reviews={reviews} onSubmitted={loadReviews} />
      </main>

      <footer className="mt-20 border-t border-line bg-paper">
        <div className="mx-auto max-w-6xl px-8 py-10 text-center">
          <div className="font-display text-lg tracking-[0.12em] text-ink">CARTINA</div>
          <div className="mt-2 text-[9px] tracking-[0.4em] uppercase text-gold">— gallery —</div>
          <p className="mt-6 text-[10px] tracking-[0.25em] uppercase text-muted">
            © 2026 · Все права защищены
          </p>
        </div>
      </footer>

      <BuyModal
        painting={selectedPainting}
        profile={profile}
        onClose={() => setSelectedPainting(null)}
        isFavorite={selectedPainting ? isFavorite(selectedPainting.id) : false}
        onToggleFavorite={
          selectedPainting ? () => toggleFavorite(selectedPainting.id) : undefined
        }
      />
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center md:text-left">
      <p className="font-display text-2xl text-ink md:text-3xl">{value}</p>
      <p className="mt-1 text-[10px] tracking-[0.25em] uppercase text-muted">{label}</p>
    </div>
  );
}