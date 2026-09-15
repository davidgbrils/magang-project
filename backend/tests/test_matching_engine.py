from app.domain.matching import engine


def test_name_only_certiport_candidate_requires_manual_review() -> None:
    assert hasattr(engine, "evaluate_record")


def test_name_only_certiport_candidate_requires_manual_review() -> None:
    decision = engine.evaluate_record(
        graduation={"nim": "202431001", "nama": "Ayu Putri", "program_code": "31"},
        sitasi_records=[{"nim": "202431001", "status": "LULUS"}],
        certiport_records=[
            {
                "student_employee_id": "",
                "full_name": "Ayu Putri",
                "program_name": "Microsoft Office Specialist",
                "exam": "Word 2019",
                "exam_date": "2026-02-01",
                "result": "Pass",
            }
        ],
    )

    assert decision.result_status == "NEEDS_REVIEW"
    assert decision.mos_value is None
    assert decision.title_value is None
    assert decision.reason_codes == ("REVIEW_REQUIRED",)


def test_selects_latest_passed_mos_and_eligible_mcf() -> None:
    decision = engine.evaluate_record(
        graduation={"nim": "202431001", "nama": "Ayu Putri", "program_code": "31"},
        sitasi_records=[
            {"nim": "202431001", "status": "TIDAK LULUS"},
            {"nim": "202431001", "status": "LULUS"},
        ],
        certiport_records=[
            {
                "student_employee_id": "202431001",
                "full_name": "Ayu Putri",
                "program_name": "Microsoft Office Specialist",
                "exam": "Word 2019",
                "exam_date": "2025-01-01",
                "result": "Pass",
            },
            {
                "student_employee_id": "202431001",
                "full_name": "Ayu Putri",
                "program_name": "Microsoft Office Specialist",
                "exam": "Excel 2019",
                "exam_date": "2026-01-01",
                "result": "Pass",
            },
            {
                "student_employee_id": "202431001",
                "full_name": "Ayu Putri",
                "program_name": "Microsoft Certified Fundamentals",
                "exam": "AI-900",
                "exam_date": "2026-02-01",
                "result": "Pass",
            },
            {
                "student_employee_id": "202431001",
                "full_name": "Ayu Putri",
                "program_name": "Microsoft Office Specialist",
                "exam": "PowerPoint 2019",
                "exam_date": "2026-03-01",
                "result": "Fail",
            },
        ],
    )

    assert decision.result_status == "READY"
    assert decision.mos_value == "MOS (Excel 2019 - Lulus)"
    assert decision.title_value == "MOS & MCF"


def test_excludes_mcf_outside_allowed_program_codes() -> None:
    decision = engine.evaluate_record(
        graduation={"nim": "202433001", "nama": "Bima Test", "program_code": "33"},
        sitasi_records=[{"nim": "202433001", "status": "LULUS"}],
        certiport_records=[
            {
                "student_employee_id": "202433001",
                "full_name": "Bima Test",
                "program_name": "Microsoft Certified Fundamentals",
                "exam": "SC-900",
                "exam_date": "2026-02-01",
                "result": "Pass",
            }
        ],
    )

    assert decision.result_status == "READY"
    assert decision.mos_value is None
    assert decision.title_value is None
    assert decision.reason_codes == ("EXCLUDED_MCF_PROGRAM",)
