import { request } from "../../lib/api-client";

export type GraduationUploadStatus = "UPLOADED" | "VALIDATING" | "VALID" | "INVALID" | "FAILED";

export type GraduationUpload = {
  id: string;
  status: GraduationUploadStatus;
  sheetCount: number;
  studentCount?: number;
};

export type ValidationSheet = {
  name: string;
  status?: string;
  rowCount?: number;
  columns?: string[];
};

export type ValidationReport = {
  status: string;
  sheets: ValidationSheet[];
  errors: string[];
};

const XLSX_EXTENSION = ".xlsx";
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function isAcceptedWorkbookFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(XLSX_EXTENSION) || file.type === XLSX_MIME;
}

export function uploadGraduationWorkbook(file: File): Promise<GraduationUpload> {
  const body = new FormData();
  body.append("file", file);
  return request<GraduationUpload>("/api/graduation-uploads", { method: "POST", body });
}

export function getValidationReport(uploadId: string): Promise<ValidationReport> {
  if (!uploadId.trim()) return Promise.reject(new Error("ID upload tidak ditemukan."));
  return request<ValidationReport>(`/api/graduation-uploads/${encodeURIComponent(uploadId)}/validation`);
}
