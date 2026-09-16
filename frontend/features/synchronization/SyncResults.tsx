"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AsyncState } from "../../components/ui/AsyncState";
import { Button } from "../../components/ui/Button";
import { StatusBadge, type StatusTone } from "../../components/ui/StatusBadge";
import { ApiClientError } from "../../lib/api-client";
import {
  generateSyncOutput,
  getOutputDownload,
  getSyncJobPreview,
  reviewSyncRow,
  type GeneratedOutput,
  type OutputDownload,
  type ReviewStatus,
  type SyncRow,
  type SyncRowStatus,
  type SyncRowsResponse,
} from "./synchronization-api";

const ROW_STATUS_LABELS: Record<SyncRowStatus, string> = {
  READY: "Siap",
  NEEDS_REVIEW: "Perlu ditinjau",
  NOT_FOUND_IN_SITASI: "Tidak ditemukan di SITASI",
  SITASI_NOT_GRADUATED: "Belum lulus di SITASI",
  CERTIPORT_NOT_FOUND: "Tidak ditemukan di Certiport",
  DUPLICATE_NIM: "NIM duplikat",
  EXCLUDED_MCF_PROGRAM: "Program MCF dikecualikan",
  FAILED: "Gagal",
};

function rowTone(status: SyncRowStatus): StatusTone {
  if (status === "READY") return "success";
  if (status === "FAILED" || status === "NOT_FOUND_IN_SITASI" || status === "CERTIPORT_NOT_FOUND") return "danger";
  if (status === "NEEDS_REVIEW" || status === "DUPLICATE_NIM" || status === "SITASI_NOT_GRADUATED") return "warning";
  return "neutral";
}

function apiMessage(error: unknown, fallback: string): string {
  return error instanceof ApiClientError ? error.message : fallback;
}

export interface SyncRowsTableProps {
  rows: SyncRow[];
  onReview?: (row: SyncRow) => void;
}

