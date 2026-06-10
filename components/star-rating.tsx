"use client";

import { Star } from "lucide-react";

type StarRatingProps = {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
};

export function StarRating({
  value,
  max = 5,
  size = 14,
  interactive = false,
  onChange,
  className = "",
}: StarRatingProps) {
  const display = interactive ? value : Math.round(value * 2) / 2;

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "Оценка" : `Оценка ${display} из ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = display >= starValue;
        const half = !interactive && !filled && display >= starValue - 0.5;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange?.(starValue)}
              className="p-0.5 transition hover:scale-110"
              aria-label={`${starValue} звёзд`}
            >
              <Star
                size={size}
                className={filled ? "fill-gold text-gold" : "text-line"}
                strokeWidth={1.5}
              />
            </button>
          );
        }

        return (
          <span key={starValue} className="relative inline-flex">
            <Star size={size} className="text-line" strokeWidth={1.5} />
            {(filled || half) && (
              <Star
                size={size}
                className={`absolute inset-0 fill-gold text-gold ${half ? "clip-path-half" : ""}`}
                strokeWidth={1.5}
                style={
                  half
                    ? { clipPath: "inset(0 50% 0 0)" }
                    : undefined
                }
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
