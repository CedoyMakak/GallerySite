const STORAGE_KEY = "cartina.favorites.v1";

export function readFavoriteIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function writeFavoriteIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function toggleFavoriteId(id: string): string[] {
  const current = readFavoriteIds();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  writeFavoriteIds(next);
  return next;
}
