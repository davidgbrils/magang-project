import { SyncPreviewPanel } from "../../../../../../features/synchronization/SyncResults";

export default async function SyncReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SyncPreviewPanel jobId={id} />;
}
