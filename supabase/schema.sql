-- Supabase SQL Editor에서 실행
create table if not exists testimonies (
  id uuid default gen_random_uuid() primary key,
  nickname text not null,
  content text not null,
  waves integer default 0 not null,
  created_at timestamp with time zone default now() not null
);

alter table testimonies enable row level security;

drop policy if exists "Anyone can read testimonies" on testimonies;
drop policy if exists "Anyone can insert testimonies" on testimonies;
drop policy if exists "Anyone can update waves" on testimonies;

create policy "Anyone can read testimonies"
  on testimonies for select
  using (true);

create policy "Anyone can insert testimonies"
  on testimonies for insert
  with check (true);

create policy "Anyone can update waves"
  on testimonies for update
  using (true)
  with check (true);

-- Weekly Wave (파동 송신자)
create table if not exists weekly_waves (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  published_at timestamp with time zone not null,
  title_ko text not null,
  content_ko text not null,
  title_en text not null,
  content_en text not null,
  title_ja text not null,
  content_ja text not null,
  waves integer default 0 not null,
  created_at timestamp with time zone default now() not null
);

alter table weekly_waves enable row level security;

drop policy if exists "Anyone can read weekly_waves" on weekly_waves;
drop policy if exists "Anyone can update weekly_wave waves" on weekly_waves;

create policy "Anyone can read weekly_waves"
  on weekly_waves for select
  using (true);

create policy "Anyone can update weekly_wave waves"
  on weekly_waves for update
  using (true)
  with check (true);
