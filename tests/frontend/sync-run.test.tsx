import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  getActiveReferenceBatches,
  getSyncJob,
  startSynchronization,
  type ActiveReferenceBatches,
  type SyncJob,
} from "../../features/synchronization/synchronization-api";
import { ReferenceSelectionPanel, SyncProgressPanel } from "../../features/synchronization/Synchronization";

const activeBatches: ActiveReferenceBatches = {
  sitasi: { id: "sitasi-1", sourceType: "SITASI", period: "2026-09", status: "ACTIVE", isActive: true },
  certiport: { id: "certiport-1", sourceType: "CERTIPORT", period: "2026-09", status: "ACTIVE", isActive: true },
};

const queuedJob: SyncJob = {
  id: "job-1",
  status: "UPLOADED",
  currentStage: "Menunggu antrean",
  progress: 0,
  totalRows: 10,
  processedRows: 0,
  readyCount: 0,
  reviewCount: 0,
  failedCount: 0,
};

describe("synchronization API", () => {
  it("loads the server-provided active SITASI and Certiport batches", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(activeBatches), { status: 200 })));
    await expect(getActiveReferenceBatches()).resolves.toEqual(activeBatches);
    expect(fetch).toHaveBeenCalledWith("/api/reference-batches/active", expect.objectContaining({ headers: expect.any(Headers) }));
  });

  it("posts the exact sync-jobs payload only when all IDs are present", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(queuedJob), { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    await startSynchronization({ graduationUploadId: "upload-1", sitasiBatchId: "sitasi-1", certiportBatchId: "certiport-1" });
    expect(fetchMock).toHaveBeenCalledWith("/api/sync-jobs", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ graduationUploadId: "upload-1", sitasiBatchId: "sitasi-1", certiportBatchId: "certiport-1" }),
    }));
  });

  it("rejects an incomplete selection before making a request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(startSynchronization({ graduationUploadId: "", sitasiBatchId: "sitasi-1", certiportBatchId: "certiport-1" })).rejects.toThrow("Tiga ID");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads a job through the documented status endpoint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(queuedJob), { status: 200 })));
    await getSyncJob("job-1");
    expect(fetch).toHaveBeenCalledWith("/api/sync-jobs/job-1", expect.objectContaining({ headers: expect.any(Headers) }));
  });
});

describe("reference selection and sync progress states", () => {
  it("requires the upload ID and does not invent a batch when server data is absent", () => {
    const markup = renderToStaticMarkup(<ReferenceSelectionPanel uploadId={null} activeBatches={null} />);
    expect(markup).toContain("ID upload belum tersedia");
    expect(markup).toContain("Pilihan batch belum tersedia");
    expect(markup).not.toContain("sitasi-1");
  });

  it("renders the two active batches and keeps inactive list explicitly unavailable", () => {
    const markup = renderToStaticMarkup(<ReferenceSelectionPanel uploadId="upload-1" activeBatches={activeBatches} />);
    expect(markup).toContain("SITASI");
    expect(markup).toContain("CERTIPORT");
    expect(markup).toContain("2026-09");
    expect(markup).toContain("Pilihan batch belum tersedia");
  });

  it("accepts active endpoint batches when the optional isActive field is omitted", () => {
    const serverActive = {
      sitasi: { id: "sitasi-2", sourceType: "SITASI", period: "2026-10", status: "ACTIVE" },
      certiport: { id: "certiport-2", sourceType: "CERTIPORT", period: "2026-10", status: "ACTIVE" },
    } as ActiveReferenceBatches;
    const markup = renderToStaticMarkup(<ReferenceSelectionPanel uploadId="upload-1" activeBatches={serverActive} />);
    expect(markup).toContain("sitasi-2");
    expect(markup).toContain("certiport-2");
  });

  it("renders queued and processing progress with live text", () => {
    const processing: SyncJob = { ...queuedJob, status: "PROCESSING", currentStage: "Mencocokkan data", progress: 42, processedRows: 4 };
    const markup = renderToStaticMarkup(<SyncProgressPanel jobId="job-1" job={processing} />);
    expect(markup).toContain("Mencocokkan data");
    expect(markup).toContain("42%");
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("Hentikan pemantauan");
  });

  it("renders a terminal failure with a working retry button", () => {
    const failed: SyncJob = { ...queuedJob, status: "FAILED", currentStage: "Sinkronisasi gagal", progress: 32, failedCount: 2 };
    const markup = renderToStaticMarkup(<SyncProgressPanel jobId="job-1" job={failed} />);
    expect(markup).toContain("Sinkronisasi gagal");
    expect(markup).toContain("Coba pantau ulang");
    expect(markup).toContain('type="button"');
    expect(markup).not.toContain("/user/synchronization/job-1/progress");
  });

  it("renders completed state as terminal success", () => {
    const completed: SyncJob = { ...queuedJob, status: "COMPLETED", currentStage: "Selesai", progress: 100, processedRows: 10, readyCount: 8, reviewCount: 2 };
    const markup = renderToStaticMarkup(<SyncProgressPanel jobId="job-1" job={completed} />);
    expect(markup).toContain("Sinkronisasi selesai");
    expect(markup).toContain("100%");
    expect(markup).not.toContain("Hentikan pemantauan");
    expect(markup).toContain("/user/synchronization/job-1/output");
  });

  it("gives a ready-for-review job direct preview and review actions", () => {
    const ready: SyncJob = { ...queuedJob, status: "READY_FOR_REVIEW", currentStage: "Siap ditinjau", progress: 100, processedRows: 10, reviewCount: 2 };
    const markup = renderToStaticMarkup(<SyncProgressPanel jobId="job-1" job={ready} />);
    expect(markup).toContain("/user/synchronization/job-1/preview");
    expect(markup).toContain("/user/synchronization/job-1/review");
  });
});
