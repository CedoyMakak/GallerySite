-- Run in Supabase SQL Editor

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  text text not null,
  rating smallint check (rating >= 1 and rating <= 5),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_status_created_idx on reviews (status, created_at desc);

alter table reviews enable row level security;

drop policy if exists "reviews_select" on reviews;
drop policy if exists "reviews_insert" on reviews;
drop policy if exists "reviews_update" on reviews;
drop policy if exists "reviews_delete" on reviews;

create policy "reviews_select" on reviews for select using (true);
create policy "reviews_insert" on reviews for insert with check (status = 'pending');
create policy "reviews_update" on reviews for update using (true);
create policy "reviews_delete" on reviews for delete using (true);
