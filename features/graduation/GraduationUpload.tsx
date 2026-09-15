"use client";

import Link from "next/link";
import React, { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AsyncState } from "../../components/ui/AsyncState";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ApiClientError } from "../../lib/api-client";
import { getValidationReport, isAcceptedWorkbookFile, uploadGraduationWorkbook, type GraduationUpload, type ValidationReport } from "./graduation-api";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function uploadStatusLabel(status: GraduationUpload["status"]): string {
  return { UPLOADED: "Berkas diterima", VALIDATING: "Sedang divalidasi", VALID: "Berkas valid", INVALID: "Berkas perlu diperbaiki", FAILED: "Upload gagal" }[status];
}

export function GraduationUploadPanel({ upload: initialUpload }: { upload?: GraduationUpload | null }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [upload, setUpload] = useState<GraduationUpload | null>(initialUpload ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function selectFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!isAcceptedWorkbookFile(file)) {
      setSelectedFile(null);
      setError("Format berkas tidak didukung. Pilih workbook .xlsx.");
      return;
    }
    setSelectedFile(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      setError("Pilih berkas .xlsx sebelum mengirim.");
      inputRef.current?.focus();
      return;
    }
    setIsPending(true);
    setError(null);
    try {
      setUpload(await uploadGraduationWorkbook(selectedFile));
    } catch (caughtError) {
      const message = caughtError instanceof ApiClientError ? caughtError.message : "Upload berkas gagal. Periksa koneksi lalu coba lagi.";
      setError(message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="graduation-upload" aria-labelledby="graduation-upload-title">
      <div className="graduation-upload__intro">
        <p className="graduation-upload__eyebrow">Persiapan sinkronisasi</p>
        <h1 id="graduation-upload-title">Upload berkas wisuda</h1>
        <p>Pilih workbook wisuda berformat XLSX untuk memulai pemeriksaan struktur dan kolom.</p>
      </div>
      <form className="graduation-upload__form" onSubmit={handleSubmit}>
        <div className="graduation-upload__dropzone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <label htmlFor="graduation-workbook">Berkas workbook wisuda (.xlsx)</label>
          <input ref={inputRef} id="graduation-workbook" name="file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleInputChange} />
          <p className="graduation-upload__hint">Seret berkas ke area ini atau pilih dari perangkat.</p>
          {selectedFile ? <p className="graduation-upload__file" aria-live="polite"><strong>{selectedFile.name}</strong> · {formatFileSize(selectedFile.size)}</p> : null}
        </div>
        {error ? <p className="graduation-upload__error" role="alert">{error}</p> : null}
        <Button type="submit" loading={isPending} disabled={!selectedFile && !isPending}>Kirim berkas</Button>
      </form>
      {upload ? (
        <div className="graduation-upload__result" aria-live="polite">
          <StatusBadge tone={upload.status === "VALID" ? "success" : upload.status === "FAILED" || upload.status === "INVALID" ? "danger" : "warning"} label={uploadStatusLabel(upload.status)} />
          {upload.status === "VALIDATING" ? <p>Validasi sedang diproses. Buka hasil validasi untuk melihat pembaruan.</p> : null}
          <p>{upload.sheetCount} sheet terdeteksi pada berkas.</p>
          {upload.studentCount !== undefined ? <p>{upload.studentCount} baris wisudawan terdeteksi.</p> : null}
          <Link className="graduation-upload__link" href={`/user/file-validation?uploadId=${encodeURIComponent(upload.id)}`}>Buka hasil validasi</Link>
        </div>
      ) : null}
    </section>
  );
}

export function ValidationSummary({ report }: { report: ValidationReport }) {
  return (
    <section className="validation-summary" aria-labelledby="validation-summary-title">
      <div className="validation-summary__intro">
        <p className="graduation-upload__eyebrow">Pemeriksaan workbook</p>
        <h1 id="validation-summary-title">Validasi file wisuda</h1>
        <StatusBadge tone={report.status === "VALID" ? "success" : "danger"} label={report.status} />
        <p aria-live="polite">{report.sheets.length} sheet ditemukan dari respons server.</p>
      </div>
      {report.sheets.length ? (
        <div className="validation-summary__sheets">
          {report.sheets.map((sheet) => (
            <article className="validation-sheet" key={sheet.name}>
              <div className="validation-sheet__heading">
                <h2>{sheet.name}</h2>
                {sheet.status ? <StatusBadge tone={sheet.status === "VALID" ? "success" : "danger"} label={sheet.status} /> : null}
              </div>
              {sheet.rowCount !== undefined ? <p>{sheet.rowCount} baris</p> : null}
              {sheet.columns?.length ? <p>Kolom terdeteksi: {sheet.columns.join(", ")}</p> : null}
            </article>
          ))}
        </div>
      ) : <AsyncState variant="empty" message="Server belum mengirimkan ringkasan sheet." />}
      {report.errors.length ? <div className="validation-summary__errors" role="alert" aria-labelledby="validation-errors-title"><h2 id="validation-errors-title">Perlu diperbaiki</h2><ul>{report.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}
    </section>
  );
}

export function FileValidationView({ uploadId }: { uploadId: string | null }) {
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">(uploadId ? "loading" : "empty");
  const [report, setReport] = useState<ValidationReport | null>(null);

  React.useEffect(() => {
    if (!uploadId) return;
    let current = true;
    getValidationReport(uploadId).then(
      (nextReport) => { if (current) { setReport(nextReport); setState("ready"); } },
      () => { if (current) setState("error"); },
    );
    return () => { current = false; };
  }, [uploadId]);

  if (state === "empty") return <AsyncState variant="empty" message="ID upload belum tersedia. Buka halaman ini dari hasil upload." action={<Link className="graduation-upload__link" href="/user/graduation-upload">Kembali ke upload</Link>} />;
  if (state === "loading") return <AsyncState variant="loading" message="Ringkasan validasi sedang dimuat." />;
  if (state === "error" || !report) return <AsyncState variant="error" message="Ringkasan validasi gagal dimuat. Coba buka ulang halaman ini." />;
  return <ValidationSummary report={report} />;
}
