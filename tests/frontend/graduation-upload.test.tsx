import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { GraduationUploadPanel, ValidationSummary } from "../../features/graduation/GraduationUpload";
import { getValidationReport, isAcceptedWorkbookFile, uploadGraduationWorkbook, type ValidationReport } from "../../features/graduation/graduation-api";

const xlsxFile = { name: "wisuda-september.xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 4096 } as File;

describe("graduation workbook upload", () => {
  it("accepts an XLSX workbook by its extension and MIME type", () => {
    expect(isAcceptedWorkbookFile(xlsxFile)).toBe(true);
  });
  it("rejects a non-XLSX file before it is submitted", () => {
    expect(isAcceptedWorkbookFile({ name: "wisuda.csv", type: "text/csv", size: 128 } as File)).toBe(false);
  });
  it("surfaces the server error when workbook upload fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: "INVALID_WORKBOOK", message: "Berkas tidak dapat dibaca." } }), { status: 422, headers: { "Content-Type": "application/json" } })));
    await expect(uploadGraduationWorkbook(xlsxFile)).rejects.toMatchObject({ status: 422, message: "Berkas tidak dapat dibaca." });
  });
  it("keeps a 202 upload in a validating state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "upload-1", status: "VALIDATING", sheetCount: 14 }), { status: 202, headers: { "Content-Type": "application/json" } })));
    const upload = await uploadGraduationWorkbook(xlsxFile);
    const markup = renderToStaticMarkup(<GraduationUploadPanel upload={upload} />);
    expect(upload.status).toBe("VALIDATING");
    expect(markup).toContain("Validasi sedang diproses");
    expect(markup).toContain('aria-live="polite"');
  });
  it("renders the server-provided fourteen-sheet validation summary", () => {
    const report: ValidationReport = { status: "INVALID", sheets: Array.from({ length: 14 }, (_, index) => ({ name: `Sheet ${index + 1}`, status: index === 0 ? "INVALID" : "VALID", rowCount: index + 10, columns: ["NIM", "Nama"] })), errors: ["Sheet 1: Kolom NIM wajib ada."] };
    const markup = renderToStaticMarkup(<ValidationSummary report={report} />);
    expect(markup).toContain("14 sheet ditemukan");
    expect(markup).toContain("Sheet 1");
    expect(markup).toContain("10 baris");
    expect(markup).toContain("NIM, Nama");
    expect(markup).toContain("Sheet 1: Kolom NIM wajib ada.");
  });
  it("requests validation through the documented upload endpoint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "VALID", sheets: [], errors: [] }), { status: 200, headers: { "Content-Type": "application/json" } })));
    await getValidationReport("upload-1");
    expect(fetch).toHaveBeenCalledWith("/api/graduation-uploads/upload-1/validation", expect.objectContaining({ headers: expect.any(Headers) }));
  });
});
