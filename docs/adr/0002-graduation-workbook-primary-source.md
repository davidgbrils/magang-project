# ADR 0002: Use Graduation Workbook as the Primary Student List

**Status:** Accepted

## Context

The requested output is a graduation workbook. SITASI contains exam-history rows and may contain duplicate NIM records. Certiport contains certification-result rows and may have missing or invalid Student / Employee ID values. Using either reference source as the student list could add students who are not in the current graduation batch.

## Decision

Use rows from the uploaded graduation workbook as the authoritative list of output rows. Use SITASI only to validate graduation status and academic identity, and Certiport only to validate certification results.

## Consequences

Positive:

- Output scope exactly follows the current graduation file.
- Students from old SITASI or Certiport batches are not added accidentally.
- The system can preserve all 14 source sheets and row positions.

Trade-offs:

- A missing or incorrect NIM in the graduation workbook remains a review problem.
- The operator must resolve records that cannot be validated in reference data.
- The importer must preserve sheet and row metadata.

