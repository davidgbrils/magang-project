"""Decision engine for graduation certification matching."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping, Sequence

from .normalization import normalize_name, normalize_nim, normalized_text
from .rules import MCF_PROGRAM, is_passed, select_mcf, select_mos


@dataclass(frozen=True)
class SyncDecision:
    result_status: str
    mos_value: str | None
    title_value: str | None
    reason_codes: tuple[str, ...]
    matched_by: str | None


def evaluate_record(
    graduation: Mapping[str, Any],
    sitasi_records: Sequence[Mapping[str, Any]],
    certiport_records: Sequence[Mapping[str, Any]],
) -> SyncDecision:
    nim = normalize_nim(graduation.get("nim"))
    name = normalize_name(graduation.get("nama"))

    matching_sitasi = [
        record for record in sitasi_records if normalize_nim(record.get("nim")) == nim
    ]
    if not matching_sitasi:
        return SyncDecision("NOT_FOUND_IN_SITASI", None, None, ("NOT_FOUND_IN_SITASI",), None)
    if not any(normalized_text(record.get("status")) == "lulus" for record in matching_sitasi):
        return SyncDecision(
            "SITASI_NOT_GRADUATED", None, None, ("SITASI_NOT_GRADUATED",), None
        )

    id_matches = [
        record
        for record in certiport_records
        if normalize_nim(record.get("student_employee_id")) == nim and nim
    ]
    if not id_matches:
        name_matches = [
            record
            for record in certiport_records
            if is_passed(record) and normalize_name(record.get("full_name")) == name and name
        ]
        if name_matches:
            return SyncDecision("NEEDS_REVIEW", None, None, ("REVIEW_REQUIRED",), "NAME_ONLY")
        return SyncDecision("READY", None, None, ("CERTIPORT_NOT_FOUND",), None)

    mos = select_mos(id_matches)
    mcf = select_mcf(id_matches, graduation.get("program_code"))
    reasons: list[str] = []
    has_ineligible_mcf = any(
        is_passed(record) and normalized_text(record.get("program_name")) == MCF_PROGRAM
        for record in id_matches
    ) and str(graduation.get("program_code") or "").strip() not in {"31", "32"}
    if has_ineligible_mcf:
        reasons.append("EXCLUDED_MCF_PROGRAM")
    if mos is None and mcf is None and not reasons:
        reasons.append("CERTIPORT_NOT_FOUND")

    mos_value = f"MOS ({mos.get('exam', '').strip()} - Lulus)" if mos else None
    title_value = "MOS & MCF" if mos and mcf else "MOS" if mos else "MCF" if mcf else None
    return SyncDecision("READY", mos_value, title_value, tuple(reasons), "NIM")
