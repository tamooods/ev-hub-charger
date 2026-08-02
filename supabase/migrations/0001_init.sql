-- EV Hub Charger schema

create extension if not exists pgcrypto;

create table if not exists public.stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lat double precision not null,
  lng double precision not null,
  kw numeric,
  amp numeric,
  slots integer,
  region text check (region in ('central','isan','north','east','south')),
  brand text,
  source text not null default 'user' check (source in ('clubcharge','user')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_by text,
  created_at timestamptz not null default now(),
  constraint stations_name_key unique (name)
);

create index if not exists stations_status_idx on public.stations (status);
create index if not exists stations_region_idx on public.stations (region);
create index if not exists stations_brand_idx on public.stations (brand);

alter table public.stations enable row level security;

create policy "allow_public_read_approved" on public.stations
  for select using (status = 'approved');

create policy "allow_public_insert" on public.stations
  for insert with check (true);

create policy "allow_service_role_all" on public.stations
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
