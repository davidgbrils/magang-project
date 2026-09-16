"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { AsyncState } from "../../../../components/ui/AsyncState";
import { FileValidationView } from "../../../../features/graduation/GraduationUpload";

function FileValidationContent() {
  const searchParams = useSearchParams();
  return <FileValidationView uploadId={searchParams.get("uploadId")} />;
}

export default function FileValidationPage() {
  return (
    <Suspense fallback={<AsyncState variant="loading" message="Halaman validasi sedang dimuat." />}>
      <FileValidationContent />
    </Suspense>
  );
}
