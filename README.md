# Cartina Gallery (Next.js)

Luxury-style single-artist gallery website built with Next.js, Tailwind CSS, and Lucide icons.

## What is implemented now

- Public gallery grid with painting cards.
- Card details: image, title, dimensions, technique, price.
- Buy flow: modal with WhatsApp/Telegram contact links.
- Secret admin route: `/admin`.
- Basic password protection on admin route (client-side session).
- Admin can upload paintings (image file supported) and mark paintings as Sold.
- Mock database using `localStorage`.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Run app:

```bash
npm run dev
```

## Current architecture (mock storage)

- `app/page.tsx`: public gallery page.
- `app/admin/page.tsx`: admin dashboard.
- `components/gallery-page.tsx`: gallery UI and cards.
- `components/buy-modal.tsx`: purchase/contact modal.
- `components/admin-dashboard.tsx`: admin auth + CRUD-like controls.
- `lib/local-storage.ts`: local persistence layer.
- `lib/mock-data.ts`: initial seed data.

## Upgrade to Supabase (next step)

### 1) Create Supabase project

- Go to [Supabase](https://supabase.com/), create a new project.
- Get `Project URL` and `anon public key`.
- Put them in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 2) Create paintings table

Run this SQL in Supabase SQL editor:

```sql
create table if not exists paintings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  price numeric not null,
  dimensions text not null,
  technique text not null,
  image_url text not null,
  sold boolean default false,
  created_at timestamp with time zone default now()
);
```

### 3) Configure storage bucket

- Create a public bucket named `paintings`.
- Upload painting files to this bucket from admin dashboard (next integration step).

### 4) Add Supabase client

Install:

```bash
npm install @supabase/supabase-js
```

Create `lib/supabase-client.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 5) Replace localStorage calls

- Replace `getPaintings()` with `supabase.from("paintings").select("*")`.
- Replace create action with `insert`.
- Replace sold toggle with `update({ sold: true/false })`.
- Replace base64 image storage with upload to bucket and save `publicUrl` in `image_url`.

### 6) Secure admin actions

For production, replace the simple password flow with Supabase Auth (email/password) and Row Level Security policies:

- Public users: read-only access to paintings.
- Authenticated admin: insert/update paintings.
