"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { AsyncState } from "../../../../components/ui/AsyncState";
import { ReferenceSelectionPanel } from "../../../../features/synchronization/Synchronization";

function ReferenceSelectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  return <ReferenceSelectionPanel uploadId={searchParams.get("uploadId")} onStarted={(jobId) => router.push(`/user/synchronization/${encodeURIComponent(jobId)}/progress`)} />;
}

export default function ReferenceSelectionPage() {
  return <Suspense fallback={<AsyncState variant="loading" message="Halaman pilihan batch sedang dimuat." />}><ReferenceSelectionContent /></Suspense>;
}
