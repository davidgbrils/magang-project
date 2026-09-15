from pathlib import Path

from openpyxl import Workbook

from app.services.imports.certiport_importer import parse_certiport
from app.services.imports.sitasi_importer import parse_sitasi


def test_sitasi_keeps_duplicate_history_and_marks_empty_nim_invalid(tmp_path: Path) -> None:
    path = tmp_path / "sitasi.xlsx"
    workbook = Workbook()
    sheet = workbook.active
    sheet.append(["NIM", "Nama", "Status"])
    sheet.append(["202431001", "Ayu", "TIDAK LULUS"])
    sheet.append(["202431001", "Ayu", "LULUS"])
    sheet.append([None, "Tanpa NIM", "LULUS"])
    workbook.save(path)

    report = parse_sitasi(str(path))

    assert report.status == "INVALID"
    assert report.record_count == 2
    assert report.duplicate_count == 1
    assert report.errors[0].code == "INVALID_NIM"


def test_certiport_reads_header_row_four_and_keeps_missing_id_reviewable(tmp_path: Path) -> None:
    path = tmp_path / "certiport.xlsx"
    workbook = Workbook()
    sheet = workbook.active
    sheet.append(["Laporan"])
    sheet.append([])
    sheet.append([])
    sheet.append(["Student / Employee ID", "First Name", "Last Name", "Exam", "Program Name", "Exam Date", "Result"])
    sheet.append([None, "Ayu", "Putri", "Word 2019", "Microsoft Office Specialist", "2026-01-01", "Pass"])
    sheet.append(["202431002", "Bima", "Test", "Excel 2019", "Microsoft Office Specialist", "2026-01-01", "Inco"])
    workbook.save(path)

    report = parse_certiport(str(path))

    assert report.status == "VALID"
    assert report.record_count == 2
    assert report.records[0].values["student_employee_id"] == ""
    assert report.warnings[0].code == "MISSING_STUDENT_ID"
