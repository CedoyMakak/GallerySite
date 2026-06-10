"use client";

import { useCallback, useEffect, useState } from "react";
import { readFavoriteIds, toggleFavoriteId } from "@/lib/favorites-storage";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFavoriteIds(readFavoriteIds());
    setReady(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === "cartina.favorites.v1") {
        setFavoriteIds(readFavoriteIds());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds]
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds(toggleFavoriteId(id));
  }, []);

  return {
    ready,
    favoriteIds,
    favoriteCount: favoriteIds.length,
    isFavorite,
    toggleFavorite,
  };
}
