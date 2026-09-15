# ADR 0001: Use PostgreSQL Instead of MongoDB

**Status:** Accepted

## Context

The system stores users, roles, import batches, multiple exam records per NIM, graduation rows, synchronization results, review decisions, and audit logs. The matching process needs relationships, constraints, indexes, and reliable filtering by batch, NIM, status, and role.

## Decision

Use PostgreSQL through Supabase as the system of record.

## Consequences

Positive:

- Relational constraints prevent orphaned records.
- Composite indexes support NIM and batch lookups.
- Transactions can persist a sync run consistently.
- RLS provides database-level access control.
- JSONB can retain raw source rows without making the core model document-oriented.

Trade-offs:

- Schema migrations must be managed deliberately.
- Raw source formats still need an import mapping layer.
- Very large raw files should stay in Storage rather than be copied wholesale into table columns.

