-- =======================================================
-- CARTINA — полная настройка базы данных Supabase
-- Запустить один раз в SQL Editor вашего Supabase-проекта
-- =======================================================

-- -------------------------------------------------------
-- 1. Таблица картин
-- -------------------------------------------------------
create table if not exists paintings (
  id          uuid        primary key,
  title       text        not null,
  description text,
  price       integer     not null,
  dimensions  text        not null,
  technique   text        not null,
  image_url   text        not null,
  sold        boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table paintings enable row level security;

drop policy if exists "paintings_select" on paintings;
create policy "paintings_select" on paintings
  for select using (true);
-- INSERT / UPDATE / DELETE только через service_role (API-роуты /api/admin/paintings)

-- -------------------------------------------------------
-- 2. Профиль художника
-- -------------------------------------------------------
create table if not exists artist_profile (
  id        text primary key,
  name      text,
  bio       text,
  avatar_url text,
  whatsapp  text,
  telegram  text
);

alter table artist_profile enable row level security;

drop policy if exists "profile_select" on artist_profile;
create policy "profile_select" on artist_profile
  for select using (true);
-- INSERT / UPDATE только через service_role (API-роут /api/admin/profile)

-- -------------------------------------------------------
-- 3. Отзывы
-- -------------------------------------------------------
create table if not exists reviews (
  id          uuid        primary key default gen_random_uuid(),
  author_name text        not null,
  text        text        not null,
  rating      smallint    check (rating >= 1 and rating <= 5),
  status      text        not null default 'pending'
                          check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);

create index if not exists reviews_status_created_idx on reviews (status, created_at desc);

alter table reviews enable row level security;

drop policy if exists "reviews_select"         on reviews;
drop policy if exists "reviews_insert"         on reviews;
drop policy if exists "reviews_update"         on reviews;  -- было небезопасно
drop policy if exists "reviews_delete"         on reviews;  -- было небезопасно
drop policy if exists "reviews_public_select"  on reviews;
drop policy if exists "reviews_public_insert"  on reviews;

-- Все могут читать одобренные отзывы; администратор видит всё через service_role
create policy "reviews_public_select" on reviews
  for select using (status = 'approved');

-- Пользователи могут добавлять только отзывы со статусом 'pending'
create policy "reviews_public_insert" on reviews
  for insert with check (status = 'pending');

-- UPDATE и DELETE — только через service_role (API-роуты /api/admin/reviews)
-- (никаких политик для anon = запрет)

-- -------------------------------------------------------
-- 3а. Миграция для уже существующих баз (добавить контакты)
-- Безопасно запускать повторно на новой базе тоже
-- -------------------------------------------------------
alter table artist_profile add column if not exists whatsapp text;
alter table artist_profile add column if not exists telegram text;

-- -------------------------------------------------------
-- 4. Хранилище (Storage)
-- Выполните в разделе Storage вашего Supabase-проекта:
-- -------------------------------------------------------
-- 4.1 Создайте bucket "paintings" (Public bucket)
-- 4.2 Добавьте политику хранилища для uploads из браузера:
--     Название: "allow_anon_insert"
--     Operation: INSERT
--     Role: anon
--     Policy: true
-- Удаление файлов из хранилища выполняется только через service_role (API-роуты)
-- -------------------------------------------------------
