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