export function SyncRowsTable({ rows, onReview }: SyncRowsTableProps) {
  if (!rows.length) return <AsyncState variant="empty" message="Belum ada baris yang cocok dengan filter saat ini." />;

  return (
    <div className="sync-results__table-region" tabIndex={0} aria-label="Tabel hasil sinkronisasi; geser horizontal untuk melihat semua kolom">
      <table className="sync-results__table">
        <caption className="ui-visually-hidden">Baris hasil sinkronisasi dan status keputusan</caption>
        <thead><tr><th scope="col">Sheet / baris</th><th scope="col">NIM</th><th scope="col">Nama</th><th scope="col">Status</th><th scope="col">Nilai MOS</th><th scope="col">Gelar</th><th scope="col">Kode alasan</th><th scope="col">Aksi</th></tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={row.id}>
            <td>{row.sheetName} / {row.sourceRow}</td>
            <td><code>{row.nim}</code></td>
            <td>{row.nama}</td>
            <td><StatusBadge tone={rowTone(row.resultStatus)} label={ROW_STATUS_LABELS[row.resultStatus]} /></td>
            <td>{row.mosValue ?? "Tidak tersedia"}</td>
            <td>{row.titleValue ?? "Tidak tersedia"}</td>
            <td>{row.reasonCodes.length ? row.reasonCodes.join(", ") : "Belum ada kode alasan"}</td>
            <td>{onReview ? <Button variant="secondary" onClick={() => onReview(row)}>Review</Button> : "Tidak tersedia"}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function SyncPreviewManifestPanel({ jobId, changes: suppliedChanges }: { jobId: string; changes?: SyncRow[] }) {
  const controlled = suppliedChanges !== undefined;
  const [changes, setChanges] = useState<SyncRow[]>(suppliedChanges ?? []);
  const [state, setState] = useState<"loading" | "ready" | "error" | "forbidden">(controlled ? "ready" : "loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (controlled) return;
    if (!jobId.trim()) { setState("ready"); return; }
    const controller = new AbortController();
    getSyncJobPreview(jobId, controller.signal).then((next) => {
      if (controller.signal.aborted) return;
      setChanges(next.changes); setState("ready");
    }, (caughtError) => {
      if (controller.signal.aborted) return;
      setError(apiMessage(caughtError, "Manifest preview gagal dimuat."));
      setState(caughtError instanceof ApiClientError && caughtError.status === 403 ? "forbidden" : "error");
    });
    return () => controller.abort();
  }, [controlled, jobId]);

  if (!jobId.trim()) return <AsyncState variant="empty" message="ID sinkronisasi belum tersedia." />;
  if (state === "loading") return <AsyncState variant="loading" message="Manifest preview sedang dimuat." />;
  if (state === "forbidden") return <AsyncState variant="error" message={error ?? "Anda tidak memiliki akses ke preview ini."} />;
  if (state === "error") return <AsyncState variant="error" message={error ?? "Manifest preview gagal dimuat."} />;
  return <section className="sync-results" aria-labelledby="sync-manifest-title"><div className="sync-results__intro"><p className="graduation-upload__eyebrow">Manifest server</p><h1 id="sync-manifest-title">Preview perubahan</h1><p>{changes.length} perubahan dikirim oleh server.</p></div><SyncRowsTable rows={changes} /><div className="sync-results__pagination"><Link className="graduation-upload__link" href={`/user/synchronization/${encodeURIComponent(jobId)}/review`}>Buka review baris</Link><Link className="graduation-upload__link" href={`/user/synchronization/${encodeURIComponent(jobId)}/output`}>Buka output</Link></div></section>;
}

export interface SyncPreviewPanelProps {
  jobId: string;
  rows?: SyncRow[];
  page?: number;
  pageSize?: number;
  total?: number;
  result?: SyncRowsResponse | null;
}

export function SyncPreviewPanel({ jobId, rows: suppliedRows, page: suppliedPage = 1, pageSize: suppliedPageSize = 25, total: suppliedTotal, result: suppliedResult }: SyncPreviewPanelProps) {
  const controlled = suppliedRows !== undefined || suppliedResult !== undefined;
  const [rows, setRows] = useState<SyncRow[]>(suppliedResult?.items ?? suppliedRows ?? []);
  const [page, setPage] = useState(suppliedResult?.page ?? suppliedPage);
  const [pageSize, setPageSize] = useState(suppliedResult?.pageSize ?? suppliedPageSize);
  const [total, setTotal] = useState(suppliedResult?.total ?? suppliedTotal ?? suppliedRows?.length ?? 0);
  const [status, setStatus] = useState<SyncRowStatus | "">("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [state] = useState<"ready" | "unavailable">(controlled ? "ready" : "unavailable");
  const [reviewRow, setReviewRow] = useState<SyncRow | null>(null);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSubmittedSearch(search.trim());
  }

  function changeStatus(event: React.ChangeEvent<HTMLSelectElement>) {
    setStatus(event.target.value as SyncRowStatus | "");
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (!jobId.trim()) return <AsyncState variant="empty" message="ID sinkronisasi belum tersedia." />;
  if (state === "unavailable") return <section className="sync-results" aria-labelledby="sync-results-unavailable-title"><div className="sync-results__intro"><p className="graduation-upload__eyebrow">Hasil sinkronisasi</p><h1 id="sync-results-unavailable-title">Daftar baris belum tersedia</h1></div><AsyncState variant="empty" message="Format response daftar baris belum disahkan di kontrak backend. Preview manifest tetap dapat dibuka dari halaman preview." /></section>;
  return <section className="sync-results" aria-labelledby="sync-results-title">
    <div className="sync-results__intro"><p className="graduation-upload__eyebrow">Hasil sinkronisasi</p><h1 id="sync-results-title">Preview perubahan</h1><p>{total} baris dari server. Tidak ada data hasil yang dibuat di sisi klien.</p></div>
    <form className="sync-results__filters" onSubmit={submitSearch}>
      <label htmlFor="sync-status">Status</label>
      <select id="sync-status" name="status" value={status} onChange={changeStatus}><option value="">Semua status</option>{Object.entries(ROW_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <label htmlFor="sync-search">Cari NIM atau nama</label>
      <input id="sync-search" name="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari NIM atau nama" />
      <Button type="submit">Terapkan pencarian</Button>
    </form>
    <SyncRowsTable rows={rows} onReview={setReviewRow} />
    <div className="sync-results__pagination" aria-label="Navigasi halaman hasil"><span>Halaman {page} dari {totalPages}</span><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Sebelumnya</Button><Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Berikutnya</Button></div>
    {reviewRow ? <SyncReviewDialog row={reviewRow} onClose={() => setReviewRow(null)} onReviewed={(next) => { setRows((current) => current.map((item) => item.id === next.id ? next : item)); setReviewRow(null); }} /> : null}
  </section>;
}

export interface SyncReviewDialogProps {
  row: SyncRow;
  onClose: () => void;
  onReviewed?: (row: SyncRow) => void;
}

export function SyncReviewDialog({ row, onClose, onReviewed }: SyncReviewDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [decision, setDecision] = useState<ReviewStatus>("CONFIRMED");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button, input, textarea, select, [href], [tabindex]:not([tabindex=\"-1\"])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", handleKeyboard);
    return () => { document.removeEventListener("keydown", handleKeyboard); previousFocus.current?.focus(); };
  }, [onClose]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("pending"); setError(null);
    try { const updated = await reviewSyncRow(row.id, { decision, note }); onReviewed?.(updated); }
    catch (caughtError) { setError(apiMessage(caughtError, "Keputusan review gagal disimpan.")); setState("error"); }
  }

  return <div className="sync-results__dialog-backdrop"><section ref={dialogRef} className="sync-results__dialog" role="dialog" aria-modal="true" aria-labelledby="sync-review-title" tabIndex={-1}>
    <button ref={closeButtonRef} type="button" className="sync-results__dialog-close" onClick={onClose}>Tutup review</button>
    <h2 id="sync-review-title">Review {row.nama}</h2><p><code>{row.nim}</code> · {ROW_STATUS_LABELS[row.resultStatus]}</p>
    <form onSubmit={submit}><fieldset><legend>Keputusan</legend>{(["CONFIRMED", "REJECTED", "SKIPPED"] as const).map((value) => <label key={value}><input type="radio" name="decision" value={value} checked={decision === value} onChange={() => setDecision(value)} /> {value === "CONFIRMED" ? "Konfirmasi" : value === "REJECTED" ? "Tolak" : "Lewati"}</label>)}</fieldset><label htmlFor="review-note">Catatan (opsional)</label><textarea id="review-note" maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} /><Button type="submit" loading={state === "pending"}>Simpan keputusan</Button>{state === "error" ? <p role="alert" className="sync-results__error">{error}</p> : null}</form>
  </section></div>;
}

export interface SyncOutputPanelProps {
  jobId: string;
  output?: GeneratedOutput | null;
  authorizedDownload?: OutputDownload | null;
}

export function SyncOutputPanel({ jobId, output: suppliedOutput, authorizedDownload: suppliedDownload }: SyncOutputPanelProps) {
  const [output, setOutput] = useState<GeneratedOutput | null>(suppliedOutput ?? null);
  const [download, setDownload] = useState<OutputDownload | null>(suppliedDownload ?? null);
  const [state, setState] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setState("pending"); setError(null); setDownload(null);
    try { setOutput(await generateSyncOutput(jobId)); setState("idle"); }
    catch (caughtError) { setError(apiMessage(caughtError, "Output gagal dibuat.")); setState("error"); }
  }

  async function downloadOutput() {
    if (!output?.id) return;
    setState("pending"); setError(null);
    try {
      const authorized = await getOutputDownload(output.id);
      setDownload(authorized);
      setState("idle");
    } catch (caughtError) { setError(apiMessage(caughtError, "Link download gagal dibuat.")); setState("error"); }
  }

  if (!jobId.trim()) return <AsyncState variant="empty" message="ID sinkronisasi belum tersedia." />;
  return <section className="sync-results sync-output" aria-labelledby="sync-output-title"><div className="sync-results__intro"><p className="graduation-upload__eyebrow">File keluaran</p><h1 id="sync-output-title">Output sinkronisasi</h1><p>File hanya dapat dibuat setelah keputusan review yang diwajibkan server selesai.</p></div>{!output ? <><AsyncState variant="empty" message="Belum ada output untuk sinkronisasi ini." /><Button onClick={() => void generate()} loading={state === "pending"}>Generate output</Button></> : <div className="sync-output__result"><StatusBadge tone={output.status === "COMPLETED" ? "success" : "warning"} label={output.status} /><p>{output.fileName}</p>{download ? <a className="graduation-upload__link" href={download.url} target="_blank" rel="noopener noreferrer">Download output</a> : <Button onClick={() => void downloadOutput()} loading={state === "pending"}>Minta link download</Button>}{download ? <p className="sync-output__expiry" role="status">Link sementara berlaku sampai {download.expiresAt}.</p> : null}</div>}{state === "error" ? <p role="alert" className="sync-results__error">{error}</p> : null}</section>;
}
