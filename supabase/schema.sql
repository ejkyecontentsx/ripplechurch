-- Supabase 테이블 생성 (SQL Editor에서 실행)
create table testimonies (
  id uuid default gen_random_uuid() primary key,
  nickname text not null,
  content text not null,
  waves integer default 0,
  created_at timestamp with time zone default now()
);

-- RLS 활성화
alter table testimonies enable row level security;

-- 읽기: 전체 허용
create policy "Anyone can read testimonies"
  on testimonies for select
  using (true);

-- 쓰기: anon 허용
create policy "Anyone can insert testimonies"
  on testimonies for insert
  with check (true);

-- 업데이트: anon 허용 (waves +1)
create policy "Anyone can update waves"
  on testimonies for update
  using (true);
