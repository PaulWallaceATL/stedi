-- Supabase schema for Clinix AI billing flows
-- Run this in Supabase SQL editor or psql after setting the project DB.

-- Extensions
create extension if not exists "pgcrypto";

-- Claims table: add columns for normalized fields
alter table public.claims
  add column if not exists patient_name text,
  add column if not exists payer_name text,
  add column if not exists date_of_service date,
  add column if not exists total_charge numeric,
  add column if not exists service_line_count integer,
  add column if not exists primary_diagnosis_code text,
  add column if not exists updated_at timestamptz default now();

create index if not exists claims_user_id_idx on public.claims (user_id);
create index if not exists claims_status_idx on public.claims (status);
create index if not exists claims_date_of_service_idx on public.claims (date_of_service desc nulls last);

-- Diagnoses per claim
create table if not exists public.claim_diagnoses (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references public.claims(id) on delete cascade,
  code text not null,
  description text,
  priority int,
  created_at timestamptz default now()
);
create index if not exists claim_diagnoses_claim_id_idx on public.claim_diagnoses (claim_id);

-- Service lines per claim
create table if not exists public.claim_service_lines (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references public.claims(id) on delete cascade,
  code text not null,
  description text,
  modifiers text[] default '{}',
  diagnosis_pointers int[] default '{}',
  service_date_from date,
  service_date_to date,
  units numeric,
  charge numeric,
  created_at timestamptz default now()
);
create index if not exists claim_service_lines_claim_id_idx on public.claim_service_lines (claim_id);

-- Simple status enum (optional). Uncomment to enforce typed statuses.
-- create type public.claim_status as enum ('draft','submitted','accepted','denied','rejected','paid');
-- alter table public.claims alter column status type public.claim_status using status::public.claim_status;

-- Practice profile & settings (drives Settings experience)
create table if not exists public.practice_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  practice_legal_name text,
  dba_name text,
  organization_type text,
  main_phone text,
  main_fax text,
  main_email text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists practice_profiles_user_id_idx on public.practice_profiles (user_id);
alter table public.practice_profiles enable row level security;
create policy practice_profiles_select_self on public.practice_profiles for select using (auth.uid() = user_id);
create policy practice_profiles_insert_self on public.practice_profiles for insert with check (auth.uid() = user_id);
create policy practice_profiles_update_self on public.practice_profiles for update using (auth.uid() = user_id);
create policy practice_profiles_delete_self on public.practice_profiles for delete using (auth.uid() = user_id);

-- Billing entities (tax id / NPI / taxonomy defaults)
create table if not exists public.billing_entities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  practice_id uuid references public.practice_profiles(id) on delete cascade,
  legal_name text,
  tax_id text,
  organizational_npi text,
  default_taxonomy_code text,
  remit_same_as_practice boolean default true,
  remit_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists billing_entities_user_id_idx on public.billing_entities (user_id);
create index if not exists billing_entities_practice_id_idx on public.billing_entities (practice_id);
alter table public.billing_entities enable row level security;
create policy billing_entities_select_self on public.billing_entities for select using (auth.uid() = user_id);
create policy billing_entities_insert_self on public.billing_entities for insert with check (auth.uid() = user_id);
create policy billing_entities_update_self on public.billing_entities for update using (auth.uid() = user_id);
create policy billing_entities_delete_self on public.billing_entities for delete using (auth.uid() = user_id);

-- Service locations & POS
create table if not exists public.practice_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  practice_id uuid references public.practice_profiles(id) on delete cascade,
  name text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  pos_code text,
  is_primary boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists practice_locations_user_id_idx on public.practice_locations (user_id);
create index if not exists practice_locations_practice_id_idx on public.practice_locations (practice_id);
alter table public.practice_locations enable row level security;
create policy practice_locations_select_self on public.practice_locations for select using (auth.uid() = user_id);
create policy practice_locations_insert_self on public.practice_locations for insert with check (auth.uid() = user_id);
create policy practice_locations_update_self on public.practice_locations for update using (auth.uid() = user_id);
create policy practice_locations_delete_self on public.practice_locations for delete using (auth.uid() = user_id);

-- Provider directory
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  practice_id uuid references public.practice_profiles(id) on delete cascade,
  full_name text,
  credentials text,
  specialty text,
  npi text,
  taxonomy_code text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists providers_user_id_idx on public.providers (user_id);
