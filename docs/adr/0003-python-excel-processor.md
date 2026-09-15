# ADR 0003: Use a Python Processor for Excel Operations

**Status:** Accepted

## Context

The application must read a 14-sheet XLSX, preserve workbook structure and styles, handle Certiport headers beginning at row 4, group repeated records, and generate a new workbook while changing only two columns. This processing is separate from the browser UI and may exceed a serverless request duration.

## Decision

Use a Python FastAPI service with an isolated Excel domain module based on `openpyxl`. The matching engine must be pure and deterministic, while workbook I/O remains in a separate adapter.

## Consequences

Positive:

- File-processing logic is testable without a browser.
- Python has mature tabular and XLSX support.
- The processor can run on a service with a suitable timeout and memory limit.
- The frontend remains focused on upload, progress, preview, and review.

Trade-offs:

- Deployment includes a second runtime.
- API contracts between Next.js and FastAPI must be versioned.
- Workbook fidelity still requires representative fixture and output tests.

