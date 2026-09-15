"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AsyncState } from "../../components/ui/AsyncState";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ApiClientError } from "../../lib/api-client";
import {
  getActiveReferenceBatches,
  getSyncJob,
  startSynchronization,
  type ActiveReferenceBatches,
  type ReferenceBatch,
  type SyncJob,
} from "./synchronization-api";

function activeBatchIsValid(batch: ReferenceBatch | null | undefined, sourceType: ReferenceBatch["sourceType"]): batch is ReferenceBatch {
  return Boolean(batch && batch.id.trim() && batch.sourceType === sourceType && batch.isActive !== false);
}

function apiMessage(error: unknown, fallback: string): string {
  return error instanceof ApiClientError ? error.message : fallback;
}

export function ReferenceSelectionPanel({ uploadId, activeBatches: suppliedActiveBatches, onStarted }: { uploadId: string | null; activeBatches?: ActiveReferenceBatches | null; onStarted?: (jobId: string) => void }) {
  const isControlled = suppliedActiveBatches !== undefined;
  const [activeBatches, setActiveBatches] = useState<ActiveReferenceBatches | null>(suppliedActiveBatches ?? null);
  const [state, setState] = useState<"loading" | "ready" | "error">(isControlled ? "ready" : "loading");
  const [sitasiBatchId, setSitasiBatchId] = useState(suppliedActiveBatches?.sitasi?.id ?? "");
  const [certiportBatchId, setCertiportBatchId] = useState(suppliedActiveBatches?.certiport?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (isControlled) return;
    const controller = new AbortController();
    setState("loading");
    getActiveReferenceBatches(controller.signal).then((next) => {
      if (controller.signal.aborted) return;
      setActiveBatches(next);
      setSitasiBatchId(next.sitasi?.id ?? "");
      setCertiportBatchId(next.certiport?.id ?? "");
      setState("ready");
    }, (caughtError) => {
      if (!controller.signal.aborted) {
        setError(apiMessage(caughtError, "Batch referensi gagal dimuat. Coba lagi."));
        setState("error");
      }
    });
    return () => controller.abort();
  }, [isControlled, retryKey]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uploadId?.trim() || !sitasiBatchId.trim() || !certiportBatchId.trim()) {
      setError("Tiga ID upload dan batch wajib tersedia sebelum sinkronisasi dimulai.");
      return;
    }
    setError(null);
    setIsPending(true);
    try {
      const job = await startSynchronization({ graduationUploadId: uploadId, sitasiBatchId, certiportBatchId });
      onStarted?.(job.id);
    } catch (caughtError) {
      setError(apiMessage(caughtError, "Sinkronisasi belum dapat dimulai. Coba lagi."));
      setIsPending(false);
    }
  }

  const sitasi = activeBatchIsValid(activeBatches?.sitasi, "SITASI") ? activeBatches.sitasi : null;
  const certiport = activeBatchIsValid(activeBatches?.certiport, "CERTIPORT") ? activeBatches.certiport : null;
  return <section className="sync-selection" aria-labelledby="sync-selection-title">
    <div className="sync-selection__intro"><p className="graduation-upload__eyebrow">Persiapan sinkronisasi</p><h1 id="sync-selection-title">Pilih batch referensi</h1><p>Gunakan batch aktif yang disediakan server untuk mencocokkan data wisuda.</p></div>
    {!uploadId ? <AsyncState variant="empty" message="ID upload belum tersedia. Pilihan batch belum tersedia sebelum upload dipilih." action={<Link className="graduation-upload__link" href="/user/graduation-upload">Kembali ke upload</Link>} /> : null}
    {uploadId && state === "loading" ? <AsyncState variant="loading" message="Batch referensi aktif sedang dimuat." /> : null}
    {uploadId && state === "error" ? <AsyncState variant="error" message={error ?? "Batch referensi gagal dimuat."} action={<Button variant="secondary" onClick={() => { setError(null); setRetryKey((key) => key + 1); }}>Coba lagi</Button>} /> : null}
    {uploadId && state === "ready" && (!sitasi || !certiport) ? <AsyncState variant="empty" message="Pilihan batch belum tersedia dari server. Hubungi administrator setelah batch referensi diaktifkan." /> : null}
    {uploadId && state === "ready" && sitasi && certiport ? <form className="sync-selection__form" onSubmit={handleSubmit}>
      <fieldset className="sync-selection__fieldset"><legend>Batch aktif</legend><label className="sync-selection__field" htmlFor="sitasi-batch">SITASI</label><select id="sitasi-batch" value={sitasiBatchId} onChange={(event) => setSitasiBatchId(event.target.value)}><option value={sitasi.id}>{sitasi.period ? `${sitasi.period} · ` : ""}{sitasi.id}</option></select><label className="sync-selection__field" htmlFor="certiport-batch">CERTIPORT</label><select id="certiport-batch" value={certiportBatchId} onChange={(event) => setCertiportBatchId(event.target.value)}><option value={certiport.id}>{certiport.period ? `${certiport.period} · ` : ""}{certiport.id}</option></select></fieldset>
      <p className="sync-selection__unavailable">Pilihan batch belum tersedia untuk batch inactive sampai kontrak daftar batch disahkan.</p>
      {error ? <p className="sync-selection__error" role="alert">{error}</p> : null}<Button type="submit" loading={isPending}>Mulai sinkronisasi</Button>
    </form> : null}
  </section>;
}

