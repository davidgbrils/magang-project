"""Application service that coordinates the pure backend processing pipeline."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping, Sequence

from app.domain.excel_models import OutputValues
from app.domain.matching.engine import SyncDecision, evaluate_record
from app.services.excel.graduation_parser import parse_graduation_workbook
from app.services.excel.output_writer import generate_output


@dataclass(frozen=True)
class SynchronizationResult:
    status: str
    decisions: tuple[tuple[str, int, SyncDecision], ...]
    manifest: tuple[dict[str, Any], ...]
    output_path: str | None


def run_synchronization(
    graduation_path: str,
    sitasi_records: Sequence[Mapping[str, Any]],
    certiport_records: Sequence[Mapping[str, Any]],
    output_path: str | None = None,
) -> SynchronizationResult:
    report = parse_graduation_workbook(graduation_path)
    if report.errors:
        raise ValueError("; ".join(report.errors))

    decisions: list[tuple[str, int, SyncDecision]] = []
    result_map: dict[tuple[str, int], OutputValues] = {}
    manifest: list[dict[str, Any]] = []
    requires_review = False
    for row in report.rows:
        decision = evaluate_record(
            {"nim": row.nim, "nama": row.nama, "program_code": row.program_code},
            sitasi_records,
            certiport_records,
        )
        decisions.append((row.sheet_name, row.source_row, decision))
        if decision.result_status == "NEEDS_REVIEW":
            requires_review = True
        if decision.result_status == "READY":
            result_map[(row.sheet_name, row.source_row)] = OutputValues(decision.mos_value, decision.title_value)
        manifest.append({
            "sheet": row.sheet_name,
            "row": row.source_row,
            "nim": row.nim,
            "decision": decision.result_status,
            "reasonCodes": list(decision.reason_codes),
            "mosValue": decision.mos_value,
            "titleValue": decision.title_value,
        })

    if requires_review:
        return SynchronizationResult("READY_FOR_REVIEW", tuple(decisions), tuple(manifest), None)
    if output_path is None:
        raise ValueError("output_path wajib diisi setelah semua review selesai.")
    output = generate_output(graduation_path, result_map, output_path)
    return SynchronizationResult("COMPLETED", tuple(decisions), tuple(manifest), output.destination_path)
