alter table public.profiles enable row level security;
alter table public.reference_batches enable row level security;
alter table public.reference_batch_files enable row level security;
alter table public.sitasi_records enable row level security;
alter table public.certiport_records enable row level security;
alter table public.graduation_uploads enable row level security;
alter table public.sync_jobs enable row level security;
alter table public.sync_job_rows enable row level security;
alter table public.review_decisions enable row level security;
alter table public.generated_outputs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.matching_rules enable row level security;

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant select on public.profiles, public.reference_batches, public.reference_batch_files,
  public.sitasi_records, public.certiport_records, public.graduation_uploads,
  public.sync_jobs, public.sync_job_rows, public.review_decisions,
  public.generated_outputs, public.audit_logs, public.matching_rules to authenticated;
grant insert, update on public.graduation_uploads, public.sync_jobs, public.review_decisions to authenticated;

create policy "profile owner or admin can read profiles" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role') = 'ADMIN');
create policy "admin can manage profiles" on public.profiles for all to authenticated
  using ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN')
  with check ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN');

create policy "admin can manage reference batches" on public.reference_batches for all to authenticated
  using ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN')
  with check ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN');
create policy "admin can manage reference files" on public.reference_batch_files for all to authenticated
  using ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN')
  with check ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN');
create policy "admin can manage sitasi records" on public.sitasi_records for all to authenticated
  using ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN')
  with check ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN');
create policy "admin can manage certiport records" on public.certiport_records for all to authenticated
  using ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN')
  with check ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN');

create policy "users manage own graduation uploads" on public.graduation_uploads for select to authenticated
  using (uploaded_by = (select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role') = 'ADMIN');
create policy "users create own graduation uploads" on public.graduation_uploads for insert to authenticated
  with check (uploaded_by = (select auth.uid()));
create policy "users update own pending graduation uploads" on public.graduation_uploads for update to authenticated
  using (uploaded_by = (select auth.uid())) with check (uploaded_by = (select auth.uid()));

create policy "users read own sync jobs" on public.sync_jobs for select to authenticated
  using (started_by = (select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role') = 'ADMIN');
create policy "users start own sync jobs" on public.sync_jobs for insert to authenticated
  with check (started_by = (select auth.uid()));
create policy "users read own sync job rows" on public.sync_job_rows for select to authenticated
  using (exists (select 1 from public.sync_jobs job where job.id = sync_job_id and (job.started_by = (select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role') = 'ADMIN')));
create policy "users read own reviews" on public.review_decisions for select to authenticated
  using (exists (select 1 from public.sync_job_rows row join public.sync_jobs job on job.id = row.sync_job_id where row.id = sync_job_row_id and (job.started_by = (select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role') = 'ADMIN')));
create policy "users decide own reviews" on public.review_decisions for insert to authenticated
  with check (decided_by = (select auth.uid()) and exists (select 1 from public.sync_job_rows row join public.sync_jobs job on job.id = row.sync_job_id where row.id = sync_job_row_id and job.started_by = (select auth.uid())));
create policy "users read own generated outputs" on public.generated_outputs for select to authenticated
  using (exists (select 1 from public.sync_jobs job where job.id = sync_job_id and (job.started_by = (select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role') = 'ADMIN')));
create policy "users read own audit events" on public.audit_logs for select to authenticated
  using (actor_id = (select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role') = 'ADMIN');
create policy "authenticated users read active rules" on public.matching_rules for select to authenticated
  using (is_active or (select auth.jwt()->'app_metadata'->>'role') = 'ADMIN');
create policy "admin manages matching rules" on public.matching_rules for all to authenticated
  using ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN')
  with check ((select auth.jwt()->'app_metadata'->>'role') = 'ADMIN');

insert into storage.buckets (id, name, public) values ('source-files', 'source-files', false), ('output-files', 'output-files', false)
  on conflict (id) do update set public = false;
create policy "users upload owned source files" on storage.objects for insert to authenticated
  with check (bucket_id = 'source-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "users read owned source files" on storage.objects for select to authenticated
  using (bucket_id = 'source-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "users upload owned output files" on storage.objects for insert to authenticated
  with check (bucket_id = 'output-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "users read owned output files" on storage.objects for select to authenticated
  using (bucket_id = 'output-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
