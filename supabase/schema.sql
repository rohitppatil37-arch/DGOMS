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
  id               uuid primary key default gen_random_uuid(),
  dam_id           uuid references public.dams(id),
  gate             text,
  type             text not null,
  value            text,
  details          text,
  status           text not null default 'pending',
  issued_by        uuid references public.officers(id),
  accepted_by      uuid references public.officers(id),
  executed_by      uuid references public.officers(id),
  issued_at        timestamptz not null default now(),
  accepted_at      timestamptz,
  executed_at      timestamptz,
  actual_value     text,
  officers_present text,
  gps_location     text,
  remarks          text
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

-- ── AUDIT LOG ─────────────────────────────────────────────────────────
-- Immutable trail of sensitive actions (login, officer/dam writes, command
-- lifecycle, alerts). No update/delete policies below — once RLS is enabled,
-- the absence of a policy denies the operation, so rows can't be altered.
create table public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  action     text not null,
  actor_id   uuid references public.officers(id),
  details    text,
  created_at timestamptz not null default now()
);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger dams_updated_at
  before update on public.dams
  for each row execute procedure public.set_updated_at();

-- ── ROLE HELPERS ──────────────────────────────────────────────────────
-- security definer so these can read public.officers regardless of the
-- caller's own RLS visibility, avoiding recursive-policy evaluation.
-- Officers have no auth_user_id column, so the link to the Supabase Auth
-- session is via email (officers.email is unique and is also the login id).
create or replace function public.current_officer_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select role from public.officers where email = auth.email() and status = 'active' limit 1;
$$;

create or replace function public.current_officer_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select id from public.officers where email = auth.email() and status = 'active' limit 1;
$$;

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────
alter table public.dams         enable row level security;
alter table public.dam_contacts enable row level security;
alter table public.officers     enable row level security;
alter table public.commands     enable row level security;
alter table public.alerts       enable row level security;
alter table public.audit_log    enable row level security;

-- Dams: anyone can read (public Dam Info page), only authenticated officers can write
create policy "dams_select"  on public.dams for select using (true);
create policy "dams_insert"  on public.dams for insert with check (auth.role() = 'authenticated');
create policy "dams_update"  on public.dams for update using (auth.role() = 'authenticated');
create policy "dams_delete"  on public.dams for delete using (auth.role() = 'authenticated');

-- Dam contacts: anyone can read, authenticated write
create policy "contacts_select" on public.dam_contacts for select using (true);
create policy "contacts_insert" on public.dam_contacts for insert with check (auth.role() = 'authenticated');
create policy "contacts_update" on public.dam_contacts for update using (auth.role() = 'authenticated');
create policy "contacts_delete" on public.dam_contacts for delete using (auth.role() = 'authenticated');

-- Officers: only authenticated users can read (contains email/mobile PII —
-- not public); only superadmin can write.
create policy "officers_select" on public.officers for select using (auth.role() = 'authenticated');
create policy "officers_insert" on public.officers for insert with check (current_officer_role() = 'superadmin');
create policy "officers_update" on public.officers for update using (auth.role() = 'authenticated') with check (current_officer_role() = 'superadmin');
create policy "officers_delete" on public.officers for delete using (current_officer_role() = 'superadmin');

-- Commands: read requires login; writes are role- and self-attribution-gated.
create policy "commands_select" on public.commands for select using (auth.role() = 'authenticated');
create policy "commands_insert" on public.commands for insert
  with check (current_officer_role() in ('division', 'superadmin') and issued_by = current_officer_id());
create policy "commands_accept" on public.commands for update
  using      (status = 'pending'  and current_officer_role() in ('subdivision', 'superadmin'))
  with check (status = 'accepted' and accepted_by = current_officer_id());
create policy "commands_execute" on public.commands for update
  using      (status = 'accepted' and current_officer_role() in ('field', 'superadmin'))
  with check (status = 'executed' and executed_by = current_officer_id());

-- Alerts: read requires login; only Division/Super Admin may broadcast.
create policy "alerts_select" on public.alerts for select using (auth.role() = 'authenticated');
create policy "alerts_insert" on public.alerts for insert
  with check (current_officer_role() in ('division', 'superadmin') and issued_by = current_officer_id());

