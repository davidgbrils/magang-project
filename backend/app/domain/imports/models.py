from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ImportIssue:
    row: int | None
    field: str | None
    code: str
    message: str


@dataclass(frozen=True)
class ImportedRecord:
    source_row: int
    values: dict[str, Any]
    raw_row: dict[str, Any]


@dataclass(frozen=True)
class ImportReport:
    status: str
    headers: tuple[str, ...]
    record_count: int
    records: tuple[ImportedRecord, ...]
    errors: tuple[ImportIssue, ...] = field(default_factory=tuple)
    warnings: tuple[ImportIssue, ...] = field(default_factory=tuple)
    duplicate_count: int = 0