const TERMINAL_STATUSES: SyncJob["status"][] = ["COMPLETED", "FAILED"];
function statusLabel(status: SyncJob["status"]): string { return { UPLOADED: "Menunggu antrean", VALIDATING: "Memvalidasi data", PROCESSING: "Sedang diproses", READY_FOR_REVIEW: "Siap ditinjau", COMPLETED: "Selesai", FAILED: "Gagal" }[status]; }

export function SyncProgressPanel({ jobId, job: suppliedJob }: { jobId: string; job?: SyncJob | null }) {
  const isControlled = suppliedJob !== undefined;
  const [job, setJob] = useState<SyncJob | null>(suppliedJob ?? null);
  const [state, setState] = useState<"loading" | "ready" | "error" | "stopped">(isControlled ? "ready" : "loading");
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [monitoring, setMonitoring] = useState(true);
  useEffect(() => {
    if (isControlled || !monitoring) return;
    const controller = new AbortController(); let interval: ReturnType<typeof setInterval> | null = null; let current = true;
    const load = async () => { try { const next = await getSyncJob(jobId, controller.signal); if (!current) return; setJob(next); setState("ready"); setError(null); if (TERMINAL_STATUSES.includes(next.status) && interval) { clearInterval(interval); interval = null; } } catch (caughtError) { if (!current || controller.signal.aborted) return; setError(apiMessage(caughtError, "Progress sinkronisasi gagal dimuat.")); setState("error"); if (interval) clearInterval(interval); } };
    void load(); interval = setInterval(() => void load(), 1500);
    return () => { current = false; if (interval) clearInterval(interval); controller.abort(); };
  }, [isControlled, jobId, monitoring, retryKey]);
  if (!jobId.trim()) return <AsyncState variant="empty" message="ID sinkronisasi belum tersedia." />;
  if (state === "loading") return <AsyncState variant="loading" message="Progress sinkronisasi sedang dimuat." />;
  if (state === "error") return <AsyncState variant="error" message={error ?? "Progress sinkronisasi gagal dimuat."} action={<Button variant="secondary" onClick={() => { setState("loading"); setMonitoring(true); setRetryKey((key) => key + 1); }}>Coba lagi</Button>} />;
  if (!job) return <AsyncState variant="empty" message="Server belum mengirim status sinkronisasi." />;
  const progress = Math.min(100, Math.max(0, job.progress)); const terminal = TERMINAL_STATUSES.includes(job.status); const tone = job.status === "COMPLETED" ? "success" : job.status === "FAILED" ? "danger" : "warning";
  const retryMonitoring = () => {
    setJob(null);
    setError(null);
    setState("loading");
    setMonitoring(true);
    setRetryKey((key) => key + 1);
  };
  return <section className="sync-progress" aria-labelledby="sync-progress-title"><div className="sync-progress__intro"><p className="graduation-upload__eyebrow">Sinkronisasi #{job.id}</p><h1 id="sync-progress-title">{job.status === "COMPLETED" ? "Sinkronisasi selesai" : job.status === "FAILED" ? "Sinkronisasi gagal" : "Progress sinkronisasi"}</h1><StatusBadge tone={tone} label={statusLabel(job.status)} /></div><div className="sync-progress__meter" aria-live="polite"><p><strong>{job.currentStage ?? statusLabel(job.status)}</strong> · {progress}%</p><progress max="100" value={progress} aria-label={`Progress sinkronisasi ${progress}%`} />{job.totalRows !== undefined && job.processedRows !== undefined ? <p>{job.processedRows} dari {job.totalRows} baris diproses.</p> : null}</div><div className="sync-progress__counts" aria-label="Ringkasan hasil sementara">{job.readyCount !== undefined ? <span>Siap: {job.readyCount}</span> : null}{job.reviewCount !== undefined ? <span>Perlu ditinjau: {job.reviewCount}</span> : null}{job.failedCount !== undefined ? <span>Gagal: {job.failedCount}</span> : null}</div>{state === "stopped" ? <p className="sync-progress__stopped" role="status">Pemantauan dihentikan. Status terakhir tetap ditampilkan.</p> : null}{job.status === "FAILED" ? <p className="sync-progress__error" role="alert">Server menandai sinkronisasi gagal. Periksa log atau ulangi pemantauan.</p> : null}{terminal && job.status === "FAILED" ? <Button variant="secondary" onClick={retryMonitoring}>Coba pantau ulang</Button> : null}{!terminal && monitoring ? <Button variant="secondary" onClick={() => { setMonitoring(false); setState("stopped"); }}>Hentikan pemantauan</Button> : null}</section>;
}
