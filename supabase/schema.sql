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

-- Members (신도 입교) — 8자리 신도 번호 (최대 99,999,999)
create sequence if not exists members_member_number_seq
  as integer
  start with 1
  increment by 1
  maxvalue 99999999
  no cycle;

create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  member_number integer not null unique,
  name text,
  declaration text,
  locale text not null default 'ko',
  joined_at timestamp with time zone not null,
  created_at timestamp with time zone default now() not null
);

-- 기존 테이블에 member_number 컬럼이 없다면 추가
alter table members add column if not exists member_number integer unique;

create or replace function assign_member_number()
returns trigger as $$
begin
  if NEW.member_number is null then
    NEW.member_number := nextval('members_member_number_seq');
  end if;
  if NEW.member_number > 99999999 then
    raise exception 'member_number limit exceeded';
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists members_assign_number on members;
create trigger members_assign_number
  before insert on members
  for each row
  execute function assign_member_number();

-- 기존 데이터가 있다면 시퀀스를 최댓값에 맞춤
select setval(
  'members_member_number_seq',
  greatest(coalesce((select max(member_number) from members), 0), 1)
);

alter table members enable row level security;

drop policy if exists "Anyone can read members" on members;
drop policy if exists "Anyone can insert members" on members;

create policy "Anyone can read members"
  on members for select
  using (true);

create policy "Anyone can insert members"
  on members for insert
  with check (true);
