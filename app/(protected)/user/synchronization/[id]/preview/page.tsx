import { SyncPreviewManifestPanel } from "../../../../../../features/synchronization/SyncResults";

export default async function SyncPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SyncPreviewManifestPanel jobId={id} />;
}
