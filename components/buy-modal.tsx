"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { Painting } from "@/types/painting";

type BuyModalProps = {
  painting: Painting | null;
  onClose: () => void;
};

export function BuyModal({ painting, onClose }: BuyModalProps) {
  if (!painting) {
    return null;
  }

  const message = `Hello! I would like to buy "${painting.title}" (${painting.technique}, ${painting.dimensions}) for ${painting.price} RUB.`;
  const whatsappLink = `https://wa.me/00000000000?text=${encodeURIComponent(message)}`;
  const telegramLink = `https://t.me/your_username?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-stone-300 bg-[#f7f3ec] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Purchase Request</p>
            <h2 className="text-2xl font-semibold text-stone-900">{painting.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-stone-300 p-2 text-stone-600 transition hover:bg-stone-900 hover:text-stone-100"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mb-2 text-sm text-stone-700">{painting.technique}</p>
        <p className="mb-1 text-sm text-stone-500">Dimensions: {painting.dimensions}</p>
        <p className="mb-6 text-lg font-semibold text-stone-900">{painting.price.toLocaleString()} RUB</p>

        <div className="space-y-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2e2c2a] px-4 py-3 text-sm font-medium text-stone-100 transition hover:bg-black"
          >
            <MessageCircle size={16} />
            Contact via WhatsApp
          </a>
          <a
            href={telegramLink}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-400 px-4 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-100"
          >
            <Send size={16} />
            Contact via Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
