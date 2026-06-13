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
