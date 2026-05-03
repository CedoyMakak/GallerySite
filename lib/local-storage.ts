"use client";

import { initialPaintings } from "@/lib/mock-data";
import { Painting } from "@/types/painting";

const STORAGE_KEY = "cartina.paintings.v1";

export const getPaintings = (): Painting[] => {
  if (typeof window === "undefined") {
    return initialPaintings;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPaintings));
    return initialPaintings;
  }

  try {
    const parsed = JSON.parse(raw) as Painting[];
    return Array.isArray(parsed) ? parsed : initialPaintings;
  } catch {
    return initialPaintings;
  }
};

export const savePaintings = (paintings: Painting[]) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(paintings));
};
