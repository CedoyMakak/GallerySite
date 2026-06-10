"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Lock, LogOut, Plus, Trash2, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase-client";
import { Painting, paintingFromRow, PaintingRow } from "@/types/painting";
import {
  ArtistProfile,
  ArtistProfileRow,
  artistProfileFromRow,
  defaultArtistProfile,
} from "@/types/artist-profile";
import { Review, reviewFromRow, ReviewRow } from "@/types/review";
import { StarRating } from "@/components/star-rating";
import { formatReviewDate } from "@/lib/review-utils";

function safeFileName(name: string): string {
  return (name.trim() || "image").replace(/[^a-zA-Z0-9._-]/g, "_");
}

type PaintingFormState = {
  title: string;
  description: string;
  price: string;
  dimensions: string;
  technique: string;
};

type ProfileFormState = {
  name: string;
  bio: string;
  whatsapp: string;
  telegram: string;
};

const emptyPaintingForm: PaintingFormState = {
  title: "",
  description: "",
  price: "",
  dimensions: "",
  technique: "",
};

async function apiCall(url: string, method: string, body?: unknown): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error ?? "Неизвестная ошибка" };
  return { ok: true };
}

export function AdminDashboard() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [profile, setProfile] = useState<ArtistProfile>(defaultArtistProfile);
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [paintingForm, setPaintingForm] = useState<PaintingFormState>(emptyPaintingForm);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: defaultArtistProfile.name,
    bio: defaultArtistProfile.bio,
    whatsapp: defaultArtistProfile.whatsapp,
    telegram: defaultArtistProfile.telegram,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const loadPaintings = useCallback(async () => {
    try {
      const { data, error } = await getSupabase()
        .from("paintings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPaintings((data as PaintingRow[]).map(paintingFromRow));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось загрузить картины");
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const { data, error } = await getSupabase()
        .from("artist_profile")
        .select("*")
        .eq("id", "main")
        .maybeSingle();
      if (error) throw error;
      const next = data ? artistProfileFromRow(data as ArtistProfileRow) : defaultArtistProfile;
      setProfile(next);
      setProfileForm({ name: next.name, bio: next.bio, whatsapp: next.whatsapp, telegram: next.telegram });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось загрузить профиль");
    }
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      const { data, error } = await getSupabase()
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReviews((data as ReviewRow[]).map(reviewFromRow));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось загрузить отзывы");
    }
  }, []);

  // Check session on mount via API route (server-side cookie)
  useEffect(() => {
    fetch("/api/admin/verify")
      .then((r) => r.json())
      .then((d) => {
        setIsAuthed(d.authenticated === true);
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    void loadPaintings();
    void loadProfile();
    void loadReviews();
  }, [isAuthed, loadPaintings, loadProfile, loadReviews]);

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);
  useEffect(() => () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); }, [avatarPreview]);

  const soldCount = useMemo(() => paintings.filter((p) => p.sold).length, [paintings]);
  const pendingReviews = useMemo(() => reviews.filter((r) => r.status === "pending"), [reviews]);

  const approveReview = async (id: string) => {
    const { ok, error } = await apiCall(`/api/admin/reviews/${id}`, "PATCH");
    if (!ok) { alert(error); return; }
    await loadReviews();
  };

  const rejectReview = async (id: string) => {
    if (!confirm("Отклонить и удалить этот отзыв?")) return;
    const { ok, error } = await apiCall(`/api/admin/reviews/${id}`, "DELETE");
    if (!ok) { alert(error); return; }
    await loadReviews();
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error ?? "Неверный пароль"); return; }
    setIsAuthed(true);
    setPassword("");
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthed(false);
  };

  const onImageUpload = (file?: File) => {
    if (!file) return;
    setImagePreview((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
    setImageFile(file);
  };

  const onAvatarUpload = (file?: File) => {
    if (!file) return;
    setAvatarPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
    setAvatarFile(file);
  };

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileForm.name.trim() || !profileForm.bio.trim()) {
      alert("Заполните имя и биографию художника.");
      return;
    }

    try {
      let avatarUrl = profile.avatarUrl;
      const oldAvatarUrl = avatarFile ? profile.avatarUrl : undefined;

      if (avatarFile) {
        const path = `profile/${crypto.randomUUID()}-${safeFileName(avatarFile.name)}`;
        const { error } = await getSupabase().storage.from("paintings").upload(path, avatarFile, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) throw error;
        avatarUrl = getSupabase().storage.from("paintings").getPublicUrl(path).data.publicUrl;
      }

      const { ok, error } = await apiCall("/api/admin/profile", "PATCH", {
        name: profileForm.name.trim(),
        bio: profileForm.bio.trim(),
        whatsapp: profileForm.whatsapp.trim(),
        telegram: profileForm.telegram.trim(),
        avatarUrl,
        oldAvatarUrl,
      });
      if (!ok) throw new Error(error);

      setAvatarFile(null);
      setAvatarPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
      await loadProfile();
      alert("Профиль сохранён.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось сохранить профиль");
    }
  };

  const submitPainting = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { title, price, dimensions, technique } = paintingForm;
    if (!title || !price || !dimensions || !technique) {
      alert("Заполните все обязательные поля.");
      return;
    }
    if (!imageFile) {
      alert("Загрузите изображение.");
      return;
    }

    try {
      const path = `${crypto.randomUUID()}-${safeFileName(imageFile.name)}`;
      const { error: uploadError } = await getSupabase().storage.from("paintings").upload(path, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const imageUrl = getSupabase().storage.from("paintings").getPublicUrl(path).data.publicUrl;

      const { ok, error } = await apiCall("/api/admin/paintings", "POST", {
        title,
        description: paintingForm.description,
        price,
        dimensions,
        technique,
        imageUrl,
      });
      if (!ok) throw new Error(error);

      setPaintingForm(emptyPaintingForm);
      setImageFile(null);
      setImagePreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
      await loadPaintings();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось добавить картину");
    }
  };

  const toggleSold = async (id: string) => {
    const painting = paintings.find((p) => p.id === id);
    if (!painting) return;
    const { ok, error } = await apiCall(`/api/admin/paintings/${id}`, "PATCH", { sold: !painting.sold });
    if (!ok) { alert(error); return; }
    setPaintings((prev) => prev.map((p) => (p.id === id ? { ...p, sold: !p.sold } : p)));
  };

  const handleDelete = async (painting: Painting) => {
    if (!confirm(`Удалить «${painting.title}»? Это действие нельзя отменить.`)) return;
    const { ok, error } = await apiCall(`/api/admin/paintings/${painting.id}`, "DELETE", {
      imageUrl: painting.imageUrl,
    });
    if (!ok) { alert(error); return; }
    setPaintings((prev) => prev.filter((p) => p.id !== painting.id));
  };

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Загрузка…</p>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm items-center px-6">
        <form onSubmit={submitLogin} className="w-full border border-line bg-paper p-8">
          <div className="mb-6 flex items-center gap-2 text-ink">
            <Lock size={18} />
            <h1 className="font-display text-2xl">Панель управления</h1>
          </div>
          <p className="mb-5 text-[10px] tracking-[0.2em] uppercase text-muted">CARTINA · Admin</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-luxe"
            placeholder="Пароль"
            autoFocus
          />
          <button type="submit" className="btn-solid-ink mt-4 w-full">
            Войти
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Заголовок */}
      <div className="mb-10 flex items-center justify-between border-b border-line pb-6">
        <div>
          <p className="eyebrow text-[9px]">CARTINA · Admin</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Панель управления</h1>
          <p className="mt-1 text-sm text-muted">
            {paintings.length} картин · {soldCount} продано
            {pendingReviews.length > 0 && (
              <span className="ml-3 font-medium text-amber-700">
                · {pendingReviews.length} отзыв{pendingReviews.length === 1 ? "" : pendingReviews.length < 5 ? "а" : "ов"} на модерации
              </span>
            )}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 border border-line px-4 py-2 text-sm text-muted transition hover:border-ink hover:text-ink"
        >
          <LogOut size={15} />
          Выйти
        </button>
      </div>

      {/* Отзывы на модерации */}
      {pendingReviews.length > 0 && (
        <section className="mb-10 border border-amber-200 bg-amber-50 p-6">
          <h2 className="mb-4 font-display text-xl text-ink">
            Отзывы на модерации ({pendingReviews.length})
          </h2>
          <ul className="space-y-4">
            {pendingReviews.map((review) => (
              <li key={review.id} className="border border-line bg-paper p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">{review.authorName}</p>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted">
                      {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => approveReview(review.id)}
                      className="flex items-center gap-1.5 bg-ink px-3 py-1.5 text-xs text-gold-light transition hover:opacity-80"
                    >
                      <Check size={13} />
                      Одобрить
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectReview(review.id)}
                      className="flex items-center gap-1.5 border border-red-300 bg-red-50 px-3 py-1.5 text-xs text-red-800 transition hover:bg-red-100"
                    >
                      <X size={13} />
                      Отклонить
                    </button>
                  </div>
                </div>
                {review.rating ? (
                  <div className="mt-2">
                    <StarRating value={review.rating} size={13} />
                  </div>
                ) : null}
                <p className="mt-3 text-sm text-ink-soft">{review.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Профиль художника */}
      <form onSubmit={submitProfile} className="mb-10 border border-line bg-paper p-6">
        <h2 className="mb-5 font-display text-xl text-ink">Профиль художника</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            placeholder="Имя художника *"
            value={profileForm.name}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
            className="input-luxe md:col-span-2"
          />
          <textarea
            placeholder="Биография *"
            value={profileForm.bio}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
            className="input-luxe min-h-24 resize-y md:col-span-2"
          />
          <input
            placeholder="WhatsApp (номер с кодом страны, например 79001234567)"
            value={profileForm.whatsapp}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
            className="input-luxe"
          />
          <input
            placeholder="Telegram (username, например @myusername)"
            value={profileForm.telegram}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, telegram: e.target.value }))}
            className="input-luxe"
          />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[10px] tracking-[0.25em] uppercase text-muted">
              Фото художника
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onAvatarUpload(e.target.files?.[0])}
              className="input-luxe"
            />
            {(avatarPreview || profile.avatarUrl) ? (
              <div className="mt-3 h-20 w-20 overflow-hidden rounded-full border border-line bg-cream-dark">
                <Image
                  src={avatarPreview ?? profile.avatarUrl}
                  alt="Превью аватара"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  unoptimized={Boolean(avatarPreview)}
                />
              </div>
            ) : null}
          </div>
        </div>
        <button type="submit" className="btn-solid-ink mt-4">
          Сохранить профиль
        </button>
      </form>

      {/* Добавить картину */}
      <form onSubmit={submitPainting} className="mb-10 border border-line bg-paper p-6">
        <div className="mb-5 flex items-center gap-2">
          <Plus size={16} className="text-muted" />
          <h2 className="font-display text-xl text-ink">Добавить картину</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            placeholder="Название *"
            value={paintingForm.title}
            onChange={(e) => setPaintingForm((prev) => ({ ...prev, title: e.target.value }))}
            className="input-luxe"
          />
          <input
            placeholder="Цена (₽) *"
            type="number"
            value={paintingForm.price}
            onChange={(e) => setPaintingForm((prev) => ({ ...prev, price: e.target.value }))}
            className="input-luxe"
          />
          <input
            placeholder="Размер * (например 50 x 70 cm)"
            value={paintingForm.dimensions}
            onChange={(e) => setPaintingForm((prev) => ({ ...prev, dimensions: e.target.value }))}
            className="input-luxe"
          />
          <input
            placeholder="Техника * (например Масло на холсте)"
            value={paintingForm.technique}
            onChange={(e) => setPaintingForm((prev) => ({ ...prev, technique: e.target.value }))}
            className="input-luxe"
          />
          <input
            placeholder="Описание"
            value={paintingForm.description}
            onChange={(e) => setPaintingForm((prev) => ({ ...prev, description: e.target.value }))}
            className="input-luxe md:col-span-2"
          />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[10px] tracking-[0.25em] uppercase text-muted">
              Фотография *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onImageUpload(e.target.files?.[0])}
              className="input-luxe"
            />
            {imagePreview ? (
              <div className="relative mt-3 aspect-[3/4] max-h-48 overflow-hidden bg-cream-dark">
                <Image src={imagePreview} alt="Превью" fill className="object-cover" unoptimized />
              </div>
            ) : null}
          </div>
        </div>
        <button type="submit" className="btn-solid-ink mt-4">
          Сохранить картину
        </button>
      </form>

      {/* Список всех отзывов */}
      {reviews.length > 0 && (
        <section className="mb-10 border border-line bg-paper p-6">
          <h2 className="mb-5 font-display text-xl text-ink">
            Все отзывы ({reviews.length})
          </h2>
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="border border-line p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">{review.authorName}</p>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted">
                      {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] tracking-[0.15em] uppercase ${
                      review.status === "pending"
                        ? "text-amber-700"
                        : review.status === "approved"
                          ? "text-green-700"
                          : "text-muted"
                    }`}
                  >
                    {review.status === "pending"
                      ? "На модерации"
                      : review.status === "approved"
                        ? "Опубликован"
                        : "Отклонён"}
                  </span>
                </div>
                {review.rating ? (
                  <div className="mt-2">
                    <StarRating value={review.rating} size={12} />
                  </div>
                ) : null}
                <p className="mt-2 text-sm text-ink-soft">{review.text}</p>
                {review.status === "pending" ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => approveReview(review.id)}
                      className="flex items-center gap-1.5 bg-ink px-3 py-1.5 text-xs text-gold-light transition hover:opacity-80"
                    >
                      <Check size={13} />
                      Одобрить
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectReview(review.id)}
                      className="flex items-center gap-1.5 border border-red-300 bg-red-50 px-3 py-1.5 text-xs text-red-800 transition hover:bg-red-100"
                    >
                      <X size={13} />
                      Отклонить
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Каталог картин */}
      <section>
        <h2 className="mb-6 font-display text-xl text-ink">Каталог ({paintings.length})</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paintings.map((painting) => (
            <article key={painting.id} className="border border-line bg-paper p-4">
              <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-cream-dark">
                <Image src={painting.imageUrl} alt={painting.title} fill className="object-cover" />
                {painting.sold ? (
                  <span className="badge-sold absolute right-2 top-2">Продано</span>
                ) : null}
              </div>
              <h3 className="font-display text-lg text-ink">{painting.title}</h3>
              <p className="mt-1 text-[10px] tracking-[0.2em] uppercase text-muted">
                {painting.technique} · {painting.dimensions}
              </p>
              <p className="mt-1 text-sm text-muted">{painting.price.toLocaleString("ru-RU")} ₽</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleSold(painting.id)}
                  className={`flex-1 px-3 py-2 text-xs transition ${
                    painting.sold
                      ? "border border-line text-muted hover:border-ink hover:text-ink"
                      : "btn-solid-ink"
                  }`}
                >
                  {painting.sold ? "Снять отметку" : "Пометить продано"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(painting)}
                  className="flex shrink-0 items-center justify-center border border-red-200 bg-red-50 px-3 text-red-700 transition hover:bg-red-100"
                  aria-label="Удалить картину"
                  title="Удалить"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
