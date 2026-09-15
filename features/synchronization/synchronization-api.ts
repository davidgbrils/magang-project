import { request } from "../../lib/api-client";

export type ReferenceBatchSource = "SITASI" | "CERTIPORT";

export type ReferenceBatch = {
  id: string;
  sourceType: ReferenceBatchSource;
  period?: string;
  status: string;
  isActive?: boolean;
};

export type ActiveReferenceBatches = {
  sitasi?: ReferenceBatch | null;
  certiport?: ReferenceBatch | null;
};

export type SyncJobStatus = "UPLOADED" | "VALIDATING" | "PROCESSING" | "READY_FOR_REVIEW" | "COMPLETED" | "FAILED";

export type SyncJob = {
  id: string;
  status: SyncJobStatus;
  currentStage?: string;
  progress: number;
  totalRows?: number;
  processedRows?: number;
  readyCount?: number;
  reviewCount?: number;
  failedCount?: number;
};

export type SyncRowStatus =
  | "READY"
  | "NEEDS_REVIEW"
  | "NOT_FOUND_IN_SITASI"
  | "SITASI_NOT_GRADUATED"
  | "CERTIPORT_NOT_FOUND"
  | "DUPLICATE_NIM"
  | "EXCLUDED_MCF_PROGRAM"
  | "FAILED";

export type ReviewStatus = "CONFIRMED" | "REJECTED" | "SKIPPED";

export type SyncRow = {
  id: string;
  sheetName: string;
  sourceRow: number;
  nim: string;
  nama: string;
  resultStatus: SyncRowStatus;
  mosValue: string | null;
  titleValue: string | null;
  reasonCodes: string[];
};

export type SyncRowsQuery = {
  status?: SyncRowStatus;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type SyncRowsResponse = {
  items: SyncRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
};

export type SyncPreview = { changes: SyncRow[] };

export type GeneratedOutput = {
  id: string;
  status: string;
  fileName: string;
};

export type OutputDownload = {
  url: string;
  expiresAt: string;
};

export type ReviewSyncRowPayload = {
  decision: ReviewStatus;
  note?: string;
};

export type StartSynchronizationPayload = {
  graduationUploadId: string;
  sitasiBatchId: string;
  certiportBatchId: string;
};

export function getActiveReferenceBatches(signal?: AbortSignal): Promise<ActiveReferenceBatches> {
  return request<ActiveReferenceBatches>("/api/reference-batches/active", { signal });
}

export function startSynchronization(payload: StartSynchronizationPayload): Promise<SyncJob> {
  if (!payload.graduationUploadId.trim() || !payload.sitasiBatchId.trim() || !payload.certiportBatchId.trim()) {
    return Promise.reject(new Error("Tiga ID upload dan batch wajib tersedia sebelum sinkronisasi dimulai."));
  }

  return request<SyncJob>("/api/sync-jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getSyncJob(jobId: string, signal?: AbortSignal): Promise<SyncJob> {
  if (!jobId.trim()) return Promise.reject(new Error("ID sinkronisasi belum tersedia."));
  return request<SyncJob>(`/api/sync-jobs/${encodeURIComponent(jobId)}`, { signal });
}

function requireIdentifier(value: string, message: string): void {
  if (!value.trim()) throw new Error(message);
}

export function getSyncJobRows(jobId: string, query: SyncRowsQuery = {}, signal?: AbortSignal): Promise<SyncRowsResponse> {
  requireIdentifier(jobId, "ID sinkronisasi belum tersedia.");
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.pageSize !== undefined) params.set("pageSize", String(query.pageSize));
  const suffix = params.toString();
  return request<SyncRowsResponse>(`/api/sync-jobs/${encodeURIComponent(jobId)}/rows${suffix ? `?${suffix}` : ""}`, { signal });
}

export function getSyncJobPreview(jobId: string, signal?: AbortSignal): Promise<SyncPreview> {
  requireIdentifier(jobId, "ID sinkronisasi belum tersedia.");
  return request<SyncPreview>(`/api/sync-jobs/${encodeURIComponent(jobId)}/preview`, { signal });
}

export function reviewSyncRow(rowId: string, payload: ReviewSyncRowPayload, signal?: AbortSignal): Promise<SyncRow> {
  requireIdentifier(rowId, "ID baris belum tersedia.");
  if (!payload.decision) return Promise.reject(new Error("Keputusan review wajib dipilih."));
  const body: ReviewSyncRowPayload = payload.note?.trim()
    ? { decision: payload.decision, note: payload.note.trim() }
    : { decision: payload.decision };
  return request<SyncRow>(`/api/sync-rows/${encodeURIComponent(rowId)}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
}

export function generateSyncOutput(jobId: string, signal?: AbortSignal): Promise<GeneratedOutput> {
  requireIdentifier(jobId, "ID sinkronisasi belum tersedia.");
  return request<GeneratedOutput>(`/api/sync-jobs/${encodeURIComponent(jobId)}/generate-output`, {
    method: "POST",
    signal,
  });
}

export function getOutputDownload(outputId: string, signal?: AbortSignal): Promise<OutputDownload> {
  requireIdentifier(outputId, "ID output belum tersedia.");
  return request<OutputDownload>(`/api/outputs/${encodeURIComponent(outputId)}/download`, { signal });
}
