from pathlib import Path

import yaml


def test_openapi_contract_contains_all_backend_domains() -> None:
    contract = yaml.safe_load(Path("docs/api/openapi.yaml").read_text(encoding="utf-8"))
    assert contract["openapi"].startswith("3.")
    assert {"/me", "/graduation-uploads", "/reference-batches", "/sync-jobs", "/admin/reference-batches/sitasi", "/admin/audit-logs"}.issubset(contract["paths"])
    assert {"READY", "NEEDS_REVIEW", "EXCLUDED_MCF_PROGRAM", "FAILED"}.issubset(contract["components"]["schemas"]["RowStatus"]["enum"])
