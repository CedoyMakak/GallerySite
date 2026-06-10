"use client";

import { FormEvent, useState } from "react";
import { getSupabase } from "@/lib/supabase-client";
import { averageRating, formatReviewDate } from "@/lib/review-utils";
import { Review } from "@/types/review";
import { StarRating } from "@/components/star-rating";

type ReviewsSectionProps = {
  reviews: Review[];
  onSubmitted: () => void;
};

export function ReviewsSection({ reviews, onSubmitted }: ReviewsSectionProps) {
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const avg = averageRating(reviews);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = authorName.trim();
    const body = text.trim();
    if (!name || !body) {
      alert("Укажите имя и текст отзыва.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("reviews").insert({
        author_name: name,
        text: body,
        rating,
        status: "pending",
      });

      if (error) throw error;

      setAuthorName("");
      setText("");
      setRating(5);
      setSubmitted(true);
      onSubmitted();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Не удалось отправить отзыв");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="mt-24 border-t border-line pt-16 md:mt-28 md:pt-20">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-[10px]">Отзывы</p>
          <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">О художнике</h2>
        </div>
        {avg !== null ? (
          <div className="flex items-center gap-3">
            <StarRating value={avg} size={16} />
            <span className="font-display text-xl text-ink">{avg}</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted">
              · {reviews.length} {reviews.length === 1 ? "отзыв" : reviews.length < 5 ? "отзыва" : "отзывов"}
            </span>
          </div>
        ) : null}
      </div>

      {reviews.length > 0 ? (
        <ul className="mb-14 space-y-8">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-line pb-8 last:border-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-lg text-ink">{review.authorName}</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted">
                  {formatReviewDate(review.createdAt)}
                </p>
              </div>
              {review.rating ? (
                <div className="mt-2">
                  <StarRating value={review.rating} size={12} />
                </div>
              ) : null}
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{review.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-14 text-sm text-muted">Пока нет опубликованных отзывов. Будьте первым.</p>
      )}

      <div className="border border-line bg-paper p-6 md:p-8">
        <p className="eyebrow text-[10px]">Оставить отзыв</p>
        {submitted ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Спасибо! Отзыв отправлен на модерацию и появится на сайте после проверки.
          </p>
        ) : (
          <form onSubmit={submitReview} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] tracking-[0.25em] uppercase text-muted">
                Ваше имя
              </span>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="input-luxe"
                placeholder="Анна"
                maxLength={80}
                required
              />
            </label>

            <div>
              <span className="mb-1.5 block text-[10px] tracking-[0.25em] uppercase text-muted">
                Оценка
              </span>
              <StarRating value={rating} interactive onChange={setRating} size={20} />
            </div>

            <label className="block">
              <span className="mb-1.5 block text-[10px] tracking-[0.25em] uppercase text-muted">
                Отзыв
              </span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="input-luxe min-h-28 resize-y"
                placeholder="Расскажите о вашем опыте…"
                maxLength={2000}
                required
              />
            </label>

            <button type="submit" disabled={submitting} className="btn-outline-gold disabled:opacity-50">
              {submitting ? "Отправка…" : "Отправить отзыв"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
