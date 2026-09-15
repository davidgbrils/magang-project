from pathlib import Path


def test_every_exposed_table_enables_rls_and_storage_is_private() -> None:
    policy_sql = next(Path("supabase/migrations").glob("*_create_rls_policies.sql")).read_text(encoding="utf-8")
    for table in (
        "profiles", "reference_batches", "reference_batch_files", "sitasi_records",
        "certiport_records", "graduation_uploads", "sync_jobs", "sync_job_rows",
        "review_decisions", "generated_outputs", "audit_logs", "matching_rules",
    ):
        assert f"alter table public.{table} enable row level security;" in policy_sql
    assert "revoke all on all tables in schema public from anon;" in policy_sql
    assert "source-files', 'source-files', false" in policy_sql
    assert "output-files', 'output-files', false" in policy_sql
    assert "service_role" not in policy_sql
