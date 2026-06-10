"use client";

import { Heart } from "lucide-react";

type FavoriteButtonProps = {
  active: boolean;
  onToggle: () => void;
  label?: string;
  className?: string;
};

export function FavoriteButton({
  active,
  onToggle,
  label = "Добавить в избранное",
  className = "",
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={active ? "Убрать из избранного" : label}
      aria-pressed={active}
      className={`flex h-9 w-9 items-center justify-center border border-line bg-paper/90 backdrop-blur-sm transition hover:border-gold ${className}`}
    >
      <Heart
        size={16}
        className={active ? "fill-gold text-gold" : "text-muted"}
        strokeWidth={1.5}
      />
    </button>
  );
}