-- Audit log: only Super Admin may read; any authenticated officer may append
-- a self-attributed entry. No update/delete policy exists for this table —
-- once written, an entry is permanent.
create policy "audit_log_select" on public.audit_log for select using (current_officer_role() = 'superadmin');
create policy "audit_log_insert" on public.audit_log for insert
  with check (auth.role() = 'authenticated' and actor_id = current_officer_id());

-- ── REALTIME ──────────────────────────────────────────────────────────
-- dams is already in supabase_realtime (enabled via Dashboard → Database → Replication)
alter publication supabase_realtime add table public.officers;
alter publication supabase_realtime add table public.commands;
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.audit_log;

-- ── MIGRATION (run once against the already-deployed DB) ────────────────
-- alter table public.commands add column gate text;
-- alter table public.commands add column value text;
-- alter table public.commands alter column status set default 'pending';
-- alter publication supabase_realtime add table public.alerts;

-- ── SECURITY FIX MIGRATION (run once against the already-deployed DB) ───
-- Closes: (1) any authenticated user could self-promote to superadmin or
-- write commands/alerts regardless of role, since RLS only checked
-- auth.role()='authenticated', never officers.role; (2) officers.email/
-- mobile (PII) were world-readable since officers_select had no auth check.
create or replace function public.current_officer_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select role from public.officers where email = auth.email() and status = 'active' limit 1;
$$;

create or replace function public.current_officer_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select id from public.officers where email = auth.email() and status = 'active' limit 1;
$$;

drop policy if exists "officers_select" on public.officers;
create policy "officers_select" on public.officers for select using (auth.role() = 'authenticated');

drop policy if exists "officers_insert" on public.officers;
create policy "officers_insert" on public.officers for insert with check (current_officer_role() = 'superadmin');

drop policy if exists "officers_update" on public.officers;
create policy "officers_update" on public.officers for update using (auth.role() = 'authenticated') with check (current_officer_role() = 'superadmin');

drop policy if exists "officers_delete" on public.officers;
create policy "officers_delete" on public.officers for delete using (current_officer_role() = 'superadmin');

drop policy if exists "commands_insert" on public.commands;
create policy "commands_insert" on public.commands for insert
  with check (current_officer_role() in ('division', 'superadmin') and issued_by = current_officer_id());

drop policy if exists "commands_update" on public.commands;
drop policy if exists "commands_accept" on public.commands;
create policy "commands_accept" on public.commands for update
  using      (status = 'pending'  and current_officer_role() in ('subdivision', 'superadmin'))
  with check (status = 'accepted' and accepted_by = current_officer_id());

drop policy if exists "commands_execute" on public.commands;
create policy "commands_execute" on public.commands for update
  using      (status = 'accepted' and current_officer_role() in ('field', 'superadmin'))
  with check (status = 'executed' and executed_by = current_officer_id());

drop policy if exists "alerts_insert" on public.alerts;
create policy "alerts_insert" on public.alerts for insert
  with check (current_officer_role() in ('division', 'superadmin') and issued_by = current_officer_id());

-- ── AUDIT LOG MIGRATION (run once against the already-deployed DB) ──────
create table if not exists public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  action     text not null,
  actor_id   uuid references public.officers(id),
  details    text,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_select" on public.audit_log;
create policy "audit_log_select" on public.audit_log for select using (current_officer_role() = 'superadmin');

drop policy if exists "audit_log_insert" on public.audit_log;
create policy "audit_log_insert" on public.audit_log for insert
  with check (auth.role() = 'authenticated' and actor_id = current_officer_id());

alter publication supabase_realtime add table public.audit_log;

-- ── EXECUTION PROOF MIGRATION (run once against the already-deployed DB) ─
-- Field-execution record to match the old backend's chain-of-custody data:
-- the actual value applied (may differ from the commanded value), officers
-- physically present, GPS coordinates of the field officer, and remarks.
alter table public.commands add column if not exists actual_value     text;
alter table public.commands add column if not exists officers_present text;
alter table public.commands add column if not exists gps_location     text;
alter table public.commands add column if not exists remarks          text;
