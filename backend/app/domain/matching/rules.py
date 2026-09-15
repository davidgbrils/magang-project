"""Pure selection rules for passed Microsoft credentials."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any

from .normalization import normalized_text, parse_exam_date

MOS_PROGRAM = "microsoft office specialist"
MCF_PROGRAM = "microsoft certified fundamentals"
ELIGIBLE_MCF_PROGRAM_CODES = frozenset({"31", "32"})


def is_passed(record: Mapping[str, Any]) -> bool:
    return normalized_text(record.get("result")) == "pass"


def select_mos(records: Sequence[Mapping[str, Any]]) -> Mapping[str, Any] | None:
    eligible = [
        record
        for record in records
        if is_passed(record) and normalized_text(record.get("program_name")) == MOS_PROGRAM
    ]
    return max(eligible, key=lambda record: parse_exam_date(record.get("exam_date")), default=None)


def select_mcf(records: Sequence[Mapping[str, Any]], program_code: object) -> Mapping[str, Any] | None:
    if str(program_code).strip() not in ELIGIBLE_MCF_PROGRAM_CODES:
        return None
    eligible = [
        record
        for record in records
        if is_passed(record) and normalized_text(record.get("program_name")) == MCF_PROGRAM
    ]
    return max(eligible, key=lambda record: parse_exam_date(record.get("exam_date")), default=None)
