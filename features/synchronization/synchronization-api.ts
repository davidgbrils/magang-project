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
