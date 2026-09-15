create extension if not exists pgcrypto;

create type public.app_role as enum ('USER', 'ADMIN');
create type public.reference_source_type as enum ('SITASI', 'CERTIPORT');
create type public.import_status as enum ('UPLOADED', 'VALIDATING', 'VALID', 'INVALID', 'ARCHIVED', 'FAILED');
create type public.sync_job_status as enum ('UPLOADED', 'VALIDATING', 'PROCESSING', 'READY_FOR_REVIEW', 'COMPLETED', 'FAILED');
create type public.row_result_status as enum ('READY', 'NEEDS_REVIEW', 'NOT_FOUND_IN_SITASI', 'SITASI_NOT_GRADUATED', 'CERTIPORT_NOT_FOUND', 'DUPLICATE_NIM', 'EXCLUDED_MCF_PROGRAM', 'FAILED');
create type public.review_status as enum ('PENDING', 'CONFIRMED', 'REJECTED', 'SKIPPED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role public.app_role not null default 'USER',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reference_batches (
  id uuid primary key default gen_random_uuid(),
  source_type public.reference_source_type not null,
  period text not null,
  status public.import_status not null default 'UPLOADED',
  is_active boolean not null default false,
  valid_count integer not null default 0 check (valid_count >= 0),
  invalid_count integer not null default 0 check (invalid_count >= 0),
  duplicate_count integer not null default 0 check (duplicate_count >= 0),
  warning_count integer not null default 0 check (warning_count >= 0),
  uploaded_by uuid not null references public.profiles(id),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index reference_batches_one_active_per_source
  on public.reference_batches (source_type) where is_active;

create table public.reference_batch_files (
  id uuid primary key default gen_random_uuid(),
  reference_batch_id uuid not null references public.reference_batches(id) on delete cascade,
  storage_path text not null unique,
  original_file_name text not null,
  content_type text not null,
  byte_size bigint not null check (byte_size > 0),
  checksum_sha256 text,
  parse_report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.sitasi_records (
  id uuid primary key default gen_random_uuid(),
  reference_batch_id uuid not null references public.reference_batches(id) on delete cascade,
  source_row integer not null check (source_row > 0),
  nim text not null,
  nama text,
  fakultas text,
  kode_nim text,
  program_studi text,
  angkatan text,
  sertifikasi text,
  sub_program text,
  periode_kegiatan text,
  tahun text,
  kelompok_ujian text,
  nilai numeric,
  status text not null,
  raw_row jsonb not null,
  created_at timestamptz not null default now(),
  unique (reference_batch_id, source_row)
);

create index sitasi_records_batch_nim_idx on public.sitasi_records (reference_batch_id, nim);
create index sitasi_records_nim_status_idx on public.sitasi_records (nim, status);

create table public.certiport_records (
  id uuid primary key default gen_random_uuid(),
  reference_batch_id uuid not null references public.reference_batches(id) on delete cascade,
  source_row integer not null check (source_row > 0),
  first_name text,
  last_name text,
  full_name text,
  full_name_normalized text,
  student_employee_id text,
  username text,
  exam text,
  program_name text,
  certification_name text,
  exam_date date,
  score numeric,
  result text not null,
  raw_row jsonb not null,
  created_at timestamptz not null default now(),
  unique (reference_batch_id, source_row)
);

create index certiport_records_batch_student_id_idx on public.certiport_records (reference_batch_id, student_employee_id);
create index certiport_records_batch_name_idx on public.certiport_records (reference_batch_id, full_name_normalized);

create table public.graduation_uploads (
  id uuid primary key default gen_random_uuid(),
  original_file_name text not null,
  storage_path text not null unique,
  uploaded_by uuid not null references public.profiles(id),
  status public.import_status not null default 'UPLOADED',
  sheet_count integer not null default 0 check (sheet_count >= 0),
  student_count integer not null default 0 check (student_count >= 0),
  validation_report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  graduation_upload_id uuid not null references public.graduation_uploads(id),
  sitasi_batch_id uuid not null references public.reference_batches(id),
  certiport_batch_id uuid not null references public.reference_batches(id),
  started_by uuid not null references public.profiles(id),
  status public.sync_job_status not null default 'UPLOADED',
  current_stage text not null default 'UPLOADED',
  progress numeric(5,2) not null default 0 check (progress >= 0 and progress <= 100),
  total_rows integer not null default 0 check (total_rows >= 0),
  processed_rows integer not null default 0 check (processed_rows >= 0),
  ready_count integer not null default 0 check (ready_count >= 0),
  review_count integer not null default 0 check (review_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  failure_code text,
  failure_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sitasi_batch_id <> certiport_batch_id)
);

create index sync_jobs_owner_created_idx on public.sync_jobs (started_by, created_at desc);

create table public.sync_job_rows (
  id uuid primary key default gen_random_uuid(),
  sync_job_id uuid not null references public.sync_jobs(id) on delete cascade,
  sheet_name text not null,
  source_row integer not null check (source_row > 0),
  nim text,
  nama text,
  program_code text,
  result_status public.row_result_status not null,
  sitasi_match_status text,
  certiport_match_status text,
  mos_value text,
  title_value text,
  reason_codes text[] not null default '{}',
  decision_manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sync_job_id, sheet_name, source_row)
);

create index sync_job_rows_job_status_idx on public.sync_job_rows (sync_job_id, result_status);
create index sync_job_rows_job_nim_idx on public.sync_job_rows (sync_job_id, nim);

create table public.review_decisions (
  id uuid primary key default gen_random_uuid(),
  sync_job_row_id uuid not null references public.sync_job_rows(id) on delete cascade,
  decision public.review_status not null,
  note text,
  decided_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index review_decisions_row_created_idx on public.review_decisions (sync_job_row_id, created_at desc);

create table public.generated_outputs (
  id uuid primary key default gen_random_uuid(),
  sync_job_id uuid not null references public.sync_jobs(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  manifest jsonb not null default '[]'::jsonb,
  generated_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_actor_created_idx on public.audit_logs (actor_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);

create table public.matching_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  rule_value jsonb not null,
  is_active boolean not null default true,
  updated_by uuid not null references public.profiles(id),
  updated_at timestamptz not null default now()
);
