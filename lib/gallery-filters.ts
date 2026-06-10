import { Painting } from "@/types/painting";

export type PriceFilter = "all" | "under-20k" | "20k-50k" | "50k-100k" | "over-100k";
export type SizeFilter = "all" | "small" | "medium" | "large";

const DIMENSIONS_RE = /(\d+(?:[.,]\d+)?)\s*[xх×]\s*(\d+(?:[.,]\d+)?)/i;

export function parseDimensionsCm(dimensions: string): { width: number; height: number } | null {
  const match = dimensions.match(DIMENSIONS_RE);
  if (!match) return null;

  const width = Number.parseFloat(match[1].replace(",", "."));
  const height = Number.parseFloat(match[2].replace(",", "."));
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

export function paintingAreaCm2(dimensions: string): number | null {
  const parsed = parseDimensionsCm(dimensions);
  if (!parsed) return null;
  return parsed.width * parsed.height;
}

function matchesPrice(price: number, filter: PriceFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "under-20k":
      return price < 20_000;
    case "20k-50k":
      return price >= 20_000 && price < 50_000;
    case "50k-100k":
      return price >= 50_000 && price < 100_000;
    case "over-100k":
      return price >= 100_000;
  }
}

function matchesSize(dimensions: string, filter: SizeFilter): boolean {
  if (filter === "all") return true;

  const area = paintingAreaCm2(dimensions);
  if (area === null) return false;

  if (filter === "small") return area < 3_000;
  if (filter === "medium") return area >= 3_000 && area < 8_000;
  return area >= 8_000;
}

function matchesSearch(painting: Painting, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    painting.title,
    painting.description,
    painting.technique,
    painting.dimensions,
    painting.price.toString(),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export function filterPaintings(
  paintings: Painting[],
  options: {
    search: string;
    price: PriceFilter;
    size: SizeFilter;
  }
): Painting[] {
  return paintings.filter(
    (p) =>
      matchesSearch(p, options.search) &&
      matchesPrice(p.price, options.price) &&
      matchesSize(p.dimensions, options.size)
  );
}

export const PRICE_FILTER_OPTIONS: { value: PriceFilter; label: string }[] = [
  { value: "all", label: "Любая цена" },
  { value: "under-20k", label: "До 20 000 ₽" },
  { value: "20k-50k", label: "20 000 – 50 000 ₽" },
  { value: "50k-100k", label: "50 000 – 100 000 ₽" },
  { value: "over-100k", label: "От 100 000 ₽" },
];

export const SIZE_FILTER_OPTIONS: { value: SizeFilter; label: string }[] = [
  { value: "all", label: "Любой размер" },
  { value: "small", label: "Маленькие (до ~55×55 см)" },
  { value: "medium", label: "Средние (~55×80 см)" },
  { value: "large", label: "Большие (от ~80×100 см)" },
];