create index if not exists providers_practice_id_idx on public.providers (practice_id);
alter table public.providers enable row level security;
create policy providers_select_self on public.providers for select using (auth.uid() = user_id);
create policy providers_insert_self on public.providers for insert with check (auth.uid() = user_id);
create policy providers_update_self on public.providers for update using (auth.uid() = user_id);
create policy providers_delete_self on public.providers for delete using (auth.uid() = user_id);

-- Payer enrollments / connections
create table if not exists public.payer_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  practice_id uuid references public.practice_profiles(id) on delete cascade,
  payer_name text not null,
  payer_id text,
  status text default 'pending',
  connection text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists payer_enrollments_user_id_idx on public.payer_enrollments (user_id);
create index if not exists payer_enrollments_practice_id_idx on public.payer_enrollments (practice_id);
alter table public.payer_enrollments enable row level security;
create policy payer_enrollments_select_self on public.payer_enrollments for select using (auth.uid() = user_id);
create policy payer_enrollments_insert_self on public.payer_enrollments for insert with check (auth.uid() = user_id);
create policy payer_enrollments_update_self on public.payer_enrollments for update using (auth.uid() = user_id);
create policy payer_enrollments_delete_self on public.payer_enrollments for delete using (auth.uid() = user_id);

-- Claim defaults and automation toggles
create table if not exists public.claim_rules_defaults (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  practice_id uuid references public.practice_profiles(id) on delete cascade,
  default_pos_code text,
  default_rendering_provider uuid references public.providers(id) on delete set null,
  default_taxonomy_code text,
  default_modifiers text[] default '{}',
  signature_on_file boolean default true,
  accept_assignment boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists claim_rules_defaults_user_id_idx on public.claim_rules_defaults (user_id);
create index if not exists claim_rules_defaults_practice_id_idx on public.claim_rules_defaults (practice_id);
alter table public.claim_rules_defaults enable row level security;
create policy claim_rules_defaults_select_self on public.claim_rules_defaults for select using (auth.uid() = user_id);
create policy claim_rules_defaults_insert_self on public.claim_rules_defaults for insert with check (auth.uid() = user_id);
create policy claim_rules_defaults_update_self on public.claim_rules_defaults for update using (auth.uid() = user_id);
create policy claim_rules_defaults_delete_self on public.claim_rules_defaults for delete using (auth.uid() = user_id);

create table if not exists public.claim_automation_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  practice_id uuid references public.practice_profiles(id) on delete cascade,
  auto_correction_enabled boolean default true,
  suggest_missing_codes boolean default true,
  modifier_mismatches boolean default true,
  pos_conflicts boolean default true,
  invalid_cpt_icd_combos boolean default true,
  telehealth_compliance boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists claim_automation_rules_user_id_idx on public.claim_automation_rules (user_id);
create index if not exists claim_automation_rules_practice_id_idx on public.claim_automation_rules (practice_id);
alter table public.claim_automation_rules enable row level security;
create policy claim_automation_rules_select_self on public.claim_automation_rules for select using (auth.uid() = user_id);
create policy claim_automation_rules_insert_self on public.claim_automation_rules for insert with check (auth.uid() = user_id);
create policy claim_automation_rules_update_self on public.claim_automation_rules for update using (auth.uid() = user_id);
create policy claim_automation_rules_delete_self on public.claim_automation_rules for delete using (auth.uid() = user_id);

-- Upload audit (CSV / JSON intake)
create table if not exists public.claim_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  filename text not null,
  total_rows int,
  error_rows int,
  ready_rows int,
  created_at timestamptz default now()
);
create index if not exists claim_uploads_user_id_idx on public.claim_uploads (user_id);
alter table public.claim_uploads enable row level security;
create policy claim_uploads_select_self on public.claim_uploads for select using (auth.uid() = user_id);
create policy claim_uploads_insert_self on public.claim_uploads for insert with check (auth.uid() = user_id);
create policy claim_uploads_delete_self on public.claim_uploads for delete using (auth.uid() = user_id);

-- Link claims to practice metadata
alter table public.claims
  add column if not exists practice_id uuid references public.practice_profiles(id) on delete set null,
  add column if not exists billing_entity_id uuid references public.billing_entities(id) on delete set null,
  add column if not exists location_id uuid references public.practice_locations(id) on delete set null,
  add column if not exists rendering_provider_id uuid references public.providers(id) on delete set null;

create index if not exists claims_practice_id_idx on public.claims (practice_id);
create index if not exists claims_location_id_idx on public.claims (location_id);

