# ITCC Wisuda Sync

Dokumentasi baseline untuk aplikasi internal ITCC ITPLN yang memvalidasi data wisuda terhadap SITASI dan Certiport, lalu mengisi dua kolom ITCC pada workbook wisuda.

## Dokumen

- [PRD](PRD.md)
- [Technical Specification](TECH-SPEC.md)
- [Project Structure and Conventions](PROJECT-STRUCTURE-AND-CONVENTIONS.md)
- [Setup and Development Guide](SETUP-AND-DEVELOPMENT.md)
- [Implementation Plan](superpowers/plans/2026-09-15-itcc-wisuda-sync.md)
- ADR:
  - [PostgreSQL over MongoDB](adr/0001-postgresql-over-mongodb.md)
  - [Graduation Workbook as Primary Source](adr/0002-graduation-workbook-primary-source.md)
  - [Python Processor for Excel](adr/0003-python-excel-processor.md)
  - [Batch Imports and Immutable Source Files](adr/0004-batch-imports-immutable-sources.md)

## Source data

Source workbook yang digunakan saat pengembangan tetap berada di luar repository dan tidak boleh di-commit karena mengandung data pribadi. Gunakan fixture sintetis untuk test.

