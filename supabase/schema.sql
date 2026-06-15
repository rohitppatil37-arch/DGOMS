-- ── DGOMS Supabase Schema ─────────────────────────────────────────────
-- Run this entire file in Supabase Dashboard → SQL Editor → New query

-- ── DAMS ──────────────────────────────────────────────────────────────
create table public.dams (
  id           uuid primary key default gen_random_uuid(),
  name_en      text not null,
  name_mr      text not null,
  river_en     text,
  river_mr     text,
  district     text not null,
  division     text,
  frl          numeric,
  mwl          numeric,
  gates        integer default 0,
  gate_type_en text,
  gate_type_mr text,
  capacity     numeric,
  catchment    text,
  water_level  numeric,
  storage      numeric,
  rainfall     numeric,
  avg_rainfall numeric,
  dept         text,
  sub_division text,
  sill_level   numeric,
  gate_types   jsonb default '[]'::jsonb,
  civil_div    text,
  civil_sub    text,
  mech_div     text,
  mech_sub     text,
  elec_div     text,
  elec_sub     text,
  status       text not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid
);

-- ── DAM CONTACTS ──────────────────────────────────────────────────────
create table public.dam_contacts (
  id         uuid primary key default gen_random_uuid(),
  dam_id     uuid not null references public.dams(id) on delete cascade,
  name       text not null,
  desig      text,
  mobile     text,
  sort_order integer not null default 0
);

-- ── OFFICERS ──────────────────────────────────────────────────────────
create table public.officers (
  id         uuid primary key default gen_random_uuid(),
  name_en    text not null,
  name_mr    text not null,
  email      text not null unique,
  mobile     text,
  role       text not null default 'field',
  dept       text not null default 'civil',
  district   text,
  division   text,
  status     text not null default 'active',
  created_at timestamptz not null default now()
);

-- ── COMMANDS ──────────────────────────────────────────────────────────
create table public.commands (
  id           uuid primary key default gen_random_uuid(),
  dam_id       uuid references public.dams(id),
  type         text not null,
  details      text,
  status       text not null default 'issued',
  issued_by    uuid references public.officers(id),
  accepted_by  uuid references public.officers(id),
  executed_by  uuid references public.officers(id),
  issued_at    timestamptz not null default now(),
  accepted_at  timestamptz,
  executed_at  timestamptz
);

-- ── ALERTS ────────────────────────────────────────────────────────────
create table public.alerts (
  id         uuid primary key default gen_random_uuid(),
  dam_id     uuid references public.dams(id),
  issued_by  uuid references public.officers(id),
  message    text not null,
  type       text not null default 'emergency',
  issued_at  timestamptz not null default now()
);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger dams_updated_at
  before update on public.dams
  for each row execute procedure public.set_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────
alter table public.dams         enable row level security;
alter table public.dam_contacts enable row level security;
alter table public.officers     enable row level security;
alter table public.commands     enable row level security;
alter table public.alerts       enable row level security;

-- Dams: anyone can read, only authenticated officers can write
create policy "dams_select"  on public.dams for select using (true);
create policy "dams_insert"  on public.dams for insert with check (auth.role() = 'authenticated');
create policy "dams_update"  on public.dams for update using (auth.role() = 'authenticated');
create policy "dams_delete"  on public.dams for delete using (auth.role() = 'authenticated');

-- Dam contacts: anyone can read, authenticated write
create policy "contacts_select" on public.dam_contacts for select using (true);
create policy "contacts_insert" on public.dam_contacts for insert with check (auth.role() = 'authenticated');
create policy "contacts_update" on public.dam_contacts for update using (auth.role() = 'authenticated');
create policy "contacts_delete" on public.dam_contacts for delete using (auth.role() = 'authenticated');

-- Officers: anyone can read, authenticated write
create policy "officers_select" on public.officers for select using (true);
create policy "officers_insert" on public.officers for insert with check (auth.role() = 'authenticated');
create policy "officers_update" on public.officers for update using (auth.role() = 'authenticated');
create policy "officers_delete" on public.officers for delete using (auth.role() = 'authenticated');

-- Commands: authenticated only
create policy "commands_select" on public.commands for select using (auth.role() = 'authenticated');
create policy "commands_insert" on public.commands for insert with check (auth.role() = 'authenticated');
create policy "commands_update" on public.commands for update using (auth.role() = 'authenticated');

-- Alerts: authenticated only
create policy "alerts_select" on public.alerts for select using (auth.role() = 'authenticated');
create policy "alerts_insert" on public.alerts for insert with check (auth.role() = 'authenticated');
