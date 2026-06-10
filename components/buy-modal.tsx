"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { Painting } from "@/types/painting";
import { ArtistProfile } from "@/types/artist-profile";

type BuyModalProps = {
  painting: Painting | null;
  profile: ArtistProfile;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export function BuyModal({
  painting,
  profile,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: BuyModalProps) {
  if (!painting) return null;

  const message = `Здравствуйте! Хочу приобрести картину «${painting.title}» (${painting.technique}, ${painting.dimensions}) за ${painting.price.toLocaleString("ru-RU")} ₽.`;

  const whatsappNumber = profile.whatsapp.replace(/\D/g, "");
  const telegramUsername = profile.telegram.replace(/^@/, "");

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    : null;
  const telegramHref = telegramUsername
    ? `https://t.me/${telegramUsername}?text=${encodeURIComponent(message)}`
    : null;

  const hasContacts = whatsappHref || telegramHref;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md border border-line bg-paper shadow-2xl">
        {/* Шапка */}
        <div className="flex items-start justify-between gap-3 border-b border-line px-6 pt-5 pb-4">
          <div>
            <p className="eyebrow text-[9px]">Запрос на покупку</p>
            <h2 className="mt-2 font-display text-2xl text-ink">{painting.title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2 pt-1">
            {onToggleFavorite ? (
              <FavoriteButton active={isFavorite} onToggle={onToggleFavorite} />
            ) : null}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center border border-line text-muted transition hover:border-ink hover:text-ink"
              aria-label="Закрыть"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Детали */}
        <div className="px-6 pt-4 pb-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted">
            {painting.technique} · {painting.dimensions}
          </p>
          <p className="mt-3 font-display text-2xl text-ink">
            {painting.price.toLocaleString("ru-RU")} ₽
          </p>
          {painting.description ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">{painting.description}</p>
          ) : null}
        </div>

        {/* Кнопки связи */}
        <div className="space-y-2 border-t border-line px-6 pt-4 pb-6">
          {hasContacts ? (
            <>
              <p className="mb-3 text-[10px] tracking-[0.2em] uppercase text-muted">
                Связаться с художником
              </p>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-solid-ink flex w-full justify-center gap-2"
                >
                  <MessageCircle size={15} />
                  Написать в WhatsApp
                </a>
              ) : null}
              {telegramHref ? (
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline-gold flex w-full justify-center gap-2"
                >
                  <Send size={15} />
                  Написать в Telegram
                </a>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted">
              Контактная информация не указана. Добавьте WhatsApp или Telegram в настройках профиля.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
