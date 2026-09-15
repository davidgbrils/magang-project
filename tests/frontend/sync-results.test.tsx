import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  generateSyncOutput,
  getSyncJobPreview,
  getSyncJobRows,
  getOutputDownload,
  normalizeSyncRowsResponse,
  reviewSyncRow,
  type SyncRow,
} from "../../features/synchronization/synchronization-api";
import {
  SyncOutputPanel,
  SyncPreviewPanel,
  SyncReviewDialog,
  SyncRowsTable,
} from "../../features/synchronization/SyncResults";

const row: SyncRow = {
  id: "row-1",
  sheetName: "Wisudawan",
  sourceRow: 12,
  nim: "20260001",
  nama: "Dina Pratama",
  resultStatus: "NEEDS_REVIEW",
  mosValue: "MOS 2019",
  titleValue: "S.Kom.",
  reasonCodes: ["NAME_ONLY_MATCH"],
};

describe("sync results API", () => {
  it("builds documented row filters and pagination", async () => {
    const response = { items: [row], page: 2, pageSize: 10, total: 1, totalPages: 1 };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await getSyncJobRows("job/1", { status: "NEEDS_REVIEW", search: "Dina", page: 2, pageSize: 10 });
    expect(fetchMock).toHaveBeenCalledWith("/api/sync-jobs/job%2F1/rows?status=NEEDS_REVIEW&search=Dina&page=2&pageSize=10", expect.anything());
  });

  it("rejects the unspecified pagination payload at the API boundary", () => {
    expect(() => normalizeSyncRowsResponse({ data: { items: [row] } })).toThrow("Format daftar baris");
  });

  it("loads preview changes and submits the exact review payload", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ changes: [row] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...row, resultStatus: "READY" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getSyncJobPreview("job-1")).resolves.toEqual({ changes: [row] });
    await reviewSyncRow("row-1", { decision: "CONFIRMED", note: "Dikonfirmasi operator" });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/sync-rows/row-1/review", expect.objectContaining({ method: "POST", body: JSON.stringify({ decision: "CONFIRMED", note: "Dikonfirmasi operator" }) }));
  });

  it("generates output and keeps the authorized download URL transient", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "output-1", status: "QUEUED", fileName: "hasil.xlsx" }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: "https://download.example/once", expiresAt: "2026-09-15T12:00:00Z" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(generateSyncOutput("job-1")).resolves.toEqual({ id: "output-1", status: "QUEUED", fileName: "hasil.xlsx" });
    await expect(getOutputDownload("output-1")).resolves.toEqual({ url: "https://download.example/once", expiresAt: "2026-09-15T12:00:00Z" });
  });

  it("surfaces forbidden and failed download responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Akses ditolak", requestId: "req-1" } }), { status: 403 })));
    await expect(getOutputDownload("output-1")).rejects.toThrow("Akses ditolak");
  });
});

describe("sync results states and accessible review", () => {
  it("renders exact rows with horizontal overflow and text status", () => {
    const markup = renderToStaticMarkup(<SyncRowsTable rows={[row]} />);
    expect(markup).toContain("Dina Pratama");
    expect(markup).toContain("Perlu ditinjau");
    expect(markup).toContain("sync-results__table-region");
    expect(markup).toContain("NAME_ONLY_MATCH");
  });

  it("renders filter controls, submitted search, and pagination state", () => {
    const markup = renderToStaticMarkup(<SyncPreviewPanel jobId="job-1" rows={[row]} page={2} pageSize={10} total={21} />);
    expect(markup).toContain("Cari NIM atau nama");
    expect(markup).toContain('name="status"');
    expect(markup).toContain("Halaman 2 dari 3");
    expect(markup).toContain("21 baris");
  });

  it("renders a keyboard-operable review dialog with a close action", () => {
    const markup = renderToStaticMarkup(<SyncReviewDialog row={row} onClose={() => undefined} />);
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain("Konfirmasi");
    expect(markup).toContain("Tutup review");
  });

  it("renders output generation and empty/error states without inventing output", () => {
    const empty = renderToStaticMarkup(<SyncOutputPanel jobId="job-1" output={null} />);
    expect(empty).toContain("Belum ada output");
    expect(empty).toContain("Generate output");
    expect(empty).not.toContain("hasil-wisuda.xlsx");
    const unavailable = renderToStaticMarkup(<SyncOutputPanel jobId="" output={null} />);
    expect(unavailable).toContain("ID sinkronisasi belum tersedia");
    expect(unavailable).not.toContain("Generate output");
  });

  it("renders a normal transient download link after authorization", () => {
    const markup = renderToStaticMarkup(<SyncOutputPanel jobId="job-1" output={{ id: "output-1", status: "COMPLETED", fileName: "hasil.xlsx" }} authorizedDownload={{ url: "https://download.example/once", expiresAt: "2026-09-15T12:00:00Z" }} />);
    expect(markup).toContain('href="https://download.example/once"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
    expect(markup).not.toContain("window.open");
  });
});
