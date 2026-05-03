"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Lock, LogOut, Plus } from "lucide-react";
import { getPaintings, savePaintings } from "@/lib/local-storage";
import { Painting } from "@/types/painting";

const SESSION_KEY = "cartina.admin.ok";
const DEFAULT_PASSWORD = "art-admin-2026";

type FormState = {
  title: string;
  description: string;
  price: string;
  dimensions: string;
  technique: string;
  imageUrl: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  price: "",
  dimensions: "",
  technique: "",
  imageUrl: ""
};

export function AdminDashboard() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    const authed = sessionStorage.getItem(SESSION_KEY) === "1";
    setIsAuthed(authed);
    setPaintings(getPaintings());
  }, []);

  const soldCount = useMemo(() => paintings.filter((painting) => painting.sold).length, [paintings]);

  const updateAndPersist = (nextPaintings: Painting[]) => {
    setPaintings(nextPaintings);
    savePaintings(nextPaintings);
  };

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const securePassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
    if (password === securePassword) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setIsAuthed(true);
      setPassword("");
      return;
    }
    alert("Wrong password");
  };

  const onImageUpload = (file?: File) => {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, imageUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const submitPainting = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title || !form.price || !form.imageUrl || !form.dimensions || !form.technique) {
      alert("Please fill all required fields.");
      return;
    }

    const nextPainting: Painting = {
      id: crypto.randomUUID(),
      title: form.title,
      description: form.description,
      price: Number(form.price),
      dimensions: form.dimensions,
      technique: form.technique,
      imageUrl: form.imageUrl,
      sold: false
    };

    updateAndPersist([nextPainting, ...paintings]);
    setForm(emptyForm);
  };

  const toggleSold = (id: string) => {
    const next = paintings.map((painting) =>
      painting.id === id ? { ...painting, sold: !painting.sold } : painting
    );
    updateAndPersist(next);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthed(false);
  };

  if (!isAuthed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-6">
        <form onSubmit={submitLogin} className="w-full rounded-2xl border border-stone-300 bg-[#f1ebe0] p-8">
          <div className="mb-6 flex items-center gap-2 text-stone-700">
            <Lock size={18} />
            <h1 className="text-xl font-semibold">Admin Access</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-stone-400 bg-stone-50 px-4 py-3 text-sm outline-none ring-0 focus:border-stone-700"
            placeholder="Enter admin password"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-[#2e2c2a] px-4 py-3 text-sm font-medium text-stone-100 transition hover:bg-black"
          >
            Open dashboard
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Protected Area</p>
          <h1 className="text-3xl font-semibold text-stone-900">Gallery Admin</h1>
          <p className="mt-1 text-sm text-stone-600">
            {paintings.length} total paintings, {soldCount} marked as sold
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl border border-stone-400 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <form onSubmit={submitPainting} className="mb-10 rounded-2xl border border-stone-300 bg-[#f1ebe0] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} className="text-stone-700" />
          <h2 className="text-lg font-semibold text-stone-900">Add new painting</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            placeholder="Title *"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="rounded-xl border border-stone-400 bg-stone-50 px-4 py-2 text-sm"
          />
          <input
            placeholder="Price (RUB) *"
            type="number"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            className="rounded-xl border border-stone-400 bg-stone-50 px-4 py-2 text-sm"
          />
          <input
            placeholder="Dimensions *"
            value={form.dimensions}
            onChange={(event) => setForm((prev) => ({ ...prev, dimensions: event.target.value }))}
            className="rounded-xl border border-stone-400 bg-stone-50 px-4 py-2 text-sm"
          />
          <input
            placeholder="Technique *"
            value={form.technique}
            onChange={(event) => setForm((prev) => ({ ...prev, technique: event.target.value }))}
            className="rounded-xl border border-stone-400 bg-stone-50 px-4 py-2 text-sm"
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="rounded-xl border border-stone-400 bg-stone-50 px-4 py-2 text-sm md:col-span-2"
          />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-stone-700">Upload image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => onImageUpload(event.target.files?.[0])}
              className="w-full rounded-xl border border-stone-400 bg-stone-50 px-4 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 rounded-xl bg-[#2e2c2a] px-5 py-2 text-sm font-medium text-stone-100 transition hover:bg-black"
        >
          Save painting
        </button>
      </form>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paintings.map((painting) => (
          <article key={painting.id} className="rounded-2xl border border-stone-300 bg-[#f7f3ec] p-4">
            <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl bg-stone-200">
              <Image src={painting.imageUrl} alt={painting.title} fill className="object-cover" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900">{painting.title}</h3>
            <p className="text-sm text-stone-600">{painting.technique}</p>
            <p className="text-sm text-stone-500">{painting.dimensions}</p>
            <p className="mt-1 text-sm text-stone-700">{painting.price.toLocaleString()} RUB</p>
            <button
              onClick={() => toggleSold(painting.id)}
              className={`mt-3 w-full rounded-xl px-4 py-2 text-sm font-medium transition ${
                painting.sold
                  ? "border border-stone-400 text-stone-700 hover:bg-stone-100"
                  : "bg-[#2e2c2a] text-stone-100 hover:bg-black"
              }`}
            >
              {painting.sold ? "Mark as Available" : "Mark as Sold"}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
