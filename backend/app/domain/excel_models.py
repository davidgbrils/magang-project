from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class GraduationRow:
    sheet_name: str
    source_row: int
    nim: str
    nama: str
    program_code: str
    values: dict[str, Any]


@dataclass(frozen=True)
class GraduationWorkbookReport:
    sheet_names: tuple[str, ...]
    rows: tuple[GraduationRow, ...]
    errors: tuple[str, ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class OutputValues:
    mos_value: str | None
    title_value: str | None


@dataclass(frozen=True)
class OutputReport:
    destination_path: str
    changes: tuple[dict[str, Any], ...]
