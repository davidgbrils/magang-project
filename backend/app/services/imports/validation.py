from __future__ import annotations

import re
from collections.abc import Iterable


def normalize_header(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def build_header_index(headers: Iterable[object]) -> dict[str, int]:
    return {normalize_header(header): index for index, header in enumerate(headers) if normalize_header(header)}


def missing_headers(headers: Iterable[object], required: Iterable[str]) -> list[str]:
    index = build_header_index(headers)
    return [header for header in required if normalize_header(header) not in index]
