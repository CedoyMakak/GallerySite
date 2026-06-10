import { Review } from "@/types/review";

export function averageRating(reviews: Review[]): number | null {
  const rated = reviews.filter((r) => r.rating !== null && r.rating > 0);
  if (rated.length === 0) return null;
  const sum = rated.reduce((acc, r) => acc + (r.rating ?? 0), 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

export function formatReviewDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
