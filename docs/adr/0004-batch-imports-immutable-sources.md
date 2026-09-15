# ADR 0004: Store Imports as Batches and Keep Source Files Immutable

**Status:** Accepted

## Context

SITASI and Certiport files are uploaded manually per period. Replacing the previous file would make it difficult to reproduce an old result or identify which reference data was used. The graduation workbook must also never be overwritten.

## Decision

Save every SITASI, Certiport, and graduation upload as a distinct batch. A batch can be active or archived, but its source file and parsed records are immutable. A synchronization run stores references to exactly one graduation batch, one SITASI batch, and one Certiport batch.

## Consequences

Positive:

- Results are reproducible.
- Admin can compare or roll back the active reference batch.
- Audit trails have stable source references.
- The original workbook is protected from accidental overwrite.

Trade-offs:

- Storage grows over time.
- Retention and archive policies must be implemented later.
- Admin UI needs explicit batch activation and archive actions.

